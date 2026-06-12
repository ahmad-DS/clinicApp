import React from 'react';

interface CardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  badgeText?: string;
  badgeType?: 'waiting' | 'active' | 'success';
}

export const MetricCard: React.FC<CardProps> = ({ title, value, subtitle, badgeText, badgeType }) => {
  const badgeColors = {
    waiting: "bg-amber-50 text-amber-700 border-amber-200",
    active: "bg-blue-50 text-blue-700 border-blue-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };

  return (
    <div className="bg-brand-surface p-5 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between relative overflow-hidden group">
      <div className="flex justify-between items-start">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
        {badgeText && badgeType && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeColors[badgeType]}`}>
            {badgeText}
          </span>
        )}
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-3xl font-bold text-slate-800 tracking-tight">{value}</span>
        {subtitle && <span className="text-xs text-slate-400 font-medium">{subtitle}</span>}
      </div>
      {/* Decorative subtle border hover accent */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-200"/>
    </div>
  );
};