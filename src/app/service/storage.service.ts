import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private secretKey = 'your-secret-key'; // Replace with a secure key

  constructor() {}

  encryptData(data: any): string {
    return CryptoJS.AES.encrypt(JSON.stringify(data), this.secretKey).toString();
  }

  decryptData(data: string): any {
    try {
      const bytes = CryptoJS.AES.decrypt(data, this.secretKey);
      return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } catch (error) {
      console.error('Error decrypting data', error);
      return null;
    }
  }

  setItem(key: string, value: any): void {
    const encryptedData = this.encryptData(value);
    localStorage.setItem(key, encryptedData);
  }

  getItem(key: string): any {
    const encryptedData = localStorage.getItem(key);
    return encryptedData ? this.decryptData(encryptedData) : null;
  }

  removeItem(key: string): void {
    localStorage.removeItem(key);
  }
}
