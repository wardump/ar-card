const path = require('path');

module.exports = {
    mode:    'development',
    entry:   path.resolve(__dirname, 'src/ar-card.js'),
    output:  {
        path:     path.resolve(__dirname, 'dist'),
        filename: 'ar-card.js',
    },
    resolve: {
        modules:    [
            'node_modules'
        ],
        extensions: ['.js', '.json', '.jsx', '.css'],
    },
    module: {
        rules: [
            {
                test: /\.html$/i,
                loader: 'html-loader',
            },
            {
                test: /\.(png|jpg|gif)$/i,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: true,
                            mimetype: 'image/png',
                        },
                    },
                ],
            },
        ],
    }
};
