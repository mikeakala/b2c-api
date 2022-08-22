import request from 'supertest';
import * as nock from 'nock';
import { closeDatabase } from '../../utils/database';
import { bootstrapApplication, BootstrapSettings } from '../utils/bootstrap';

describe('/api/customers', () => {

    // -------------------------------------------------------------------------
    // Setup up
    // -------------------------------------------------------------------------

    let settings: BootstrapSettings;
    beforeAll(async () => settings = await bootstrapApplication());



    afterAll(async () => {
        nock.cleanAll();
        await closeDatabase(settings.connection);
        settings.server.close();
    });

    // -------------------------------------------------------------------------
    // Test cases
    // -------------------------------------------------------------------------

    test('GET: / should return a list of customers', async (done) => {
        const response = await request(settings.app)
            .get('/api/customers')
            .expect(200);
        
        expect(response.body.length).toBeGreaterThanOrEqual(1);    
        done();
      
    });
});

