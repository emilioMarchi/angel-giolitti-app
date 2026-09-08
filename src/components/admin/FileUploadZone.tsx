'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, Image as ImageIcon, Music } from 'lucide-react';

interface FileUploadZoneProps {
  accept: string;
  onFileSelect: (file: File | null) => void;
  onFilesSelect?: (files: File[]) => void;
  selectedFile: File | null;
  placeholderText: string;
  helperText?: string;
  previewUrl?: string;
  className?: string;
  type?: 'image' | 'audio' | 'document';
  multiple?: boolean;
}

export default function FileUploadZone({
  accept,
  onFileSelect,
  onFilesSelect,
  selectedFile,
  placeholderText,
  helperText,
  className = '',
  type = 'image',
  multiple = false,
}: FileUploadZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      const validFiles = files.filter((file) => {
        if (accept.includes('image') && !file.type.startsWith('image/')) return false;
        if (accept.includes('audio') && !file.type.startsWith('audio/')) return false;
        if (accept.includes('application/pdf') && file.type !== 'application/pdf') return false;
        return true;
      });

      if (multiple && onFilesSelect) {
        onFilesSelect(validFiles);
      } else if (validFiles[0]) {
        onFileSelect(validFiles[0]);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      if (multiple && onFilesSelect) {
        onFilesSelect(files);
      } else if (files[0]) {
        onFileSelect(files[0]);
      }
    }
  };

  const handleZoneClick = () => {
    fileInputRef.current?.click();
  };

  const renderIcon = () => {
    if (selectedFile) {
      if (type === 'image') return <ImageIcon className="w-5 h-5 text-white/90" />;
      if (type === 'audio') return <Music className="w-5 h-5 text-white/90" />;
      return <FileText className="w-5 h-5 text-white/90" />;
    }
    if (type === 'image') return <ImageIcon className="w-5 h-5 text-white/20" />;
    if (type === 'audio') return <Music className="w-5 h-5 text-white/20" />;
    return <Upload className="w-5 h-5 text-white/20" />;
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      onClick={handleZoneClick}
      className={`relative border border-dashed rounded-lg p-5 transition-all duration-200 flex flex-col items-center justify-center cursor-pointer text-center select-none min-h-[120px]
        ${isDragActive ? "border-white/40 bg-white/[0.04]" : "border-white/[0.08] hover:border-white/20 hover:bg-white/[0.02]"}
        ${selectedFile ? "border-white/20 bg-white/[0.02]" : ""}
        ${className}
      `}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        className="hidden"
      />
      
      <div className="flex flex-col items-center space-y-2.5">
        <div className={`p-2 rounded-lg border flex items-center justify-center transition-colors
          ${selectedFile ? "bg-white/[0.08] border-white/10" : "bg-white/[0.04] border-white/[0.08]"}`}>
          {renderIcon()}
        </div>
        <div className="space-y-1">
          <p className={`text-xs font-medium ${selectedFile ? "text-white/80" : "text-white/50"}`}>
            {selectedFile ? selectedFile.name : placeholderText}
          </p>
          {helperText && !selectedFile && (
            <p className="text-[10px] text-white/20 max-w-xs leading-relaxed">
              {helperText}
            </p>
          )}
          {selectedFile && (
            <p className="text-[10px] text-white/40">
              Archivo seleccionado • {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
