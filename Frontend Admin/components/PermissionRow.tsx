
import React from 'react';
import { PermissionKey } from '../types';
import { COLORS, PERMISSION_LABELS, ICONS } from '../constants';

interface PermissionRowProps {
  id: PermissionKey;
  value: boolean;
  onToggle: (id: PermissionKey, newValue: boolean) => void;
  disabled?: boolean;
}

const PermissionRow: React.FC<PermissionRowProps> = ({ id, value, onToggle, disabled }) => {
  const label = PERMISSION_LABELS[id] || id;
  
  // Dynamic icons based on ID key (mapping camelCase to constant names)
  const iconKey = id.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('') as keyof typeof ICONS;
  const icon = ICONS[iconKey] || ICONS.Copy;

  return (
    <div className="flex items-center justify-between p-3 mb-2 bg-white border rounded-md shadow-sm border-[#DADDE1] transition-all hover:border-[#2C3E50]/30">
      <div className="flex items-center space-x-3">
        <div className="text-[#7F8C8D]">
          {icon}
        </div>
        <span className="text-[#2C3E50] font-medium text-sm">{label}</span>
      </div>
      
      <div className="flex overflow-hidden rounded-md border border-[#DADDE1]">
        <button
          onClick={() => onToggle(id, false)}
          disabled={disabled}
          className={`px-4 py-1.5 text-xs font-bold transition-colors ${
            !value 
              ? `bg-[${COLORS.block}] text-white border-r border-[#DADDE1]` 
              : 'bg-gray-50 text-[#7F8C8D] border-r border-[#DADDE1] hover:bg-gray-100'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          BLOCK
        </button>
        <button
          onClick={() => onToggle(id, true)}
          disabled={disabled}
          className={`px-4 py-1.5 text-xs font-bold transition-colors ${
            value 
              ? `bg-[${COLORS.allow}] text-white` 
              : 'bg-gray-50 text-[#7F8C8D] hover:bg-gray-100'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          ALLOW
        </button>
      </div>
    </div>
  );
};

export default PermissionRow;
