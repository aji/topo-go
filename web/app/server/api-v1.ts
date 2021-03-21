import express, { Router, Request, Response, NextFunction } from 'express';

import { Config } from '../config';

class ApiError extends Error {
    status: number;
    message: string;

    constructor(status: number, message: string) {
        super(message);
        this.status = status;
        this.message = message;
    }
}

export function createApiV1Router(cf: Config): Router {
    const api = express.Router();

    api.get('/ping', (req: Request, res: Response) => {
        res.type('txt').send('pong');
    });

    api.get('/tables', (req: Request, res: Response) => {
        const result = [];

        for (const table of cf.tableList.values()) {
            result.push({
                id: table.id,
                name: table.name,
            });
        }

        res.json({ tables: result });
    });

    api.get(
        '/tables/:table',
        (req: Request, res: Response, next: NextFunction) => {
            const tableId = req.params.table;
            const table = cf.tableList.get(tableId);

            if (table === undefined) {
                return next(new ApiError(404, `no such table: ${tableId}`));
            }

            res.json({ id: table.id, name: table.name });
        }
    );

    api.use((e: any, req: Request, res: Response, next: NextFunction) => {
        if (e instanceof ApiError) {
            res.status(e.status).json({ message: e.message });
        } else {
            res.status(500).json({ message: e + '' });
        }
    });

    return api;
}
