import express, { Router, Request, Response, NextFunction } from 'express';

import { Config } from '../config';

export function createPageRouter(cf: Config): Router {
    const pages = express.Router();

    pages.get('/*', (req: Request, res: Response, next: NextFunction) => {
        res.sendFile(req.path, { root: cf.staticRoot }, () => next());
    });

    pages.get('/', (req: Request, res: Response, next: NextFunction) => {
        res.render('index');
    });

    return pages;
}
