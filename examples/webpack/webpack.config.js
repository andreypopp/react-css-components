var path = require('path');

module.exports = {
  entry: './index.js',
  output: {
    path: 'bundle',
    filename: 'bundle.js',
  },
  devtool: 'cheap-eval-source-map',
  resolve: {
    fallback: path.join(__dirname, 'node_modules'),
  },
  resolveLoader: {
    fallback: path.join(__dirname, 'node_modules'),
  },
  module: {
    loaders: [
      {
        test: /\.react.css$/,
        loader: 'babel-loader!react-css-components/webpack',
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      }
    ]
  }
};
