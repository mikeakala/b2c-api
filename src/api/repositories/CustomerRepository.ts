import { EntityRepository, MongoRepository } from 'typeorm';
import {Customer } from '../models/Customer';

@EntityRepository(Customer)
export class CustomerRepository extends MongoRepository<Customer> {

}
