import { config } from "dotenv";
import path from "path";
import { Sequelize } from "sequelize-typescript";
import { SequelizeStorage, Umzug } from "umzug";

config();

export const sequelize = new Sequelize({
    host: process.env.DB_HOST,
    port: +process.env.DB_PORT,
    database: process.env.DB_NAME,
    dialect: "mariadb",
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    storage: ":memory:",
    models: [__dirname + "/models/*.model.ts"],
    modelMatch: (filename, member) =>
        filename.substring(0, filename.indexOf(".model")).toLowerCase() === member.toLowerCase(),
    logging: false,
    define: {
        timestamps: false,
    },
    dialectOptions: {
        connectTimeout: 60000,
    },
});

const umzug = new Umzug({
    migrations: { glob: path.join(__dirname, "migrations/*.migration.ts") },
    context: sequelize.getQueryInterface(),
    storage: new SequelizeStorage({ sequelize }),
    logger: console,
});

export async function connectToDb() {
    await umzug.up();
    await sequelize.authenticate();
    console.log("Connection established");
}
