import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    entry: './frontend/src/index.js',
    output: {
        path: path.resolve(__dirname, 'frontend/public'),
        filename: 'bundle.js',
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: 'babel-loader',
            },
        ],
    },
    resolve: {
        extensions: ['.js', '.jsx'],
    },
    devServer: {
        static: path.join(__dirname, 'frontend/public'),
        port: 3000,
        proxy: [
            {
                context: ['/api'],
                target: 'http://localhost:5000',
            },
        ],
    },
};
