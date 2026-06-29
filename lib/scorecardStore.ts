import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";

// ============ Types ============

export type IndicatorMetadata = {
  Indicator_Code: string;
  Indicator_Name: string;
  Indicator_Definition: string;
  Indicator_Source: string;
  DEC_Indicator_Code: string;
  Indicator_Type: string;
  Unit_Measure: string;
  Indicator_Vertical_Name: string;
  Indicator_Outcome_Area_Code: string;
  Indicator_Outcome_Area_Name: string;
  Indicator_Outcome_Area_Description: string;
  Inicator_Methodology_Notes_URL: string; // sic: typo lives in the source JSON
  indicator_note: string;
};

export type IndicatorAggregate = {
  Indicator_Code: string;
  Indicator_Name: string;
  Indicator_Type: string;
  Geography_Type: string;
  Geography_Code: string;
  Geography_Name: string;
  Time_Period: string | number;
  [k: string]: unknown;
};

export type IndicatorProject = {
  Project_ID: string;
  Project_Name: string;
  CountryEconomy_Code: string;
  CountryEconomy_Name: string;
  Approval_Date: string | null;
  Closing_Date: string | null;
  Reporting_FY?: number;
  [k: string]: unknown;
};

export type IndicatorData = {
  indicator_type: string;
  aggregates: IndicatorAggregate[];
  projects?: IndicatorProject[];
};

// ============ Paths ============

const DATA_DIR = path.join(process.cwd(), "Scorecard Data");
const METADATA_PATH = path.join(DATA_DIR, "scorecard_metadata.json");
const DATA_PATH = path.join(DATA_DIR, "scorecard_data.json");

// ============ Loose-JSON parse ============
//
// Source files emit bare `NaN`/`Infinity` literals (Python json.dump default).
// Strict JSON.parse rejects them, so replace them with `null` when they appear
// as a JSON value — preceded by `:` / `,` / `[` and followed by `,` / `]` / `}`,
// allowing whitespace. Strings carry their own quotes and are never touched.

function parseLooseJson<T>(text: string): T {
  const cleaned = text.replace(
    /(?<=[:,\[]\s*)(NaN|-?Infinity)(?=\s*[,\]}])/g,
    "null",
  );
  return JSON.parse(cleaned) as T;
}

// ============ Eager: metadata ============

const metadataList: IndicatorMetadata[] = parseLooseJson<IndicatorMetadata[]>(
  fs.readFileSync(METADATA_PATH, "utf-8"),
);
const metadataByCode = new Map(metadataList.map((m) => [m.Indicator_Code, m]));

export function getAllMetadata(): IndicatorMetadata[] {
  return metadataList;
}

export function getMetadataByCode(code: string): IndicatorMetadata | undefined {
  return metadataByCode.get(code);
}

export function listIndicatorCodes(): string[] {
  return metadataList.map((m) => m.Indicator_Code);
}

// ============ Lazy: per-indicator data ============

type ByteRange = { start: number; length: number };

let offsetIndex: Map<string, ByteRange> | null = null;
let indexBuildPromise: Promise<Map<string, ByteRange>> | null = null;
const parsedCache = new Map<string, IndicatorData>();
const inFlightReads = new Map<string, Promise<IndicatorData | undefined>>();

async function ensureIndex(): Promise<Map<string, ByteRange>> {
  if (offsetIndex) return offsetIndex;
  if (!indexBuildPromise) {
    indexBuildPromise = buildOffsetIndex(DATA_PATH).then((idx) => {
      offsetIndex = idx;
      return idx;
    });
  }
  return indexBuildPromise;
}

export async function getIndicatorData(
  code: string,
): Promise<IndicatorData | undefined> {
  const cached = parsedCache.get(code);
  if (cached) return cached;
  const inflight = inFlightReads.get(code);
  if (inflight) return inflight;

  const p = (async () => {
    const idx = await ensureIndex();
    const range = idx.get(code);
    if (!range) return undefined;
    const fd = await fsp.open(DATA_PATH, "r");
    try {
      const buf = Buffer.allocUnsafe(range.length);
      await fd.read(buf, 0, range.length, range.start);
      const parsed = parseLooseJson<IndicatorData>(buf.toString("utf-8"));
      parsedCache.set(code, parsed);
      return parsed;
    } finally {
      await fd.close();
    }
  })();

  inFlightReads.set(code, p);
  try {
    return await p;
  } finally {
    inFlightReads.delete(code);
  }
}

// ============ Offset-index scanner ============
//
// Streams the file once, never holds more than one read buffer in memory.
// Records `{start, length}` byte ranges for each top-level entry of the
// outer `{ "<code>": <value>, ... }` object. Uses a small state machine
// over the byte stream that tracks JSON string + container depth.

async function buildOffsetIndex(
  filePath: string,
): Promise<Map<string, ByteRange>> {
  const index = new Map<string, ByteRange>();
  const fd = await fsp.open(filePath, "r");
  try {
    const BUFSIZE = 256 * 1024;
    const buf = Buffer.allocUnsafe(BUFSIZE);
    let filePos = 0;

    let inString = false;
    let escape = false;
    let depth = -1;

    type Phase =
      | "wantOuter"
      | "wantKey"
      | "inKey"
      | "afterKey"
      | "wantValue"
      | "inContainer"
      | "inPrimitive"
      | "wantSep"
      | "done";
    let phase: Phase = "wantOuter";

    const keyChars: number[] = [];
    let pendingKey: string | null = null;
    let valueStart = -1;

    const finalize = (endExclusive: number) => {
      if (pendingKey !== null && valueStart >= 0) {
        index.set(pendingKey, {
          start: valueStart,
          length: endExclusive - valueStart,
        });
      }
      pendingKey = null;
      valueStart = -1;
    };

    outer: while (true) {
      const { bytesRead } = await fd.read(buf, 0, BUFSIZE, filePos);
      if (bytesRead === 0) break;

      for (let i = 0; i < bytesRead; i++) {
        const b = buf[i];
        const absPos = filePos + i;

        if (inString) {
          if (escape) {
            escape = false;
            if (phase === "inKey") keyChars.push(b);
            continue;
          }
          if (b === 0x5c) {
            escape = true;
            if (phase === "inKey") keyChars.push(b);
            continue;
          }
          if (b === 0x22) {
            inString = false;
            if (phase === "inKey") {
              pendingKey = Buffer.from(keyChars).toString("utf-8");
              keyChars.length = 0;
              phase = "afterKey";
            }
            continue;
          }
          if (phase === "inKey") keyChars.push(b);
          continue;
        }

        if (b === 0x22) {
          inString = true;
          if (phase === "wantKey") {
            phase = "inKey";
            keyChars.length = 0;
          } else if (phase === "wantValue") {
            valueStart = absPos;
            phase = "inPrimitive";
          }
          continue;
        }

        if (b === 0x20 || b === 0x09 || b === 0x0a || b === 0x0d) continue;

        switch (phase) {
          case "wantOuter":
            if (b === 0x7b) {
              depth = 0;
              phase = "wantKey";
            }
            break;

          case "afterKey":
            if (b === 0x3a) phase = "wantValue";
            break;

          case "wantValue":
            if (b === 0x7b || b === 0x5b) {
              valueStart = absPos;
              depth = 1;
              phase = "inContainer";
            } else {
              valueStart = absPos;
              phase = "inPrimitive";
            }
            break;

          case "inContainer":
            if (b === 0x7b || b === 0x5b) depth++;
            else if (b === 0x7d || b === 0x5d) {
              depth--;
              if (depth === 0) {
                finalize(absPos + 1);
                phase = "wantSep";
              }
            }
            break;

          case "inPrimitive":
            if (b === 0x2c) {
              finalize(absPos);
              phase = "wantKey";
            } else if (b === 0x7d) {
              finalize(absPos);
              depth = -1;
              phase = "done";
            }
            break;

          case "wantSep":
            if (b === 0x2c) phase = "wantKey";
            else if (b === 0x7d) {
              depth = -1;
              phase = "done";
            }
            break;

          case "done":
          case "wantKey":
          case "inKey":
            break;
        }

        if ((phase as Phase) === "done") break outer;
      }
      filePos += bytesRead;
    }

    if (phase !== "done") {
      throw new Error(
        `scorecard_data.json scan ended in unexpected state: ${phase}`,
      );
    }
  } finally {
    await fd.close();
  }
  return index;
}
