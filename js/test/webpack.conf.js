var path = require('path');

module.exports = {
    entry: './test/src/index.js',
    output: {
        path: __dirname + "/build",
        filename: "bundle.js",
        publicPath: "./build/"
    },
    bail: true,
    module: {
        loaders: [
            { test: /\.js$/, loader: 'babel-loader', query: {presets: ['es2015', 'stage-0']}, exclude: /node_modules/ },
            { test: /\.css$/, loader: 'style-loader!css-loader' },
            { test: /\.json$/, loader: 'json-loader' },
        ],
    }
}
