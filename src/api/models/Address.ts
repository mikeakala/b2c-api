import {Entity, Column, ObjectIdColumn, PrimaryColumn } from 'typeorm';
import { ObjectID } from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity()
export class Address {

    @ObjectIdColumn()
    public _id: ObjectID;

    @PrimaryColumn()
    public id: number;

    @Column()
    public streetName: string;

    @Column()
    public houseNumber: number;

    @Column()
    public city: string;

    @Column()
    public province: string;

    @Column()
    @Exclude()
    public active: boolean;

}
