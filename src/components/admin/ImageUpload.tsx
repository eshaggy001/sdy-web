import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  value: string | null;
  onChange: (file: File | null) => void;
  label?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ value, onChange, label = 'Image' }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = (file: File | null) => {
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be under 5MB');
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        alert('Only JPG, PNG, WEBP allowed');
        return;
      }
      setPreview(URL.createObjectURL(file));
      onChange(file);
    } else {
      setPreview(null);
      onChange(null);
    }
  };

  const displayUrl = preview || value;

  return (
    <div className="space-y-2">
      <label className="text-xs font-black text-sdy-black uppercase tracking-widest">{label}</label>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />
      {displayUrl ? (
        <div className="relative group cursor-pointer" onClick={() => inputRef.current?.click()}>
          <img
            src={displayUrl}
            alt="Preview"
            className="w-full h-40 object-cover rounded-xl border-2 border-gray-100 group-hover:opacity-75 transition-opacity"
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="bg-black/60 text-white text-xs font-bold px-3 py-1.5 rounded-lg">Зураг солих</span>
          </div>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleFile(null); if (inputRef.current) inputRef.current.value = ''; }}
            className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full h-32 rounded-xl border-2 border-dashed border-gray-200 hover:border-sdy-red/40 flex flex-col items-center justify-center gap-2 transition-colors"
        >
          <Upload size={20} className="text-gray-300" />
          <span className="text-xs font-bold text-gray-400">Click to upload</span>
        </button>
      )}
    </div>
  );
};
