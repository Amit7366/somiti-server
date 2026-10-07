import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const clientUrls = [
  ...new Set(
    [
      ...(process.env.CLIENT_URL || 'http://localhost:3000').split(','),
      'https://somiti-client.vercel.app',
    ]
      .map((url) => url.trim())
      .filter(Boolean)
  ),
];

export const env = {
  port: Number(process.env.PORT) || 5050,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: required('MONGODB_URI'),
  jwtSecret: required('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrl: clientUrls[0],
  clientUrls,
  cookieName: process.env.COOKIE_NAME || 'somiti_token',
  isProd: (process.env.NODE_ENV || 'development') === 'production',
  /** ImageLab secret — Dashboard → API keys. Never expose to the client. */
  imageLabApiKey: process.env.IMAGELAB_API_KEY || '',
  imageLabApiUrl: (process.env.IMAGELAB_API_URL || 'https://api.imagelab.site').replace(/\/$/, ''),
};
