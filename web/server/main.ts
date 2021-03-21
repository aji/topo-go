import express, { Application, Request, Response, NextFunction } from 'express';
import path from 'path';

import { timerMs } from './util';

const logger = require('pino')();

const serverPort = 8000;
const contentRoot = path.join(__dirname, '../content/dist');
const staticRoot = path.join(__dirname, 'static');

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

function createApp(): Application {
    const app = express();

    app.set('view engine', 'pug');

    app.use('/', requestLogger());
    app.use('/content', express.static(contentRoot));
    app.get('/*', (req: Request, res: Response, next: NextFunction) => {
        res.sendFile(req.path, { root: staticRoot }, () => next());
    });

    app.get('/', (req: Request, res: Response, next: NextFunction) => {
        res.render('index');
    });

    return app;
}

process.chdir(__dirname);

createApp().listen(serverPort, () => {
    logger.info(
        {
            cwd: process.cwd(),
            bind: `http://127.0.0.1:${serverPort}`,
            contentRoot,
        },
        'server started'
    );
});
