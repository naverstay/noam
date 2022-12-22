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

const srcPath = path.resolve(__dirname, 'src/');
const distPath = path.resolve(__dirname, 'dist/');
const minimapPath = path.resolve(srcPath, 'Leaflet-MiniMap-master/dist/Control.MiniMap.min.js');
const distMinimapPath = path.resolve(__dirname, 'dist/js/minimap.js');
const markerClusterPath = path.resolve(srcPath, 'Leaflet.markercluster-1.4.1/dist/leaflet.markercluster.js');
const distMarkerClusterPath = path.resolve(__dirname, 'dist/js/markercluster.js');
const imgPath = path.resolve(srcPath, 'img/');
const distImgPath = path.resolve(__dirname, 'dist/img');

const icoPath = path.resolve(srcPath, 'ico/');
const fontPath = path.resolve(srcPath, 'fonts/');
const distFontPath = path.resolve(__dirname, 'dist/fonts');
const favicon = path.resolve(srcPath, 'favicon/');
const staticPath = path.resolve(srcPath, 'static/');

const pugPath = path.resolve(srcPath, 'pug/');
const pugGlobals = path.resolve(pugPath, 'data/global.json');

const MINIFICATION = false;

module.exports = (env, options) => {
  return {
    context: srcPath,
    devtool: 'inline-source-map',
    resolve: {
      alias: {
        '@': srcPath
      }
    },
    entry: {
      app: './js/main.js',
      global: './js/global.js',
      map: './js/map.js',
      fonts: './styl/fonts.styl',
      styles: './styl/main.styl',
      map_styles: './styl/map.styl',
      assets: './assets.js',
      leaflet: './leaflet/leaflet.js'
    },
    output: {
      filename: './js/[name].js',
      path: distPath
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
          exclude: icoPath,
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
          include: icoPath,
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
          include: pugPath,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: '[path][name].html',
                context: pugPath
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
                basedir: pugPath,
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
      minimizer: MINIFICATION ? [
        new UglifyJsPlugin({
          cache: true,
          parallel: true
        }),
        new OptimizeCSSAssetsPlugin({})
      ] : []
    },
    plugins: [
      new FixStyleOnlyEntriesPlugin({
        extensions: ['styl', 'css']
      }),
      new MiniCssExtractPlugin({
        filename: './css/[name].css'
      }),
      new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery',
        'window.jQuery': 'jquery'
      }),
      new CleanWebpackPlugin(distPath),
      new CopyWebpackPlugin([{
        from: staticPath,
        to: distPath
      }, {
        from: favicon,
        to: distPath
      }, {
        from: imgPath,
        to: distImgPath
      }, {
        from: fontPath,
        to: distFontPath
      }, {
        from: minimapPath,
        to: distMinimapPath
      }, {
        from: markerClusterPath,
        to: distMarkerClusterPath
      }
      ]),
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
            baseDir: [distPath]
          }
        }, {
          injectCss: true
        })
      )
    ]
  }
};
