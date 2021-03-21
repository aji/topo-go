import path from 'path';

import { TableList, newDefaultTableList } from './table';

export interface Config {
    serverPort: number;
    contentRoot: string;
    staticRoot: string;
    tableList: TableList;
}

export function configure(root: string): Config {
    return {
        serverPort: 8000,
        contentRoot: path.join(root, '../content/dist'),
        staticRoot: path.join(root, 'static'),
        tableList: newDefaultTableList(),
    };
}
