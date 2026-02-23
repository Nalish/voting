import dotenv from "dotenv";
dotenv.config();

const requireEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing environment variable: ${key}`);
  return value;
};

export const env = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || "development",

  DB_HOST: requireEnv("DB_HOST"),
  DB_PORT: Number(process.env.DB_PORT) ,
  DB_NAME: requireEnv("DB_NAME"),
  DB_USER: requireEnv("DB_USER"),
  DB_PASSWORD: requireEnv("DB_PASSWORD"),

  JWT_SECRET: requireEnv("JWT_SECRET") as string,
  JWT_EXPIRES_IN: (process.env.JWT_EXPIRES_IN || "8h") as string,

  QR_EXPIRY_MINUTES: Number(process.env.QR_EXPIRY_MINUTES) || 5,
};