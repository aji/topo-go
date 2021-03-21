import { createApp } from './server/app';
import { configure, Config } from './config';
import logger from './logger';

function main(cf: Config): void {
    createApp(cf).listen(cf.serverPort, () => {
        logger.info(
            {
                cf,
                cwd: process.cwd(),
                bind: `http://127.0.0.1:${cf.serverPort}`,
            },
            'server started'
        );
    });
}

process.chdir(__dirname);
main(configure(process.cwd()));
