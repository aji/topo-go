const path = require('path');
const logger = require('pino')();
const webpack = require('webpack');

logger.info('Starting bundler');

webpack({
    mode: 'production',
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'bundle.js',
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
});

logger.info('Bundling finished');
