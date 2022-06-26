import { QueryInterface } from "sequelize";
import { DataTypes } from "sequelize";

async function up({ context: queryInterface }: { context: QueryInterface }) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
        await queryInterface.addColumn(
            "users",
            "wallet",
            {
                type: DataTypes.STRING(64),
                unique: true,
            },
            { transaction }
        );

        await transaction.commit();
    } catch (err) {
        console.log(err);
        await transaction.rollback();
        throw err;
    }
}

async function down({ context: queryInterface }: { context: QueryInterface }) {}

module.exports = { up, down };
