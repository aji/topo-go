import express, { Router, Request, Response, NextFunction } from 'express';

import { Config } from '../config';

export function createApiV1Router(cf: Config): Router {
    const api = express.Router();

    api.get('/ping', (req: Request, res: Response) => {
        res.type('txt').send('pong');
    });

    return api;
}
