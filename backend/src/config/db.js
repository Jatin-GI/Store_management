const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");

dotenv.config();

const useSsl =
  Boolean(process.env.DATABASE_URL) ||
  process.env.DB_SSL === "true" ||
  (process.env.DB_HOST && process.env.DB_HOST.includes("neon.tech"));

const dialectOptions = useSsl
  ? { ssl: { require: true, rejectUnauthorized: false } }
  : {};

const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: "postgres",
      dialectOptions,
    })
  : new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USERNAME,
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_HOST,
        dialect: "postgres",
        dialectOptions,
      },
    );

module.exports = sequelize;
