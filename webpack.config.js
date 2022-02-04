const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');

const CopyWebpackPlugin = require('copy-webpack-plugin');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const IfPlugin = require('if-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const SpriteLoaderPlugin = require('svg-sprite-loader/plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const FixStyleOnlyEntriesPlugin = require("webpack-fix-style-only-entries");

const src = path.resolve(__dirname, 'src/');
const dist = path.resolve(__dirname, 'dist/');

const ico = path.resolve(src, 'ico/');
const staticPath = path.resolve(src, 'static/');

const pug = path.resolve(src, 'pug/');
const pugGlobals = path.resolve(pug, 'data/global.json');

module.exports = env => ({
  context: src,
  devtool: 'inline-source-map',
  resolve: {
    alias: {
      '@': src
    }
  },
  entry: {
    app: './js/main.js',
    styles: './styl/main.styl',
    assets: './assets.js'
  },
  output: {
    filename: './js/[name].js',
    path: dist
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.styl$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: '../'
            }
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: true,
              plugins: [autoprefixer]
            }
          },
          {
            loader: 'stylus-loader',
            options: {
              sourceMap: true
            }
          }
        ]
      },
      {
        test: /\.(gif|png|jpe?g|svg|woff|eot|ttf|woff2)$/,
        exclude: ico,
        use: [{
          loader: 'url-loader',
          options: {
            limit: 8192,
            name: '[path][name].[ext]'
          }
        }]
      },
      //{
      //  test: /\.svg$/,
      //  include: ico,
      //  use: ['svg-sprite-loader', 'svgo-loader']
      //},
      {
        test: /\.svg$/,
        include: ico,
        use: [
          {
            loader: 'svg-sprite-loader',
            options: {
              extract: true,
              symbolId: filePath => 'icon_' + path.basename(filePath).slice(0, -4),
              spriteFilename: 'assets/sprite/icon.svg'
            }
          },
          {
            loader: 'svg-transform-loader'
          },
          {
            loader: 'svgo-loader'
          }
        ]
      },
      {
        test: /\.pug$/,
        include: pug,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[path][name].html',
              context: pug
            }
          },
          'extract-loader',
          {
            loader: 'html-loader',
            options: {
              attrs: ['']
            }
          },
          {
            loader: 'pug-html-loader',
            options: {
              pretty: true,
              exports: false,
              doctype: 'html',
              basedir: pug,
              data: {
                data: () => JSON.parse(fs.readFileSync(pugGlobals, 'utf8'))
              },
              filters: {
                // filter for include json data as empty string
                'json-watch': () => ''
              }
            }
          }
        ]
      }
    ]
  },
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        cache: true,
        parallel: true
      }),
      new OptimizeCSSAssetsPlugin({})
    ]
  },
  plugins: [
    new FixStyleOnlyEntriesPlugin({
      extensions: ['styl', 'css']
    }),
    new MiniCssExtractPlugin({
      filename: './css/app.css'
    }),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery'
    }),
    new CleanWebpackPlugin(dist),
    new CopyWebpackPlugin([{
      from: staticPath,
      to: dist
    }]),
    new SpriteLoaderPlugin({
      plainSprite: true,
      spriteAttrs: {
        style: 'width:0; height:0; visibility:hidden;'
      }
    }),
    new IfPlugin(
      env === 'server',
      new BrowserSyncPlugin({
        host: 'localhost',
        port: 3008,
        ghostMode: false,
        server: {
          baseDir: [dist]
        }
      }, {
        injectCss: true
      })
    )
  ]
});
