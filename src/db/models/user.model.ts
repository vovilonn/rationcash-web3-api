import { Table, Column, Model, PrimaryKey, Unique, AutoIncrement } from "sequelize-typescript";
import { literal } from "sequelize";
import { Transaction, UpdateOptions } from "sequelize";

@Table({
    modelName: "user",
})
export class User extends Model {
    @PrimaryKey
    @Unique
    @AutoIncrement
    @Column
    ID: number;

    @Unique
    @Column
    wallet: string;

    @Column
    balance: number;

    public static incrementBalance(amount: number, userId: number, transaction?: Transaction) {
        const opts: UpdateOptions = { where: { ID: userId } };
        if (transaction) {
            opts.transaction = transaction;
        }
        return User.update({ balance: literal(`balance + ${amount}`) }, opts);
    }

    public static decrementBalance(amount: number, userId: number, transaction?: Transaction) {
        const opts: UpdateOptions = { where: { ID: userId } };
        if (transaction) {
            opts.transaction = transaction;
        }
        return User.update({ balance: literal(`balance - ${amount}`) }, opts);
    }
}
