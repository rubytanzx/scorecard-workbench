
import { ArrowRight } from "lucide-react";
import { type PatternCard as PatternCardType } from "@/lib/mockData";

interface Props {
  card: PatternCardType;
}

export default function PatternCard({ card }: Props) {
  return (
    <a
      href={card.href}
      className="group flex flex-col gap-2 p-5 rounded-xl border border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm hover:bg-gray-50/50 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
    >
      <h3 className="text-[14px] font-semibold text-gray-900 leading-snug group-hover:text-blue-700 transition-colors">
        {card.headline}
      </h3>
      <p className="text-[12.5px] text-gray-500 leading-relaxed">
        {card.description}
      </p>
      <div className="flex items-center gap-1 mt-1 text-[11.5px] text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
        Explore
        <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
      </div>
    </a>
  );
}
