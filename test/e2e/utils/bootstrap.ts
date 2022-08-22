import { Application } from 'express';
import * as http from 'http';
import { Connection } from 'typeorm/connection/Connection';
import { createExpressServer } from 'routing-controllers';
import { configure, format, transports } from 'winston';
import { useContainer as classValidatorUseContainer } from 'class-validator';
import { useContainer as routingUseContainer } from 'routing-controllers';
import { useContainer as typeGraphQLUseContainer } from 'type-graphql';
import { Container } from 'typedi';
import { useContainer as ormUseContainer } from 'typeorm';
import * as express from 'express';
import {  createConnection, getConnectionOptions } from 'typeorm';
import glob from 'glob';
import { env } from '../../../src/env';
import { defaultMetadataStorage as classTransformerMetadataStorage } from 'class-transformer/storage';
import { getFromContainer, MetadataStorage } from 'class-validator';
import { validationMetadatasToSchemas } from 'class-validator-jsonschema';
import basicAuth from 'express-basic-auth';
import { getMetadataArgsStorage } from 'routing-controllers';
import { routingControllersToSpec } from 'routing-controllers-openapi';
import * as swaggerUi from 'swagger-ui-express';

export interface BootstrapSettings {
    app: Application;
    server: http.Server;
    connection: Connection;
}


export const bootstrapApplication = async () => {

        configure({
            transports: [
                new transports.Console({
                    level: env.log.level,
                    handleExceptions: true,
                    format: env.node !== 'development'
                        ? format.combine(
                            format.json()
                        )
                        : format.combine(
                            format.colorize(),
                            format.simple()
                        ),
                }),
            ],
        });

        /**
         * Setup routing-controllers to use typedi container.
         */
            routingUseContainer(Container);
            ormUseContainer(Container);
            classValidatorUseContainer(Container);
            typeGraphQLUseContainer(Container);

        /**
         * eventDispatchLoader
         * ------------------------------
         * This loads all the created subscribers into the project, so we do not have to
         * import them manually
         */
        const patterns = env.app.dirs.subscribers;
        patterns.forEach((pattern) => {
            glob(pattern, (err: any, files: string[]) => {
                for (const file of files) {
                    require(file);
                }
            });
        });

        const loadedConnectionOptions = await getConnectionOptions();

        const connectionOptions = Object.assign(loadedConnectionOptions, {
            type: env.db.type as any, // See createConnection options for valid types
            host: env.db.host,
            port: env.db.port,
            url: 'mongodb://user:pass@localhost:27017/b2c-api?authMechanism=SCRAM-SHA-1&authSource=admin',
            username: env.db.username,
            password: env.db.password,
            database: env.db.database,
            synchronize: false,
            logging: env.db.logging,
            useUnifiedTopology: true,
        });

        const connection = await createConnection(connectionOptions);

        if (connection.isConnected) {
            console.log('Established Connection to database');
        }
        /**
         * We create a new express server instance.
         * We could have also use useExpressServer here to attach controllers to an existing express instance.
         */

        const expressApp: Application = createExpressServer({
            cors: true,
            classTransformer: true,
            routePrefix: env.app.routePrefix,
            defaultErrorHandler: false,
            /**
             * We can add options about how routing-controllers should configure itself.
             * Here we specify what controllers should be registered in our express server.
             */
            controllers: env.app.dirs.controllers,
            middlewares: env.app.dirs.middlewares,
            interceptors: env.app.dirs.interceptors,

            /**
             * Authorization features
             */
            // authorizationChecker: authorizationChecker(connection),
            // currentUserChecker: currentUserChecker(connection),
        });

        const { validationMetadatas } = getFromContainer(
            MetadataStorage
        ) as any;

        const schemas = validationMetadatasToSchemas(validationMetadatas, {
            classTransformerMetadataStorage,
            refPointerPrefix: '#/components/schemas/',
        });

        const swaggerFile = routingControllersToSpec(
            getMetadataArgsStorage(),
            {},
            {
                components: {
                    schemas,
                    securitySchemes: {
                        basicAuth: {
                            type: 'http',
                            scheme: 'basic',
                        },
                    },
                },
            }
        );

        // Add npm infos to the swagger doc
        swaggerFile.info = {
            title: env.app.name,
            description: env.app.description,
            version: env.app.version,
        };

        swaggerFile.servers = [
            {
                url: `${env.app.schema}://${env.app.host}:${env.app.port}${env.app.routePrefix}`,
            },
        ];

        expressApp.use(
            env.swagger.route,
            env.swagger.username ? basicAuth({
                users: {
                    [`${env.swagger.username}`]: env.swagger.password,
                },
                challenge: false,
            }) : (req, res, next) => next(),
            swaggerUi.serve,
            swaggerUi.setup(swaggerFile)
        );

        // Run application to listen on given port
         const httpServer = expressApp.listen(env.app.port, () => {
            // our only exception to avoiding console.log(), because we
            // always want to know when the server is done starting up
            console.log('Application server is running');
        });

        expressApp.get(
            env.app.routePrefix,
            (req: express.Request, res: express.Response) => {
                return res.json({
                    name: env.app.name,
                    version: env.app.version,
                    description: env.app.description,
                });
            }
        );
        return {
            app:  expressApp as Application,
            server: httpServer as http.Server,
            connection: connection as Connection,
        } as BootstrapSettings;
};
