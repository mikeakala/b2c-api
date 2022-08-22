import { Container } from 'typedi';
import { Connection } from 'typeorm';

import { Customer } from '../../src/api/models/Customer';
import { CustomerService } from '../../src/api/services/CustomerService';
import { closeDatabase, createDatabaseConnection} from '../utils/database';
import { configureLogger } from '../utils/logger';

describe('CustomerService', () => {
   // -------------------------------------------------------------------------
    // Setup up
    // -------------------------------------------------------------------------

    let connection: Connection;
    beforeAll(async () => {
        configureLogger();
        connection = await createDatabaseConnection();
    });
   // beforeEach(() => migrateDatabase(connection));

    // -------------------------------------------------------------------------
    // Tear down
    // -------------------------------------------------------------------------

    afterAll(() => closeDatabase(connection));

    // -------------------------------------------------------------------------
    // Test cases
    // -------------------------------------------------------------------------

    test('should create a new customer in the database', async (done) => {
        const customer = new Customer();
        customer.email = 'abc@abc.com';
        customer.name = 'test';
        customer.phoneNumber = '+1234567889';
        customer.active = true;
        customer.addressId = 1;

        const customerService = Container.get<CustomerService>(CustomerService);
        const resultCreate = await customerService.create(customer);
        expect(resultCreate.name).toBe(customer.name);
        done();
    });

});
