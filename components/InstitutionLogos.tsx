const INST_LOGO: Record<string, string> = {
  IBRD: "/IBRD.svg",
  IFC:  "/IFC.svg",
  MIGA: "/MIGA.svg",
  WBG:  "/WBG.svg",
};

function logoFor(inst: string): string {
  return INST_LOGO[inst] ?? "/WBG.svg";
}

interface Props {
  institutions: string[];
  className?: string;
  onDark?: boolean;
  small?: boolean;
}

export default function InstitutionLogos({ institutions, className = "", onDark, small }: Props) {
  const visible = institutions.slice(0, 3);
  const circleSize = small ? "w-[18px] h-[18px]" : "w-[22px] h-[22px]";
  const imgSize = small ? "w-[10px] h-[10px]" : "w-[12px] h-[12px]";
  const textCls = `italic ${small ? "text-[9.5px]" : "text-[11px]"} ${onDark ? "text-white/80" : "text-gray-400"}`;
  const overflow = institutions.length - 2;

  return (
    <div className={`flex items-center gap-1.5 min-w-0 ${className}`} title={institutions.join(", ")}>
      {/* Overlapping circles */}
      <div className="flex -space-x-1.5 shrink-0">
        {visible.map((inst) => (
          <div
            key={inst}
            className={`${circleSize} rounded-full border border-gray-200 bg-white flex items-center justify-center ring-1 ring-white`}
          >
            <img
              src={logoFor(inst)}
              alt={inst}
              className={`${imgSize} object-contain`}
            />
          </div>
        ))}
      </div>

      {/* Label */}
      {institutions.length >= 3 ? (
        <span className={`flex items-center min-w-0 ${textCls}`}>
          <span className="truncate">{institutions.slice(0, 2).join(", ")}</span>
          <span className="shrink-0 ml-0.5">+{overflow}</span>
        </span>
      ) : (
        <span className={`truncate ${textCls}`}>{institutions.join(", ")}</span>
      )}
    </div>
  );
}
