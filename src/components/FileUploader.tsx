import React, { useRef, useState } from 'react';
import { Upload, FileText } from 'lucide-react';

interface FileUploaderProps {
  onFileSelected: (file: File) => void;
  operation: 'encrypt' | 'decrypt';
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelected, operation }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      onFileSelected(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      onFileSelected(file);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        File to {operation}
      </label>
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
          isDragging 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-102' 
            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-800/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileInput}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          className="hidden"
        />
        
        <div className="space-y-4">
          <div className="mx-auto flex justify-center">
            {isDragging ? (
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full animate-pulse">
                <FileText className="h-12 w-12 text-blue-500 dark:text-blue-400" />
              </div>
            ) : (
              <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full">
                <Upload className="h-12 w-12 text-gray-400 dark:text-gray-500" />
              </div>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                Click to upload
              </span>{' '}
              or drag and drop
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Supports any file type • No size limits
            </p>
          </div>
        </div>

        {isDragging && (
          <div className="absolute inset-0 border-2 border-blue-500 rounded-xl pointer-events-none">
            <div className="absolute inset-0 bg-blue-500 opacity-10"></div>
          </div>
        )}
      </div>
    </div>
  );
};