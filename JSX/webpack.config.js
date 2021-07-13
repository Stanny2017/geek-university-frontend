const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: './main.js',
    module: {
        rules: [
            {
                test: /\.js$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                        plugins: [
                            [
                                '@babel/plugin-transform-react-jsx',
                                { pragma: 'createElement' }
                            ]
                        ]
                    }
                }
            },

            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"],
            }
        ]
    },
    mode: 'none',
    plugins: [new HtmlWebpackPlugin()],
    devtool: 'eval-source-map'
};
