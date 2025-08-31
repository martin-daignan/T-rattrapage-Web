import CryptoJS from 'crypto-js';
import TRELLO_CONFIG from '../config/trello';

export const generateOAuthParams = () => ({
  oauth_callback: TRELLO_CONFIG.CALLBACK_URL,
  oauth_consumer_key: TRELLO_CONFIG.API_KEY,
  oauth_nonce: Math.random().toString(36).substring(2),
  oauth_signature_method: 'HMAC-SHA1',
  oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
  oauth_version: '1.0',
});

export const createSignature = (method: string, url: string, params: Record<string, string>, secret: string) => {
  const paramString = Object.keys(params)
    .sort()
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
  const baseString = `${method}&${encodeURIComponent(url)}&${encodeURIComponent(paramString)}`;
  return CryptoJS.HmacSHA1(baseString, secret).toString(CryptoJS.enc.Base64);
};

export const formatAuthHeader = (params: Record<string, string>) =>
  Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}="${encodeURIComponent(v)}"`)
    .join(', ');