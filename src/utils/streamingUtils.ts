// A streaming encoder class for AES-GCM encryption
export class StreamingEncoder {
  private key: CryptoKey;
  private iv: Uint8Array;
  private salt: Uint8Array;
  
  constructor(key: CryptoKey, iv: Uint8Array, salt: Uint8Array) {
    this.key = key;
    this.iv = iv;
    this.salt = salt;
  }
  
  // Process data for encryption
  async process(
    data: Uint8Array, 
    progressCallback: (progress: number) => void
  ): Promise<Uint8Array> {
    // Show initial progress
    progressCallback(0);
    
    // Simulate progress for UX purposes (real encryption is quick in modern browsers)
    const updateProgress = (i: number, total: number) => {
      progressCallback(i / total);
    };
    
    // For larger files, create chunks to simulate progress
    const chunkSize = 1024 * 1024; // 1MB chunks
    const chunks = Math.ceil(data.length / chunkSize);
    
    // Simulate progress for larger files
    if (data.length > chunkSize) {
      for (let i = 0; i < chunks; i++) {
        updateProgress(i, chunks);
        // Add small delay to show progress in UI
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }
    
    // Perform the actual encryption
    const encryptedData = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: this.iv
      },
      this.key,
      data
    );
    
    // Create the final output: salt + iv + encrypted data
    const result = new Uint8Array(this.salt.length + this.iv.length + encryptedData.byteLength);
    result.set(this.salt, 0);
    result.set(this.iv, this.salt.length);
    result.set(new Uint8Array(encryptedData), this.salt.length + this.iv.length);
    
    // Show completion
    progressCallback(1);
    
    return result;
  }
}

// A streaming decoder class for AES-GCM decryption
export class StreamingDecoder {
  private key: CryptoKey;
  private iv: Uint8Array;
  
  constructor(key: CryptoKey, iv: Uint8Array) {
    this.key = key;
    this.iv = iv;
  }
  
  // Process data for decryption
  async process(
    data: Uint8Array, 
    progressCallback: (progress: number) => void
  ): Promise<Uint8Array> {
    // Show initial progress
    progressCallback(0);
    
    // Simulate progress for UX purposes
    const chunkSize = 1024 * 1024; // 1MB chunks
    const chunks = Math.ceil(data.length / chunkSize);
    
    // Simulate progress for larger files
    if (data.length > chunkSize) {
      for (let i = 0; i < chunks; i++) {
        progressCallback(i / chunks);
        // Add small delay to show progress in UI
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }
    
    try {
      // Perform the actual decryption
      const decryptedData = await window.crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: this.iv
        },
        this.key,
        data
      );
      
      // Show completion
      progressCallback(1);
      
      return new Uint8Array(decryptedData);
    } catch (error) {
      throw new Error('Decryption failed: Incorrect password or corrupted file');
    }
  }
}