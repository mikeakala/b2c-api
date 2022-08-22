import { Application } from 'express';
import { createExpressServer } from 'routing-controllers';
import { configure, format, transports } from 'winston';
import { useContainer as classValidatorUseContainer } from 'class-validator';
import { useContainer as routingUseContainer } from 'routing-controllers';
import { useContainer as typeGraphQLUseContainer } from 'type-graphql';
import { Container } from 'typedi';
import { useContainer as ormUseContainer } from 'typeorm';
import {  createConnection, getConnectionOptions } from 'typeorm';
import * as express from 'express';
import glob from 'glob';
import { env } from './env';
import { defaultMetadataStorage as classTransformerMetadataStorage } from 'class-transformer/storage';
import { getFromContainer, MetadataStorage } from 'class-validator';
import { validationMetadatasToSchemas } from 'class-validator-jsonschema';
import basicAuth from 'express-basic-auth';
import { getMetadataArgsStorage } from 'routing-controllers';
import { routingControllersToSpec } from 'routing-controllers-openapi';
import * as swaggerUi from 'swagger-ui-express';

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
         * eventDispatch
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
            url: env.db.url,
            username: env.db.username,
            password: env.db.password,
            database: env.db.database,
            synchronize: env.db.synchronize,
            logging: env.db.logging,
            useUnifiedTopology: true,
        });

        const connection = await createConnection(connectionOptions);

        if (connection.isConnected) {
            console.log('Database connection has been established');
        }

        const expressApp: Application = createExpressServer({
            cors: true,
            classTransformer: true,
            routePrefix: env.app.routePrefix,
            defaultErrorHandler: false,
            controllers: env.app.dirs.controllers,
            middlewares: env.app.dirs.middlewares,
            interceptors: env.app.dirs.interceptors,
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
         expressApp.listen(env.app.port, () => {
            console.log(`Application server is running at: ${env.app.schema}://${env.app.host}:${env.app.port}${env.swagger.route}`);
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
};

bootstrapApplication();
