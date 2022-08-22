import { HttpError } from 'routing-controllers';

export class CustomerNotFoundError extends HttpError {
    constructor() {
        super(404, 'Customer not found!');
    }
}
