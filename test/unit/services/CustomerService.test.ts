import { Customer } from '../../../src/api/models/Customer';
import { CustomerService } from '../../../src/api/services/CustomerService';
import { EventDispatcherMock } from '../lib/EventDispatcherMock';
import { LogMock } from '../lib/LogMock';
import { RepositoryMock } from '../lib/RepositoryMock';

describe('CustomerService', () => {

    test('Find should return a list of customers', async (done) => {
        done();
    });

/*
    test('Create should dispatch subscribers', async (done) => {
        const log = new LogMock();
        const repo = new RepositoryMock();
        const ed = new EventDispatcherMock();
        const user = new User();
        user.id = '1';
        user.firstName = 'John';
        user.lastName = 'Doe';
        user.email = 'john.doe@test.com';
        const userService = new UserService(repo as any, ed as any, log);
        const newUser = await userService.create(user);
        expect(ed.dispatchMock).toBeCalledWith([events.user.created, newUser]);
        done();
    });
    */

});
