interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
  variant?: "hero" | "section";
}

export default function SectionHeader({ title, subtitle, className = "", variant = "section" }: SectionHeaderProps) {
  const headingClass = variant === "hero"
    ? "text-[38px] font-semibold text-[#212121] leading-[140%] tracking-[-1.5px]"
    : "text-[24px] font-semibold text-[#212121] leading-[140%] tracking-[-0.25px]";

  return (
    <div className={`mb-5 ${className}`}>
      <h2 className={headingClass}>{title}</h2>
      {subtitle && <p className="mt-1 text-[13px] text-gray-500">{subtitle}</p>}
    </div>
  );
}
