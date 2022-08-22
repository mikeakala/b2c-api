import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { EventDispatcher, EventDispatcherInterface } from '../../decorators/EventDispatcher';
import { Logger, LoggerInterface } from '../../decorators/Logger';
import { Customer } from '../models/Customer';
import { CustomerRepository } from '../repositories/CustomerRepository';
import { events } from '../subscribers/events';
import { ObjectID } from 'typeorm';
@Service()
export class CustomerService {

    constructor(
        @OrmRepository() private customerRepository: CustomerRepository,
        @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
        @Logger(__filename) private log: LoggerInterface
    ) { }

    public find(): Promise<Customer[]> {
        this.log.info('Find all customers');

        const pipeline = [
            { $match: {
                    $and: [
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
                    addressId: 0,
                    active: 0,
                    address: {
                        _id: 0,
                        id: 0,
                        active: 0,
                    },
                },
           },
           {$unwind: {
            path: '$address',
            preserveNullAndEmptyArrays: false,
          },
        },
        ];

        return this.customerRepository.aggregate(pipeline).toArray();
    }

    public async findOne(id: number): Promise<Customer> {
        this.log.info('Find customer by Id');
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
                    addressId: 0,
                    active: 0,
                    address: {
                        _id: 0,
                        id: 0,
                        active: 0,
                    },
                },
           },
           {$unwind: {
            path: '$address',
            preserveNullAndEmptyArrays: false,
          },
        },
        ];
        const queryResults = await this.customerRepository.aggregate(pipeline);
        const customer = (await queryResults.toArray())[0];
        return customer;
    }

    public async findCustomerRecordById(id: number): Promise<Customer> {
        this.log.info('Find customer by Id');
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
           {$unwind: {
            path: '$address',
            preserveNullAndEmptyArrays: false,
          },
        },
        ];
        const queryResults = await this.customerRepository.aggregate(pipeline);
        const customer = (await queryResults.toArray())[0];
        return customer;
    }

    public async create(customer: Customer): Promise<Customer> {
        this.log.info('Create a new customer => ', customer.toString());
        // Given that typeorm framework does not support auto increment on the primary column for mongodb hence handle auto-increment of the id column.
        const lastCustomerRecord = await this.customerRepository.find({ order: { id: 'DESC' }, take: 1});
        customer.id = lastCustomerRecord[0].id + 1;
        customer.active = true;
        const newCustomer = await this.customerRepository.save(customer);
        this.eventDispatcher.dispatch(events.customer.created, newCustomer);
        return this.findOne(newCustomer.id);
    }

    public async update(id: ObjectID, customer: Customer): Promise<Customer> {
        this.log.info('Update a customer');
        await this.customerRepository.update(id, customer);
        return this.findOne(customer.id);
    }

    public async delete(id: number): Promise<void> {
        this.log.info('Soft Delete a customer');
        // Never delete customer data from database only support soft delete.
        const pipeline = [
            { $match: {
                $and: [
                    {id},
                ],
            },
        },
        ];
        const customer = (await this.customerRepository.aggregate(pipeline).toArray())[0];
        customer.active = false;
        this.customerRepository.save(customer);
        return;
    }

}
