import "reflect-metadata";
import { DataSource } from "typeorm";
import { env } from "./env";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: env.DB_HOST,
  port: env.DB_PORT,
  username: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  synchronize: true,
  logging: env.nodeEnv === "development",
  entities: [__dirname + "/../entities/*.entity.{ts,js}"],
  migrations: [__dirname + "/../migrations/*.{ts,js}"],
});