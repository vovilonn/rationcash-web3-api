import { QueryInterface } from "sequelize";
import { DataTypes } from "sequelize";

async function up({ context: queryInterface }: { context: QueryInterface }) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
        await queryInterface.createTable("web3_payments", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                unique: true,
                type: DataTypes.INTEGER,
            },
            txHash: {
                allowNull: false,
                unique: true,
                type: DataTypes.STRING(256),
            },
        });
        await transaction.commit();
    } catch (err) {
        await transaction.rollback();
        throw err;
    }
}

async function down({ context: queryInterface }: { context: QueryInterface }) {}

module.exports = { up, down };
