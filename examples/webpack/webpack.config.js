var common = require('../webpack.config');

module.exports = Object.assign({}, common(__dirname), {
  module: {
    loaders: [
      {
        test: /\.react.css$/,
        loader: 'react-css-components',
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      }
    ]
  }
});
