// Mali sub-national map components — rendered in the right-panel overlay
// when the beneficiary-geo flow progresses to cercle or poverty steps.

export const MALI_PATH =
  "M 28,22 L 100,8 L 165,6 L 208,10 L 238,15 L 252,52 L 256,95 L 244,130 L 220,155 L 205,180 L 198,205 L 180,228 L 155,240 L 122,240 L 90,230 L 65,215 L 40,195 L 16,158 L 8,118 L 10,78 L 18,45 Z";

const YOUWAROU_INDICATORS = [
  "Social Safety Net programmes",
  "Primary education completion",
  "Child stunting reduction",
  "Maternal health services",
  "Access to clean water",
  "Rural road connectivity",
  "Mobile broadband coverage",
  "Agricultural productivity",
  "Land titling",
  "Electricity access",
];

const POVERTY_DOTS = [
  // High poverty, few beneficiaries (brown)
  { x: 215, y: 68,  r: 12, type: "gap",   label: "Kidal" },
  { x: 200, y: 110, r: 10, type: "gap",   label: "Gao" },
  { x: 185, y: 145, r: 9,  type: "gap",   label: undefined },
  { x: 140, y: 125, r: 8,  type: "gap",   label: undefined },
  { x: 115, y: 105, r: 10, type: "gap",   label: "Tombouctou" },
  { x: 152, y: 148, r: 7,  type: "gap",   label: undefined },
  // SSN beneficiaries (blue)
  { x: 168, y: 162, r: 16, type: "benef", label: "Youwarou" },
  { x: 130, y: 190, r: 18, type: "benef", label: "Ségou" },
  { x: 90,  y: 175, r: 14, type: "benef", label: "Kolokani" },
  { x: 80,  y: 195, r: 10, type: "benef", label: "Bamako" },
  { x: 162, y: 178, r: 9,  type: "benef", label: "Mopti" },
  { x: 55,  y: 188, r: 8,  type: "benef", label: "Kayes" },
];

export function MaliCercleMap() {
  return (
    <div style={{ background: "#F8FAFC", borderRadius: 12, border: "1px solid #E2E8F0", overflow: "hidden" }}>
      <div style={{ padding: "12px 16px 4px", fontSize: 12, fontWeight: 600, color: "#374151" }}>
        Social Safety Net beneficiary concentration · Mali FY25
      </div>
      <svg viewBox="0 0 264 255" style={{ width: "100%", display: "block" }}>
        <path d={MALI_PATH} fill="#DBEAFE" stroke="#93C5FD" strokeWidth={1.5} />

        {/* Kolokani */}
        <circle cx={90} cy={175} r={18} fill="#3B82F6" fillOpacity={0.18} stroke="#3B82F6" strokeWidth={1.5} />
        <text x={90} y={172} textAnchor="middle" fontSize={8} fontWeight="700" fill="#1D4ED8">Kolokani</text>
        <text x={90} y={181} textAnchor="middle" fontSize={7} fill="#2563EB">38K beneficiaries</text>

        {/* Ségou */}
        <circle cx={130} cy={190} r={22} fill="#3B82F6" fillOpacity={0.18} stroke="#3B82F6" strokeWidth={1.5} />
        <text x={130} y={187} textAnchor="middle" fontSize={8} fontWeight="700" fill="#1D4ED8">Ségou</text>
        <text x={130} y={196} textAnchor="middle" fontSize={7} fill="#2563EB">52K beneficiaries</text>

        {/* Youwarou */}
        <circle cx={168} cy={162} r={20} fill="#7C3AED" fillOpacity={0.15} stroke="#7C3AED" strokeWidth={2} />
        <text x={168} y={159} textAnchor="middle" fontSize={8} fontWeight="700" fill="#4C1D95">Youwarou</text>
        <text x={168} y={168} textAnchor="middle" fontSize={7} fill="#6D28D9">★ 10 indicators</text>

        {/* Other towns */}
        <circle cx={80} cy={197} r={4} fill="#9CA3AF" />
        <text x={72} y={208} fontSize={7} fill="#6B7280">Bamako</text>
        <circle cx={162} cy={179} r={3.5} fill="#9CA3AF" />
        <text x={155} y={190} fontSize={7} fill="#6B7280">Mopti</text>
        <circle cx={122} cy={108} r={3} fill="#9CA3AF" />
        <text x={108} y={118} fontSize={7} fill="#6B7280">Tombouctou</text>
        <circle cx={210} cy={118} r={3} fill="#9CA3AF" />
        <text x={198} y={128} fontSize={7} fill="#6B7280">Gao</text>
      </svg>
      <div style={{ display: "flex", gap: 16, padding: "6px 16px 12px", fontSize: 11, color: "#6B7280", flexWrap: "wrap" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#3B82F6", border: "1.5px solid #3B82F6", display: "inline-block" }} />
          Top SSN cercles
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#7C3AED", border: "2px solid #7C3AED", display: "inline-block" }} />
          Detail view: Youwarou
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#9CA3AF", display: "inline-block" }} />
          Other towns
        </span>
      </div>
    </div>
  );
}

export function YouwarouDetailCard() {
  return (
    <div style={{ background: "#FAF5FF", border: "1px solid #DDD6FE", borderRadius: 12, padding: "14px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 14 }}>★</span>
        <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: "#3B0764" }}>Youwarou Cercle — 10 scorecard indicators active</p>
      </div>
      <p style={{ margin: "0 0 10px", fontSize: 12.5, color: "#374151", lineHeight: 1.6 }}>
        Youwarou (Mopti region) has the highest concentration of active IDA Scorecard indicators in Mali, making it a key integration hub for WBG programming. Its remote location near the Niger River Inland Delta creates both high vulnerability and complex delivery logistics.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px 12px" }}>
        {YOUWAROU_INDICATORS.map((ind, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 5, fontSize: 11.5, color: "#4C1D95" }}>
            <span style={{ marginTop: 2, flexShrink: 0, color: "#7C3AED" }}>●</span>
            <span>{ind}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MaliPovertyDotMap() {
  return (
    <div style={{ background: "#FFFBF5", borderRadius: 12, border: "1px solid #FDE68A", overflow: "hidden" }}>
      <div style={{ padding: "12px 16px 4px", fontSize: 12, fontWeight: 600, color: "#374151" }}>
        Beneficiary reach vs. poverty concentration · Mali FY25
      </div>
      <svg viewBox="0 0 264 255" style={{ width: "100%", display: "block" }}>
        <path d={MALI_PATH} fill="#FEFCE8" stroke="#D1D5DB" strokeWidth={1} />

        {POVERTY_DOTS.filter(d => d.type === "gap").map((d, i) => (
          <g key={i}>
            <circle cx={d.x} cy={d.y} r={d.r} fill="#92400E" fillOpacity={0.55} />
            {d.label && <text x={d.x} y={d.y + d.r + 9} textAnchor="middle" fontSize={7} fill="#78350F">{d.label}</text>}
          </g>
        ))}

        {POVERTY_DOTS.filter(d => d.type === "benef").map((d, i) => (
          <g key={i}>
            <circle cx={d.x} cy={d.y} r={d.r} fill="#1D4ED8" fillOpacity={0.55} />
            {d.label && <text x={d.x} y={d.y + d.r + 9} textAnchor="middle" fontSize={7} fill="#1E40AF">{d.label}</text>}
          </g>
        ))}

        <line x1={155} y1={90} x2={168} y2={115} stroke="#92400E" strokeWidth={1} strokeDasharray="3,2" />
        <text x={115} y={85} fontSize={8} fill="#92400E" fontStyle="italic">High poverty,</text>
        <text x={115} y={94} fontSize={8} fill="#92400E" fontStyle="italic">fewer beneficiaries</text>
      </svg>

      <div style={{ display: "flex", gap: 16, padding: "6px 16px 10px", fontSize: 11, color: "#6B7280", flexWrap: "wrap" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#1D4ED8", opacity: 0.6, display: "inline-block" }} />
          SSN beneficiary concentration
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#92400E", opacity: 0.6, display: "inline-block" }} />
          High poverty · fewer beneficiaries
        </span>
      </div>

      <div style={{ margin: "0 16px 14px", padding: "10px 12px", background: "#FEF3C7", border: "1px solid #FDE68A", borderRadius: 8, fontSize: 11.5, color: "#78350F" }}>
        <strong>Coverage gap:</strong> Northern and eastern cercles (Kidal, Gao, Tombouctou) show high poverty headcount but limited SSN reach — partly due to insecurity and logistical barriers to delivery.
      </div>
    </div>
  );
}
