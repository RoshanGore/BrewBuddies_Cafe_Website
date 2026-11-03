import React, { useState } from "react";
import { QrCode, Edit2, CheckCircle2, AlertCircle } from "lucide-react";
import { useTable } from "../../context/TableContext";

const TableBanner = () => {
  const { tableNumber, setTableNumber, cafe, tableError } = useTable();
  const [isEditing, setIsEditing] = useState(false);
  const [tempNum, setTempNum] = useState(tableNumber || 1);

  const handleSave = (e) => {
    e.preventDefault();
    if (tempNum > 0) {
      setTableNumber(tempNum);
      setIsEditing(false);
    }
  };

  return (
    <div className="space-y-2 mb-5">
      {tableError && (
        <div className="p-3.5 bg-[#FEF2F2] border border-[#FCA5A5] rounded-2xl text-[#DC2626] text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-[#DC2626]" />
          <span>{tableError}</span>
        </div>
      )}
      <div className="relative overflow-hidden bg-white text-[#24160F] rounded-3xl p-4 sm:p-5 shadow-sm border border-[#EAE0D5]">
        {/* Subtle warm glow watermark */}
        <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-[#C8752A]/5 blur-xl pointer-events-none"></div>

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#FAF5EF] border border-[#EAE0D5] flex items-center justify-center text-[#C8752A] shadow-xs">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider text-[#C8752A] font-bold">
                  {cafe?.name || "BrewBuddies Cafe"} • Dine-In
                </span>
                <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse"></span>
              </div>
              <p className="text-lg sm:text-xl font-bold font-serif text-[#24160F] leading-tight mt-0.5">
                {tableNumber ? `Table #${tableNumber}` : "No Table Selected"}
              </p>
            </div>
          </div>

          <div>
            {isEditing ? (
              <form onSubmit={handleSave} className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={tempNum}
                  onChange={(e) => setTempNum(e.target.value)}
                  className="w-16 px-2.5 py-1.5 text-xs bg-[#FAF5EF] text-[#24160F] rounded-xl border border-[#C8752A] focus:outline-none"
                  autoFocus
                />
                <button
                  type="submit"
                  className="p-2 bg-[#C8752A] hover:bg-[#B45E1B] text-white rounded-xl font-semibold text-xs transition-colors shadow-xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <button
                onClick={() => {
                  setTempNum(tableNumber || 1);
                  setIsEditing(true);
                }}
                className="text-xs font-semibold flex items-center gap-1.5 bg-[#FAF5EF] hover:bg-[#F3ECE1] text-[#24160F] px-3.5 py-2 rounded-xl transition-colors border border-[#EAE0D5]"
              >
                <Edit2 className="w-3.5 h-3.5 text-[#C8752A]" />
                <span>Change Table</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableBanner;
