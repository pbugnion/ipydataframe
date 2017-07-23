var path = require('path');

var loaders = [
    { test: /\.json$/, loader: 'json-loader' },
    { test: /\.js$/, loader: 'babel-loader', query: {presets: ['es2015', 'stage-0']}, exclude: /node_modules/ },
    { test: /\.css$/, loader: "style-loader!css-loader" },
    { test: /\.(jpg|png|gif)$/, loader: "file-loader" }
];

module.exports = {
    entry: ['babel-polyfill', './test/src/index.js'],
    output: {
        path: __dirname + "/build",
        filename: "bundle.js",
        publicPath: "./build/",
    },
    bail: true,
    module: { loaders: loaders }
}
