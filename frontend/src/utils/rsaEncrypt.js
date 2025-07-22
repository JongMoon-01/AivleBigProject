import JSEncrypt from 'jsencrypt';

export const encryptPassword = (password, publicKey) => {
  const encrypt = new JSEncrypt();
  encrypt.setPublicKey(publicKey);
  return encrypt.encrypt(password);
};

export const fetchPublicKey = async () => {
  try {
    const response = await fetch('http://localhost:8080/api/auth/public-key');
    if (!response.ok) {
      throw new Error('Failed to fetch public key');
    }
    const data = await response.json();
    return data.publicKey;
  } catch (error) {
    console.error('Error fetching public key:', error);
    throw error;
  }
};