import { } from 'class-validator';
// ValidateNested
import {
    Body, Delete, Get, JsonController, OnUndefined, Param, Post, Put
} from 'routing-controllers';
import { ResponseSchema, OpenAPI } from 'routing-controllers-openapi';

import { CustomerNotFoundError } from '../errors/CustomerNotFoundError';
import { Customer } from '../models/Customer';
import { Address } from '../models/Address';
import { CustomerService } from '../services/CustomerService';
import { AddressService } from '../services/AddressService';

class BaseCustomer {
    public name: string;

    public email: string;

    public phoneNumber: string;
}

export class CustomerResponse extends BaseCustomer {

    public address: Address;
}

class CreateCustomerBody extends BaseCustomer {
    public address: Address;
}

@JsonController('/customers')
@OpenAPI({ security: [{ basicAuth: [] }] })
export class CustomerController {

    constructor(
        private customerService: CustomerService,
        private addressService: AddressService
    ) { }

    @Get()
    @ResponseSchema(CustomerResponse, { isArray: true })
    public find(): Promise<Customer[]> {
        return this.customerService.find();
    }

    @Get('/:id')
    @OnUndefined(CustomerNotFoundError)
    @ResponseSchema(CustomerResponse)
    public one(@Param('id') id: number): Promise<Customer> {
       return this.customerService.findOne(id);
    }

    @Post()
    @ResponseSchema(CustomerResponse)
    public async create(@Body({ required: true }) body: CreateCustomerBody): Promise<Customer> {

        const address = new Address();
        address.active = true;
        address.city = body.address.city;
        address.houseNumber = body.address.houseNumber;
        address.province = body.address.province;
        address.streetName = body.address.streetName;

        const newAddress = await this.addressService.create(address);
        const customer = new Customer();
        customer.name = body.name;
        customer.phoneNumber = body.phoneNumber;
        customer.email = body.email;
        customer.addressId = newAddress.id;

        return this.customerService.create(customer);
    }

    @Put('/:id')
    @ResponseSchema(CustomerResponse)
    public async update(@Param('id') id: number, @Body() body: CreateCustomerBody): Promise<Customer> {
        const customer = await this.customerService.findCustomerRecordById(id);
        const address =  await this.addressService.findAddressRecordById(customer.addressId);

        const newAddress = new Address();
        newAddress.city = body.address.city;
        newAddress.id = address.id;
        newAddress.houseNumber = body.address.houseNumber;
        newAddress.province = body.address.province;
        newAddress.streetName = body.address.streetName;
        await this.addressService.update(address._id, newAddress);
        const newCustomer = new Customer();
        newCustomer.name = body.name;
        newCustomer.id = customer.id;
        newCustomer.phoneNumber = body.phoneNumber;
        newCustomer.email = body.email;
        return this.customerService.update(customer._id, newCustomer);
    }

    @Delete('/:id')
    public delete(@Param('id') id: number): Promise<void> {
        // only implement soft delete.
        return this.customerService.delete(id);
    }

}
