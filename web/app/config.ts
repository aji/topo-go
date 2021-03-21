import path from 'path';

export interface Config {
    serverPort: number;
    contentRoot: string;
    staticRoot: string;
}

export function configure(root: string): Config {
    return {
        serverPort: 8000,
        contentRoot: path.join(root, '../content/dist'),
        staticRoot: path.join(root, 'static'),
    };
}
