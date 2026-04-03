import React from 'react';

interface BilingualInputProps {
  label: string;
  valueMn: string;
  valueEn: string;
  onChangeMn: (value: string) => void;
  onChangeEn: (value: string) => void;
  placeholderMn?: string;
  placeholderEn?: string;
  required?: boolean;
}

export const BilingualInput: React.FC<BilingualInputProps> = ({
  label, valueMn, valueEn, onChangeMn, onChangeEn,
  placeholderMn = 'Монгол', placeholderEn = 'English', required
}) => (
  <div className="space-y-2">
    <label className="text-xs font-black text-sdy-black uppercase tracking-widest">{label}</label>
    <div className="grid grid-cols-2 gap-3">
      <div className="relative">
        <span className="absolute top-2 left-3 text-[9px] font-black text-gray-300 uppercase">MN</span>
        <input
          type="text"
          className="w-full px-3 pt-6 pb-2 rounded-xl border-2 border-gray-100 focus:border-sdy-red outline-none transition-all font-bold text-sm"
          value={valueMn}
          onChange={(e) => onChangeMn(e.target.value)}
          placeholder={placeholderMn}
          required={required}
        />
      </div>
      <div className="relative">
        <span className="absolute top-2 left-3 text-[9px] font-black text-gray-300 uppercase">EN</span>
        <input
          type="text"
          className="w-full px-3 pt-6 pb-2 rounded-xl border-2 border-gray-100 focus:border-sdy-red outline-none transition-all font-bold text-sm"
          value={valueEn}
          onChange={(e) => onChangeEn(e.target.value)}
          placeholder={placeholderEn}
          required={required}
        />
      </div>
    </div>
  </div>
);
