import { StreamingEncoder, StreamingDecoder } from './streamingUtils';

// Function to derive a key from a password
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  // Convert password to ArrayBuffer
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  
  // Import the password as a key
  const passwordKey = await window.crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  
  // Derive a key using PBKDF2
  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000, // High iteration count for security
      hash: 'SHA-256'
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// Function to encrypt a file
export async function encryptFile(
  file: File, 
  password: string,
  progressCallback: (progress: number) => void
): Promise<{ data: Blob; filename: string }> {
  // Generate a random salt and IV
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  
  // Derive the encryption key from the password
  const key = await deriveKey(password, salt);
  
  // Setup encryption
  const fileReader = new FileReader();
  const encoder = new StreamingEncoder(key, iv, salt);
  
  return new Promise((resolve, reject) => {
    fileReader.onload = async (event) => {
      try {
        if (!event.target || !event.target.result) {
          throw new Error("Failed to read file");
        }
        
        const fileData = event.target.result as ArrayBuffer;
        const encryptedData = await encoder.process(
          new Uint8Array(fileData), 
          (progress) => progressCallback(Math.round(progress * 100))
        );
        
        // Return encrypted blob and filename
        resolve({
          data: new Blob([encryptedData], { type: 'application/octet-stream' }),
          filename: `${file.name}.enc`
        });
      } catch (error) {
        reject(error);
      }
    };
    
    fileReader.onerror = () => {
      reject(new Error("Error reading file"));
    };
    
    // Read the file as an ArrayBuffer
    fileReader.readAsArrayBuffer(file);
  });
}

// Function to decrypt a file
export async function decryptFile(
  file: File, 
  password: string,
  progressCallback: (progress: number) => void
): Promise<{ data: Blob; filename: string }> {
  // Read the encrypted file
  const fileReader = new FileReader();
  
  return new Promise((resolve, reject) => {
    fileReader.onload = async (event) => {
      try {
        if (!event.target || !event.target.result) {
          throw new Error("Failed to read file");
        }
        
        const encryptedData = new Uint8Array(event.target.result as ArrayBuffer);
        
        // Extract the salt and IV from the beginning of the file
        const salt = encryptedData.slice(0, 16);
        const iv = encryptedData.slice(16, 28);
        const ciphertext = encryptedData.slice(28);
        
        // Derive the key from the password and salt
        const key = await deriveKey(password, salt);
        
        // Setup decryption
        const decoder = new StreamingDecoder(key, iv);
        
        try {
          const decryptedData = await decoder.process(
            ciphertext, 
            (progress) => progressCallback(Math.round(progress * 100))
          );
          
          // Extract the original filename (remove .enc extension if present)
          let filename = file.name;
          if (filename.endsWith('.enc')) {
            filename = filename.slice(0, -4);
          }
          
          // Return decrypted blob and filename
          resolve({
            data: new Blob([decryptedData], { type: 'application/octet-stream' }),
            filename
          });
        } catch (error) {
          reject(new Error("Decryption failed: Incorrect password or corrupted file"));
        }
      } catch (error) {
        reject(error);
      }
    };
    
    fileReader.onerror = () => {
      reject(new Error("Error reading file"));
    };
    
    // Read the file as an ArrayBuffer
    fileReader.readAsArrayBuffer(file);
  });
}