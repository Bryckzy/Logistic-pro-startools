import React from 'react';

interface ResultCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon: React.ReactNode;
  highlight?: boolean;
  colorClass?: string;
}

export const ResultCard: React.FC<ResultCardProps> = ({ 
  label, 
  value, 
  unit, 
  icon, 
  highlight = false,
  colorClass = "bg-white"
}) => {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-5 shadow-sm border transition-all duration-300 hover:shadow-md ${highlight ? 'bg-blue-600 border-blue-600 text-white' : `${colorClass} border-gray-100 text-gray-800`}`}>
      <div className="flex justify-between items-start mb-2">
        <p className={`text-sm font-medium ${highlight ? 'text-blue-100' : 'text-gray-500'}`}>{label}</p>
        <div className={`p-2 rounded-lg ${highlight ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>
          {icon}
        </div>
      </div>
      <div className="flex items-baseline space-x-1">
        <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
        {unit && <span className={`text-sm font-medium ${highlight ? 'text-blue-200' : 'text-gray-400'}`}>{unit}</span>}
      </div>
    </div>
  );
};