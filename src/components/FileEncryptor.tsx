import React, { useState, useRef } from 'react';
import { FileLock, FileText, Upload, Download, Lock, Unlock, Key, X, FileX, Shield } from 'lucide-react';
import { encryptFile, decryptFile } from '../utils/cryptoUtils';
import { ProgressBar } from './ProgressBar';
import { FileUploader } from './FileUploader';
import PasswordInput from './PasswordInput';

type OperationType = 'encrypt' | 'decrypt';

const FileEncryptor: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [operation, setOperation] = useState<OperationType>('encrypt');
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ url: string; filename: string } | null>(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  
  const passwordMismatch = operation === 'encrypt' && password !== confirmPassword && confirmPassword.length > 0;
  const passwordTooShort = password.length > 0 && password.length < 8;
  const downloadLinkRef = useRef<HTMLAnchorElement>(null);

  const handleFileSelected = (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
    setResult(null);
    setProgress(0);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setProgress(0);
  };

  const checkPasswordStrength = (pwd: string) => {
    if (pwd.length === 0) {
      setPasswordStrength(0);
      return;
    }
    
    let strength = 0;
    if (pwd.length >= 8) strength += 1;
    if (pwd.length >= 12) strength += 1;
    if (/[A-Z]/.test(pwd)) strength += 1;
    if (/[a-z]/.test(pwd)) strength += 1;
    if (/[0-9]/.test(pwd)) strength += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) strength += 1;
    
    setPasswordStrength(Math.min(100, Math.round((strength / 6) * 100)));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    checkPasswordStrength(newPassword);
  };

  const handleOperationChange = (newOperation: OperationType) => {
    setOperation(newOperation);
    setError(null);
    setResult(null);
    setProgress(0);
  };

  const handleProcessFile = async () => {
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    if (!password) {
      setError('Please enter a password.');
      return;
    }

    if (operation === 'encrypt' && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setError(null);
    setProcessing(true);
    setProgress(0);

    try {
      const result = operation === 'encrypt'
        ? await encryptFile(file, password, setProgress)
        : await decryptFile(file, password, setProgress);
      
      const url = URL.createObjectURL(result.data);
      setResult({ url, filename: result.filename });
      
      setTimeout(() => {
        if (downloadLinkRef.current) {
          downloadLinkRef.current.click();
        }
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setProcessing(false);
    }
  };

  const getStrengthColor = () => {
    if (passwordStrength < 40) return 'bg-red-500';
    if (passwordStrength < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="glass rounded-xl shadow-2xl p-6 md:p-8 max-w-3xl mx-auto transition-all duration-300 card-hover">
      <div className="flex items-center justify-center mb-8 animate-float">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500/20 dark:bg-blue-400/20 rounded-full blur-xl"></div>
          <FileLock className="h-16 w-16 text-blue-600 dark:text-blue-400 relative z-10" />
        </div>
        <h2 className="text-3xl ml-4 font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
          Secure File {operation === 'encrypt' ? 'Encryption' : 'Decryption'}
        </h2>
      </div>
      
      <div className="flex overflow-hidden rounded-lg border dark:border-gray-700 mb-8 bg-white/50 dark:bg-gray-800/50 shadow-inner">
        <button
          className={`flex-1 text-center py-4 font-medium transition-all duration-300 ${
            operation === 'encrypt' 
              ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 shadow-sm' 
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
          }`}
          onClick={() => handleOperationChange('encrypt')}
        >
          <div className="flex items-center justify-center space-x-2">
            <Lock className={`h-5 w-5 transition-transform duration-300 ${operation === 'encrypt' ? 'scale-110' : ''}`} />
            <span>Encrypt</span>
          </div>
        </button>
        <button
          className={`flex-1 text-center py-4 font-medium transition-all duration-300 ${
            operation === 'decrypt' 
              ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 shadow-sm' 
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
          }`}
          onClick={() => handleOperationChange('decrypt')}
        >
          <div className="flex items-center justify-center space-x-2">
            <Unlock className={`h-5 w-5 transition-transform duration-300 ${operation === 'decrypt' ? 'scale-110' : ''}`} />
            <span>Decrypt</span>
          </div>
        </button>
      </div>

      <div className="space-y-6">
        <div className="scale-in">
          <FileUploader onFileSelected={handleFileSelected} operation={operation} />
          
          {file && (
            <div className="mt-4 bg-gray-50 dark:bg-gray-700 rounded-lg p-4 slide-up shadow-inner">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="truncate">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{file.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button 
                  className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
                  onClick={handleRemoveFile}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4 fade-in">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password
            </label>
            <PasswordInput
              id="password"
              value={password}
              onChange={handlePasswordChange}
              placeholder="Enter your secure password"
              disabled={processing}
            />
            
            {operation === 'encrypt' && password.length > 0 && (
              <div className="mt-2 scale-in">
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Password Strength</span>
                  <span className={`text-xs font-medium ${
                    passwordStrength < 40 ? 'text-red-500' :
                    passwordStrength < 70 ? 'text-yellow-500' :
                    'text-green-500'
                  }`}>
                    {passwordStrength < 40 ? 'Weak' : passwordStrength < 70 ? 'Good' : 'Strong'}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${getStrengthColor()} transition-all duration-500 ease-out`}
                    style={{ width: `${passwordStrength}%` }}
                  ></div>
                </div>
                {passwordTooShort && (
                  <p className="mt-1 text-xs text-red-500 slide-up">
                    Password must be at least 8 characters long
                  </p>
                )}
              </div>
            )}
          </div>

          {operation === 'encrypt' && (
            <div className="fade-in">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirm Password
              </label>
              <PasswordInput
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                disabled={processing}
                error={passwordMismatch}
              />
              {passwordMismatch && (
                <p className="mt-1 text-xs text-red-500 slide-up">
                  Passwords don't match
                </p>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 slide-up">
            <div className="flex">
              <FileX className="h-5 w-5 text-red-400 dark:text-red-500" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-400">{error}</h3>
              </div>
            </div>
          </div>
        )}

        {processing && (
          <div className="space-y-2 fade-in">
            <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
              <span>Processing your file...</span>
              <span>{progress}%</span>
            </div>
            <ProgressBar progress={progress} />
          </div>
        )}

        <button
          onClick={handleProcessFile}
          disabled={!file || !password || processing || passwordMismatch || passwordTooShort || (operation === 'encrypt' && !confirmPassword)}
          className={`w-full flex items-center justify-center py-3 px-4 rounded-lg shadow-sm text-white transition-all duration-200 hover-lift focus-ring ${
            (!file || !password || processing || passwordMismatch || passwordTooShort || (operation === 'encrypt' && !confirmPassword))
              ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-blue-600'
          }`}
        >
          {processing ? (
            <span className="flex items-center space-x-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Processing...</span>
            </span>
          ) : operation === 'encrypt' ? (
            <>
              <Lock className="mr-2 h-5 w-5" /> Encrypt File
            </>
          ) : (
            <>
              <Unlock className="mr-2 h-5 w-5" /> Decrypt File
            </>
          )}
        </button>

        {result && (
          <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg scale-in">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <Shield className="h-6 w-6 text-green-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800 dark:text-green-400">
                  File {operation === 'encrypt' ? 'encrypted' : 'decrypted'} successfully!
                </h3>
                <div className="mt-4">
                  <a
                    ref={downloadLinkRef}
                    href={result.url}
                    download={result.filename}
                    className="inline-flex items-center px-4 py-2 rounded-lg text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-sm transition-all duration-200 hover-lift focus-ring"
                  >
                    <Download className="h-5 w-5 mr-2" />
                    Download {operation === 'encrypt' ? 'Encrypted' : 'Decrypted'} File
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-start space-x-3">
          <Key className="h-5 w-5 text-gray-400 mt-0.5" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {operation === 'encrypt' 
              ? 'Your files are secured using AES-256 encryption, processed entirely in your browser. We never store your files or passwords.'
              : 'Files are decrypted locally in your browser using AES-256. Make sure you have the correct password.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FileEncryptor;