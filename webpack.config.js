const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/popup.js', // This is where your main JavaScript file is
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js', // Webpack will bundle everything into this file
  },
  resolve: {
    fallback: {
      "fs": false,
      "path": false,
      "os": false,
    },
  },
};
