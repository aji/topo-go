import express, { Router, Request, Response, NextFunction } from 'express';

import { Config } from '../config';

export function createPageRouter(cf: Config): Router {
    const pages = express.Router();

    pages.use('/', (req: Request, res: Response, next: NextFunction) => {
        res.sendFile(
            req.path,
            { root: cf.staticRoot },
            (e) => e === undefined || next()
        );
    });

    pages.get('/', (req: Request, res: Response, next: NextFunction) => {
        function mapTableList(): Array<any> {
            const tables: Array<any> = [];
            cf.tableList.forEach((t) =>
                tables.push({
                    id: t.id,
                    name: t.name,
                    players: t.players.map((p) => {
                        name: p.name;
                    }),
                    game:
                        t.game === null
                            ? null
                            : {
                                  name: 'something',
                              },
                })
            );
            return tables;
        }

        res.render('page', {
            view: 'index',
            title: null,
            options: {
                tables: mapTableList(),
            },
        });
    });

    pages.get(
        '/tables/:id',
        (req: Request, res: Response, next: NextFunction) => {
            const tableId: string = req.params.id;
            const table = cf.tableList.get(tableId);

            if (table === undefined) {
                return next(`no such table: ${tableId}`);
            }

            res.render('page', {
                view: 'table',
                title: table.name,
                options: { table },
            });
        }
    );

    return pages;
}
