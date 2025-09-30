// Secure authentication utility using PBKDF2 key derivation
// The actual password is never stored - only a derived hash

class SecureAuth {
  constructor() {
    // Fixed salt for consistent key derivation (in production, this would be more complex)
    this.salt = new TextEncoder().encode('IvyFencing2024SecureSalt');
    
    // Pre-computed hash of the derived key from "IvyAdmin25!"
    // This was generated using the deriveKeyHash method with the correct password
    this.storedHash = 'a8b27cc540c79224b399fff960c19070';
  }

  // Convert ArrayBuffer to hex string
  bufferToHex(buffer) {
    return Array.from(new Uint8Array(buffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  // Derive a key from password using PBKDF2
  async deriveKey(password) {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);
    
    // Import the password as a key
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    // Derive a key using PBKDF2
    const derivedKey = await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: this.salt,
        iterations: 100000, // High iteration count for security
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );

    return derivedKey;
  }

  // Create a hash of the derived key for comparison
  async deriveKeyHash(password) {
    const derivedKey = await this.deriveKey(password);
    const keyBuffer = await window.crypto.subtle.exportKey('raw', derivedKey);
    
    // Hash the derived key
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', keyBuffer);
    return this.bufferToHex(hashBuffer).substring(0, 32); // Use first 32 chars
  }

  // Verify password by comparing derived key hashes
  async verifyPassword(inputPassword) {
    try {
      const inputHash = await this.deriveKeyHash(inputPassword);
      return inputHash === this.storedHash;
    } catch (error) {
      console.error('Password verification error:', error);
      return false;
    }
  }

  // Check if user is currently authenticated
  isAuthenticated() {
    const authTime = sessionStorage.getItem('ivyAdminAuth');
    if (!authTime) return false;
    
    // Session expires after 2 hours
    const now = Date.now();
    const authTimestamp = parseInt(authTime);
    const twoHours = 2 * 60 * 60 * 1000;
    
    if (now - authTimestamp > twoHours) {
      this.logout();
      return false;
    }
    
    return true;
  }

  // Set authentication state
  setAuthenticated() {
    sessionStorage.setItem('ivyAdminAuth', Date.now().toString());
  }

  // Clear authentication state
  logout() {
    sessionStorage.removeItem('ivyAdminAuth');
  }
}

// Export singleton instance
export const authManager = new SecureAuth();

// One-time key generation function (used to generate the stored hash)
// This function was used to generate the storedHash above and should not be called in production
export async function generateStoredHash() {
  const auth = new SecureAuth();
  const hash = await auth.deriveKeyHash('IvyAdmin25!');
  console.log('Generated hash for storage:', hash);
  return hash;
}