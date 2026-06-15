import React, { useRef } from 'react';

interface ScrollableDateSelectorProps {
  selectedDate: string; // Format: YYYY-MM-DD
  onDateChange: (dateStr: string) => void;
  daysToSpread?: number; // How many future days to display (default: 14)
}

export const ScrollableDateSelector: React.FC<ScrollableDateSelectorProps> = ({
  selectedDate = new Date().toISOString().split('T')[0], // Default to today's date
  onDateChange,
  daysToSpread = 14
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  console.log("selecred date in selector", selectedDate);

  // Generate an array of dates starting exactly from today
  const generateDates = () => {
    const datesArray = [];
    const today = new Date();

    for (let i = 0; i < daysToSpread; i++) {
      const targetDate = new Date();
      targetDate.setDate(today.getDate() + i);

      const yyyy = targetDate.getFullYear();
      const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
      const dd = String(targetDate.getDate()).padStart(2, '0');
      
      const dateString = `${yyyy}-${mm}-${dd}`;
      const dayName = targetDate.toLocaleDateString('en-IN', { weekday: 'short' });
      const dayNum = targetDate.getDate();
      const monthName = targetDate.toLocaleDateString('en-IN', { month: 'short' });

      // Label today explicitly for better clinical UX
      const isToday = i === 0;

      datesArray.push({
        dateString,
        dayName: isToday ? 'Today' : dayName,
        dayNum,
        monthName
      });
    }
    return datesArray;
  };

  const dates = generateDates();
  console.log("Generated dates for selector:", dates);

  return (
    <div className="w-full space-y-2">
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
        Select Appointment Date
      </label>
      
      <div className="relative flex items-center group">
        {/* Horizontal Scrolling Target Stripe */}
        <div 
          ref={scrollContainerRef}
          className="flex gap-2.5 overflow-x-auto pb-2 pt-1 scrollbar-thin scroll-smooth w-full"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {dates.map((item) => {
            const isSelected = item.dateString === selectedDate;
            
            return (
              <button
                key={item.dateString}
                type="button"
                onClick={() => onDateChange(item.dateString)}
                className={`flex flex-col items-center justify-center min-w-[62px] h-[74px] rounded-xl border transition-all text-center focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                  isSelected
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/10 scale-102 font-semibold'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span className={`text-[10px] uppercase tracking-wide ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                  {item.dayName}
                </span>
                <span className="text-lg font-bold block my-0.5 leading-none">
                  {item.dayNum}
                </span>
                <span className={`text-[10px] ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                  {item.monthName}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};