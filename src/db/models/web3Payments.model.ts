import { Table, Column, Model, PrimaryKey, Unique, AutoIncrement } from "sequelize-typescript";

@Table({
    modelName: "web3_payments",
})
export class Web3Payments extends Model {
    @PrimaryKey
    @Unique
    @AutoIncrement
    @Column
    ID: string;

    @Unique
    @Column
    txHash: string;
}
