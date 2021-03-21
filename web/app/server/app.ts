import express, { Application, Request, Response, NextFunction } from 'express';

import { Config } from '../config';
import { timerMs } from '../util';
import logger from '../logger';

import { createApiV1Router } from './api-v1';
import { createPageRouter } from './pages';

function requestLogger() {
    return (req: Request, res: Response, next: NextFunction) => {
        const path = req.path;
        const timer = timerMs();
        next();
        logger.info(
            {
                path,
                elapsedMs: timer(),
            },
            'request'
        );
    };
}

export function createApp(cf: Config): Application {
    const app = express();

    app.set('view engine', 'pug');
    app.use('/', requestLogger());

    app.use('/', createPageRouter(cf));
    app.use('/api/v1', createApiV1Router(cf));
    app.use('/content', express.static(cf.contentRoot));

    return app;
}
