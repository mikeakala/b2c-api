import { EntityRepository, MongoRepository } from 'typeorm';
import { Address } from '../models/Address';

@EntityRepository(Address)
export class AddressRepository extends MongoRepository<Address> {

}
