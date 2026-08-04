const dotenv = require("dotenv");
const color = require("colors");
const app = require("./app");
const { sequelize } = require("./models");

dotenv.config();

const PORT = process.env.PORT || 5050;

const server = async () => {
  try {
    app.listen(PORT, () => {
      console.log(color.bgGreen(`Server running at ${PORT} `));
    });

    await sequelize.authenticate();
    console.log(color.bgBlue("Connection established with the DataBase "));

    await sequelize.sync({ alter: true });
    console.log(color.bgGreen("Database Synced"));
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

server();
