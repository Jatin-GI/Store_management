const dotenv = require("dotenv");
const color = require("colors");
const app = require("./app");
const { sequelize } = require("./models");

dotenv.config();

const PORT = process.env.PORT || 8080;

const server = async () => {
  try {
    await sequelize.authenticate();
    console.log(color.bgBlue("Connection established with the DataBase"));

    if (process.env.NODE_ENV !== "production") {
      await sequelize.sync({ alter: true });
      console.log(color.bgGreen("Database Synced"));
    }

    app.listen(PORT, () => {
      console.log(color.bgGreen(`Server running at ${PORT}`));
    });
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

server();
