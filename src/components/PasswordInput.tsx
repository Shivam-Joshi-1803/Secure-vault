import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps {
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  id,
  value,
  onChange,
  placeholder = 'Enter password',
  disabled = false,
  error = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="relative group">
      <input
        id={id}
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        disabled={disabled}
        className={`block w-full pl-3 pr-10 py-2.5 rounded-lg shadow-sm transition-all duration-200
          ${error 
            ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
            : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
          }
          ${disabled 
            ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' 
            : 'bg-white dark:bg-gray-700'
          }
          ${isFocused 
            ? 'shadow-lg shadow-blue-500/20 dark:shadow-blue-500/10' 
            : 'hover:border-gray-400 dark:hover:border-gray-500'
          }
          placeholder-gray-400 dark:placeholder-gray-500
          text-gray-900 dark:text-white
          focus:outline-none focus:ring-2 focus:ring-opacity-50`}
      />
      <button
        type="button"
        className={`absolute inset-y-0 right-0 pr-3 flex items-center transition-colors duration-200
          ${disabled 
            ? 'text-gray-400 cursor-not-allowed' 
            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        onClick={togglePasswordVisibility}
        disabled={disabled}
      >
        {showPassword ? (
          <EyeOff className="h-5 w-5" />
        ) : (
          <Eye className="h-5 w-5" />
        )}
      </button>
    </div>
  );
};

export default PasswordInput;