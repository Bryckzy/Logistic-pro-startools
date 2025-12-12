import React from 'react';

interface InputGroupProps {
  label: string;
  subLabel?: string;
  value: number | '';
  onChange: (value: number | '') => void;
  icon: React.ReactNode;
  placeholder?: string;
  min?: number;
  step?: string;
}

export const InputGroup: React.FC<InputGroupProps> = ({
  label,
  subLabel,
  value,
  onChange,
  icon,
  placeholder = "0",
  min = 0,
  step = "any"
}) => {
  return (
    <div className="group relative">
      <div className="flex justify-between items-end mb-2">
        <label className="text-[11px] font-black text-neutral-500 uppercase tracking-widest group-focus-within:text-[#FFC72C] transition-colors duration-300">
          {label}
        </label>
        {subLabel && (
          <span className="text-[10px] font-bold text-neutral-400 bg-neutral-800/50 px-1.5 py-0.5 rounded uppercase tracking-wider border border-neutral-700/50">
            {subLabel}
          </span>
        )}
      </div>
      
      <div className="relative">
        {/* Icon Container */}
        <div className="absolute top-1/2 -translate-y-1/2 left-4 text-neutral-500 group-focus-within:text-[#FFC72C] transition-all duration-300 group-focus-within:scale-110 z-10">
          {icon}
        </div>

        {/* The Input */}
        <input
          type="number"
          min={min}
          step={step}
          value={value}
          onChange={(e) => {
            const val = e.target.value === '' ? '' : parseFloat(e.target.value);
            onChange(val);
          }}
          placeholder={placeholder}
          className="block w-full pl-12 pr-4 h-14 bg-[#262626] border-2 border-neutral-800 text-neutral-100 font-bold text-xl rounded-xl placeholder-neutral-600 
          focus:bg-[#171717] focus:border-[#FFC72C] focus:ring-0 focus:shadow-[0_0_30px_rgba(255,199,44,0.1)] 
          hover:border-neutral-600 transition-all duration-300 outline-none relative z-0"
        />

        {/* Technical Decoration - Corner Accent */}
        <div className="absolute -top-[1px] -right-[1px] w-3 h-3 border-t-2 border-r-2 border-[#FFC72C] rounded-tr-lg opacity-0 group-focus-within:opacity-100 transition-all duration-300 scale-75 group-focus-within:scale-100 pointer-events-none z-10" />
        <div className="absolute -bottom-[1px] -left-[1px] w-3 h-3 border-b-2 border-l-2 border-[#FFC72C] rounded-bl-lg opacity-0 group-focus-within:opacity-100 transition-all duration-300 scale-75 group-focus-within:scale-100 pointer-events-none z-10" />
      </div>
    </div>
  );
};