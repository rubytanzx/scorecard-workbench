# IDA Scorecard — Claude Code Instructions

This project builds the IDA Scorecard for the WBG Corporate Scorecard FY24-FY30.

## Context loading rule

Do not load all context files by default. Only read the relevant file from `/context` when the task requires it.

## When to read which file

- Project purpose and scorecard structure: `context/scorecard-overview.md`
- XLSX schemas and data-column differences: `context/schemas.md`
- Indicator/file lookup: `context/xlsx-inventory.md`
- PDF methodology-note lookup: `context/pdf-inventory.md`
- Data methodology and filters: `context/methodology-rules.md`
- FY25 headline values: `context/fy25-headline-results.md`
- Pandas query examples: `context/pandas-patterns.md`
- AI answer layout and personas: `context/response-structure.md`
- UI styling: `context/design-system.md`
- Scorecard narrative links: `context/narrative-urls.md`

## Critical reminders

- Results files use `Achieved_Results` / `Expected_Results`.
- Context and Vision files use `Value`.
- Results country rows use `COUNTRY`; Context/Vision country rows use `ECONOMY`.
- Never mix Results schema with Context/Vision schema.
- Never sum across indicators without checking `Double_Counting_Flag`.
- FY25 date is `2025-06-30`.
- Metadata file: `IDA_Scorecard_Metadata_1.xlsx`, sheet `Result`, is the master catalogue.

## File loading order for data tasks

1. Read `IDA_Scorecard_Metadata_1.xlsx` (Scorecard Metadata) first for indicator catalogue.
2. Read the relevant Results file (`CSC_RES_*.xlsx`) using Schema A. Use `context/xlsx-inventory.md` to look up the Short Label → filename mapping (e.g. "HNP Services" → `CSC_RES_HEA_SERV.xlsx`).
3. Read the relevant Context or Vision file using Schema B. Short Labels are also in `context/xlsx-inventory.md` (e.g. "Electricity Access Context" → `EG_ELC_ACCS_ZS.xlsx`).
4. Read the relevant PDF methodology note before making methodology claims.
