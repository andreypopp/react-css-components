var common = require('../webpack.config');

module.exports = Object.assign({}, common(__dirname), {
  module: {
    loaders: [
      {
        test: /\.react.scss/,
        loader: 'react-css-components',
        query: {
          loadCSS: [
            'style-loader',
            'css-loader?modules',
            'sass-loader',
          ]
        }
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      }
    ]
  }
});
