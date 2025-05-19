import CryptoJS from 'crypto-js';

const SECRET_KEY = process.env.REACT_APP_STORAGE_SECRET_KEY || 'seguridadCarniceriaSecretKey.J1.G2.D3.D4';

export const encryptData = (data) => {
  try {
    if (data === null || data === undefined) return null;
    const dataString = JSON.stringify(data);
    return CryptoJS.AES.encrypt(dataString, SECRET_KEY).toString();
  } catch (error) {
    console.error("Error encriptando data:", error);
    return null;
  }
};

export const decryptData = (encryptedData) => {
  try {
    if (!encryptedData) return null;
    const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
    if (!decryptedString) {
        console.warn("Falla en la desencriptación, o el dato desencriptado es nulo.");
        return null;
    }
    return JSON.parse(decryptedString);
  } catch (error) {
    console.error("Error desencriptando data:", error);
    return null;
  }
};

export const setEncryptedLocalStorage = (key, value) => {
  const encryptedValue = encryptData(value);
  if (encryptedValue !== null) {
    localStorage.setItem(key, encryptedValue);
  }
};

export const getDecryptedLocalStorage = (key) => {
  const encryptedValue = localStorage.getItem(key);
  if (encryptedValue) {
    const decryptedValue = decryptData(encryptedValue);
    if (decryptedValue === null && localStorage.getItem(key) !== null) {
        console.warn(`Failed to decrypt localStorage item: ${key}. It might be corrupted or encrypted with a different key.`);
    }
    return decryptedValue;
  }
  return null;
};