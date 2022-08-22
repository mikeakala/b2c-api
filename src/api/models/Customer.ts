import { } from 'class-validator';
import { Column, Entity, ObjectIdColumn, PrimaryColumn} from 'typeorm';
import { ObjectID } from 'typeorm';
 import { Exclude} from 'class-transformer';
@Entity()
export class Customer {

    @ObjectIdColumn()
    @Exclude()
    public _id: ObjectID;

    @PrimaryColumn()
    public id: number;

    @Column()
    public name: string;

    @Column()
    public phoneNumber: string;

    @Column()
    public email: string;

    @Column()
    public addressId: number;

    @Column()
    public active: boolean;
}
