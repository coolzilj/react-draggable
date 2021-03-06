var webpack = require('webpack');
const ShellPlugin = require('webpack-shell-plugin');
const postBuildScript = process.env.YALC === 'true' ? 'npx yalc push --changed' : 'true';

module.exports = {
	entry: './index.js',
	output: {
    filename: './dist/react-draggable.js',
    sourceMapFilename: './dist/react-draggable.js.map',
    devtoolModuleFilenameTemplate: '../[resource-path]',
    library: 'ReactDraggable',
    libraryTarget: 'umd'
	},
  externals: {
    'react': {
      'commonjs': 'react',
      'commonjs2': 'react',
      'amd': 'react',
      // React dep should be available as window.React, not window.react
      'root': 'React'
    },
    'react-dom': {
      'commonjs': 'react-dom',
      'commonjs2': 'react-dom',
      'amd': 'react-dom',
      'root': 'ReactDOM'
    }
  },
	module: {
		rules: [
			{
        test: /\.(?:js|es).?$/,
        loader: 'babel-loader?cacheDirectory',
        exclude: /(node_modules)/
      }
		]
	},
  resolve: {
    extensions: ['.js']
  },
  plugins: [
    new webpack.EnvironmentPlugin({
      // Default values
      DRAGGABLE_DEBUG: false,
      NODE_ENV: 'production'
    }),
    // Scope hoisting
    new webpack.optimize.ModuleConcatenationPlugin(),
    new ShellPlugin({ onBuildExit: postBuildScript }),
  ]
};
