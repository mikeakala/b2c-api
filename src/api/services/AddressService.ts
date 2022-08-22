import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { Logger, LoggerInterface } from '../../decorators/Logger';
import { AddressRepository } from '../repositories/AddressRepository';
import { Address } from '../models/Address';
import { ObjectID } from 'typeorm';

@Service()
export class AddressService {

    constructor(
        @OrmRepository() private addressRepository: AddressRepository,
        @Logger(__filename) private log: LoggerInterface
    ) { }

    public async create(address: Address): Promise<Address> {

        this.log.info('Create a new address => ', address.toString());
        // Given that typeorm framework does not support auto increment on the primary column for mongodb hence handle auto-increment of the id column.
        const lastAddressRecord = await this.addressRepository.find({ order: { id: 'DESC' }, take: 1});
        address.id = lastAddressRecord[0].id + 1;
        const newAddress = await this.addressRepository.save(address);
        return newAddress;
    }
    public async findOne(id: number): Promise<Address> {
        this.log.info('Find address by Id');
        const pipeline = [
            { $match: {
                    $and: [
                        {id},
                        {active: true},
                    ],
                },
            },
            {
                $lookup:
                    {
                        from: 'address',
                        localField: 'addressId',
                        foreignField: 'id',
                        as: 'address',
                    },
            },
            {
                $project: {
                    _id: 0,
                    id: 0,
                    active: 0,
                },
            },
        ];
        const queryResults = await this.addressRepository.aggregate(pipeline);
        const address = (await queryResults.toArray())[0];
        return address;
    }

    public async findAddressRecordById(id: number): Promise<Address> {
        this.log.info('Find address by Id');
        const pipeline = [
            { $match: {
                    $and: [
                        {id},
                        {active: true},
                    ],
                },
            },
            {
                $lookup:
                    {
                        from: 'address',
                        localField: 'addressId',
                        foreignField: 'id',
                        as: 'address',
                    },
            },
        ];
        const queryResults = await this.addressRepository.aggregate(pipeline);
        const address = (await queryResults.toArray())[0];
        return address;
    }

    public async update(id: ObjectID, address: Address): Promise<Address> {
        this.log.info('Update a address');
        await this.addressRepository.update(id, address);
        return this.findOne(address.id);
    }

}
