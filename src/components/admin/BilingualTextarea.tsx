import React from 'react';

interface BilingualTextareaProps {
  label: string;
  valueMn: string;
  valueEn: string;
  onChangeMn: (value: string) => void;
  onChangeEn: (value: string) => void;
  rows?: number;
  required?: boolean;
}

export const BilingualTextarea: React.FC<BilingualTextareaProps> = ({
  label, valueMn, valueEn, onChangeMn, onChangeEn, rows = 4, required
}) => (
  <div>
    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{label}</label>
    <div className="grid grid-cols-2 gap-2.5">
      <div className="relative">
        <span className="absolute top-2 left-3 text-[9px] font-bold text-gray-300 uppercase pointer-events-none">MN</span>
        <textarea
          className="input input-sm pt-6 pb-2 resize-none"
          value={valueMn}
          onChange={(e) => onChangeMn(e.target.value)}
          rows={rows}
          required={required}
        />
      </div>
      <div className="relative">
        <span className="absolute top-2 left-3 text-[9px] font-bold text-gray-300 uppercase pointer-events-none">EN</span>
        <textarea
          className="input input-sm pt-6 pb-2 resize-none"
          value={valueEn}
          onChange={(e) => onChangeEn(e.target.value)}
          rows={rows}
          required={required}
        />
      </div>
    </div>
  </div>
);
