import path from 'path';
import webpack from 'webpack';

const outputDir = path.join(__dirname, 'build');

export default {
    devtool: 'source-map',
    entry: {
        main: [
            'react-hot-loader/patch',
            'babel-polyfill',
            './src/index.js'
        ]
    },
    output: {
        path: outputDir,
        filename: 'bundle.js',
        publicPath: '/dist/'
    },
    resolve: {
        modules: [
            'src',
            'node_modules'
        ],
        extensions: ['.json', '.js', '.jsx'],
        alias: {
            'rdx-json-api': path.join(__dirname, '..', 'lib')
        }
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NamedModulesPlugin(),
        new webpack.NoEmitOnErrorsPlugin()
    ],
    module: {
        rules: [
            // {
            //     test: /\.jsx?/,
            //     exclude: /node_modules/,
            //     enforce: 'pre',
            //     loader: 'eslint-loader'
            // },
            {
                test: /\.jsx?/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            }
        ]
    },
    devServer: {
        contentBase: path.join(__dirname, 'public'),
        host: 'localhost',
        port: process.env.PORT || 4000,
        historyApiFallback: true,
        hot: true
    }
};
