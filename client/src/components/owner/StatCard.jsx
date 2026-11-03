import React from "react";

const StatCard = ({ title, value, subtext, icon: Icon, color = "amber" }) => {
  const colorMap = {
    amber: "bg-[#EFE0CB] text-[#C8752A] border-[#DCC9B3]",
    emerald: "bg-[#FFFDFC] text-[#4F8061] border-[#4F8061]",
    blue: "bg-[#EFE0CB] text-[#6B3515] border-[#DCC9B3]",
    purple: "bg-[#EFE0CB] text-[#C8752A] border-[#DCC9B3]",
    rose: "bg-[#FFFDFC] text-[#B8543E] border-[#B8543E]",
  };

  return (
    <div className="bg-[#FFFDFC] rounded-3xl border border-[#DCC9B3] p-5 shadow-cozy hover:shadow-cozy-md transition-all flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold text-[#765F4D] uppercase tracking-wider">{title}</p>
        <h3 className="text-2xl sm:text-3xl font-extrabold text-[#24160F] mt-1 font-serif tracking-tight">{value}</h3>
        {subtext && <p className="text-[11px] text-[#765F4D] mt-0.5 font-medium">{subtext}</p>}
      </div>

      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${colorMap[color] || colorMap.amber} shadow-xs shrink-0`}>
        <Icon className="w-5 h-5 stroke-[2.2]" />
      </div>
    </div>
  );
};

export default StatCard;
