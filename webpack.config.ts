/*
 * Copyright (c) QieTv, Inc. 2018
 * @Author: idzeir
 * @Date: 2021-02-07 11:25:51
 * @Last Modified by: idzeir
 * @Last Modified time: 2021-02-26 14:16:28
 */
import fs from "fs";
import path from "path";
import webpack from "webpack";
import TerserPlugin from "terser-webpack-plugin";
import WebpackDevServer from "webpack-dev-server";
import HtmlWebpackPlugin from "html-webpack-plugin";
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";

class ConsoleLogOnBuildWebpackPlugin implements webpack.WebpackPluginInstance {
    apply(compiler: webpack.Compiler) {
        const PLUGIN_NAME = "ConsoleLogOnBuildWebpackPlugin";

        compiler.hooks.run.tap(PLUGIN_NAME, (compilation) => {
            console.log("The webpack build process is starting!!!");
        });

        compiler.hooks.afterDone.tap(PLUGIN_NAME, (compilation) => {
            console.log("The webpack build process is finished!!!");
        });
    }
}

const config: (env: { [key: string]: any }) => webpack.Configuration = (
    env
) => {
    const isProd = env.NODE_ENV === "production";
    const outSize = isProd ? 1024 * 1024 : 5 * 1024 * 1024;
    return {
        cache: true,
        mode: isProd ? "production" : "development",
        devtool: isProd ? false : "inline-source-map",
        entry: {
            "qie-app": path.join(__dirname, "src", "index.ts"),
        },
        output: {
            path: path.join(__dirname, "dist"),
            filename: isProd ? "[name].[contenthash:8].js" : "[name].js",
            crossOriginLoading: "anonymous",
            library: "myLib",
            libraryTarget: "umd",
            auxiliaryComment: {
                root: "ROOT COMMENT",
                commonjs: "CommonJS Comment",
                amd: "AMD Comment",
            },
            sourceMapFilename: "[file].map[query]",
            clean: true,
            pathinfo: false,
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/i,
                    use: ["babel-loader"],
                    exclude: /node_modules/,
                    include: path.join(__dirname, "src"),
                },
                {
                    test: /\.s[ac]ss$/i,
                    use: [
                        isProd ? MiniCssExtractPlugin.loader : "style-loader",
                        {
                            loader: "css-loader",
                            options: {
                                importLoaders: 1,
                                modules: {
                                    compileType: "icss",
                                },
                            },
                        },
                        "sass-loader",
                    ],
                    exclude: /\.module\.s[ac]ss$/i,
                    include: /src/,
                },
                {
                    test: /\.module\.s[ac]ss$/i,
                    use: [
                        isProd ? MiniCssExtractPlugin.loader : "style-loader",
                        {
                            loader: "css-loader",
                            options: {
                                importLoaders: 1,
                                modules: {
                                    compileType: "module",
                                    mode: "local",
                                    auto: true,
                                    exportGlobals: true,
                                    localIdentName: "[name]--[hash:base64:5]",
                                    exportLocalsConvention: "camelCaseOnly",
                                    exportOnlyLocals: false,
                                },
                            },
                        },
                        "sass-loader",
                    ],
                },
                {
                    test: /\.(png|svg|jpg|jpeg|gif)$/i,
                    type: "asset/resource",
                    generator: {
                        filename: "static/[hash][ext]",
                    },
                    include: path.join(__dirname, "src"),
                    exclude: /node_modules/,
                },
            ],
        },
        resolve: {
            extensions: [".tsx", ".ts", ".js", ".json"],
            symlinks: false,
            alias: {
                "@/components": path.join(__dirname, "src", "components"),
            },
            cachePredicate(module) {
                if (module?.relativePath?.includes("node_modules")) {
                    return true;
                }
                return false;
            },
        },
        plugins: [
            new ConsoleLogOnBuildWebpackPlugin(),
            new CleanWebpackPlugin({ cleanStaleWebpackAssets: false }),
            new HtmlWebpackPlugin({ title: "Development" }),
            ...(isProd
                ? [
                      new MiniCssExtractPlugin({
                          filename: "[name].[contenthash:8].css",
                      }),
                  ]
                : []),
        ],
        optimization: {
            runtimeChunk: "single",
            moduleIds: "deterministic",
            splitChunks: {
                cacheGroups: {
                    vendor: {
                        test: /[\\/]node_modules[\\/]/,
                        name: "vendors",
                        chunks: "all",
                    },
                },
            },
            ...(!isProd
                ? {
                      removeAvailableModules: false,
                      removeEmptyChunks: false,
                      splitChunks: false,
                  }
                : {
                      minimizer: [
                          new TerserPlugin({
                              exclude: /\/node_modules/,
                              parallel: true,
                              terserOptions: {
                                  compress: true,
                                  output: {
                                      comments: false,
                                      ascii_only: true,
                                  },
                              },
                          }) as webpack.WebpackPluginFunction,
                      ],
                  }),
        },
        devServer: env.local
            ? {
                  hot: true,
                  stats: "errors-only",
                  clientLogLevel: "silent",
                  host: "test.qi-e.tv",
                  port: 3000,
                  index: "index.html",
                  contentBase: ["public", "assets", "dist"],
                  headers: {
                      "X-SERVER": "webpack-dev-server",
                  },
                  http2: true,
                  https: {
                      key: fs.readFileSync(
                          path.join(__dirname, "ssl", "server.key")
                      ),
                      cert: fs.readFileSync(
                          path.join(__dirname, "ssl", "server.crt")
                      ),
                      ca: fs.readFileSync(
                          path.join(__dirname, "ssl", "rootCa.pem")
                      ),
                  },
                  onListening(
                      server: WebpackDevServer & {
                          listeningApp?: { address: () => { port: number } };
                      }
                  ) {
                      console.log(
                          `服务已经启动: ${server.listeningApp?.address().port}`
                      );
                  },
                  proxy: {
                      "/api": {
                          target: "https://live.qq.com",
                          pathRewrite: {},
                          secure: false,
                          changeOrigin: true,
                      },
                  },
              }
            : undefined,
        performance: {
            hints: "error",
            maxEntrypointSize: outSize,
            maxAssetSize: outSize,
        },
        stats: {
            children: false,
            modules: false,
            colors: true,
        },
    };
};

export default config;
