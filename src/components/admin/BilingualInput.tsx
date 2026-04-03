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
  <div>
    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{label}</label>
    <div className="grid grid-cols-2 gap-2.5">
      <div className="relative">
        <span className="absolute top-2 left-3 text-[9px] font-bold text-gray-300 uppercase pointer-events-none">MN</span>
        <input
          type="text"
          className="input input-sm pt-6 pb-2"
          value={valueMn}
          onChange={(e) => onChangeMn(e.target.value)}
          placeholder={placeholderMn}
          required={required}
        />
      </div>
      <div className="relative">
        <span className="absolute top-2 left-3 text-[9px] font-bold text-gray-300 uppercase pointer-events-none">EN</span>
        <input
          type="text"
          className="input input-sm pt-6 pb-2"
          value={valueEn}
          onChange={(e) => onChangeEn(e.target.value)}
          placeholder={placeholderEn}
          required={required}
        />
      </div>
    </div>
  </div>
);
