import * as Faker from 'faker';
import { define } from 'typeorm-seeding';

import { Customer } from '../../../src/api/models/Customer';

define(Customer, (faker: typeof Faker) => {
    const name = faker.name.findName();
    const customer = new Customer();
    customer.id = 9;
    customer.name = name;
    return customer;
});
