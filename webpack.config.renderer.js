var fs = require("fs");
const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const preprocessorDirectives = require("./webpack.config-preprocessor-directives");

const aliases = {
    "readium-desktop": path.resolve(__dirname, "src"),

    "@r2-utils-js": "r2-utils-js/dist/es6-es2015/src",
    "@r2-lcp-js": "r2-lcp-js/dist/es6-es2015/src",
    "@r2-opds-js": "r2-opds-js/dist/es6-es2015/src",
    "@r2-shared-js": "r2-shared-js/dist/es6-es2015/src",
    "@r2-streamer-js": "r2-streamer-js/dist/es6-es2015/src",
    "@r2-navigator-js": "r2-navigator-js/dist/es6-es2015/src",
};

////// ================================
////// EXTERNALS
// Some modules cannot be bundled by Webpack
// for example those that make internal use of NodeJS require() in special ways
// in order to resolve asset paths, etc.
// In DEBUG / DEV mode, we just external-ize as much as possible (any non-TypeScript / non-local code),
// to minimize bundle size / bundler computations / compile times.

// const nodeExternals = require("webpack-node-externals");
const nodeExternals = require("./nodeExternals");

// Get node environment
const nodeEnv = process.env.NODE_ENV || "development";

let externals = {
    "bindings": "bindings",
    "leveldown": "leveldown",
    "fsevents": "fsevents",
    "conf": "conf"
}
if (nodeEnv !== "production") {
    // // externals = Object.assign(externals, {
    // //         "electron-config": "electron-config",
    // //     }
    // // );
    // const { dependencies } = require("./package.json");
    // const depsKeysArray = Object.keys(dependencies || {});
    // const depsKeysObj = {};
    // depsKeysArray.forEach((depsKey) => { depsKeysObj[depsKey] = depsKey });
    // externals = Object.assign(externals, depsKeysObj);
    // delete externals["pouchdb-core"];

    if (process.env.WEBPACK === "bundle-external") {
        externals = [
            nodeExternals(
                {
                    processName: "RENDERER",
                    alias: aliases,
                    // whitelist: ["pouchdb-core"],
                }
            ),
        ];
    }
}

console.log("WEBPACK externals (RENDERER):");
console.log(JSON.stringify(externals, null, "  "));
////// EXTERNALS
////// ================================


let config = Object.assign({}, {
    entry: "./src/index_app.ts",
    name: "renderer index app",
    output: {
        filename: "index_app.js",
        path: path.join(__dirname, "dist"),
        // https://github.com/webpack/webpack/issues/1114
        libraryTarget: "commonjs2",
    },
    target: "electron-renderer",

    mode: nodeEnv,

    externals: externals,

    resolve: {
        extensions: [".ts", ".tsx", ".js", ".jsx"],
        alias: aliases,
    },

    module: {
        rules: [
            {
                exclude: /node_modules/,
                loaders: ["react-hot-loader/webpack", "awesome-typescript-loader"],
                test: /\.tsx?$/,
            },
            {
                loader: "file-loader?name=assets/[name].[hash].[ext]",
                test: /\.(png|jpe?g|gif|ico)$/,
            },
            {
                exclude: /node_modules/,
                loader: "svg-sprite-loader",
                test: /\.svg$/,
            },
            {
                exclude: /src/,
                loader: "file-loader?name=assets/[name].[hash].[ext]",
                test: /\.(woff|woff2|ttf|eot|svg)$/,
            },
            {
                exclude: /node_modules/,
                test: /\.md$/,
                use: [
                    {
                        loader: "html-loader",
                    },
                    {
                        loader: "markdown-loader",
                    }
                ]
            }
        ],
    },

    devServer: {
        contentBase: __dirname,
        hot: true,
        watchContentBase: true
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "./src/index_app.ejs",
            filename: "index_app.html",
        }),
        new MiniCssExtractPlugin({
            filename: "styles_app.css",
        }),
        preprocessorDirectives.definePlugin,
    ],
});

if (nodeEnv !== "production") {
    const port = parseInt(preprocessorDirectives.portApp, 10);
    console.log("APP PORT: " + port);

    // Renderer config for DEV environment
    config = Object.assign({}, config, {
        // Enable sourcemaps for debugging webpack's output.
        devtool: "source-map",

        devServer: {
            contentBase: __dirname,
            headers: {
                "Access-Control-Allow-Origin": "*",
            },
            hot: true,
            watchContentBase: true,
            port,
        },
    });

    config.output.pathinfo = true;

    config.output.publicPath = preprocessorDirectives.rendererAppBaseUrl;
    config.plugins.push(new webpack.HotModuleReplacementPlugin());
    config.module.rules.push({
        test: /\.css$/,
        use: [
            MiniCssExtractPlugin.loader,
            {
                loader: "css-loader",
                options: {
                    importLoaders: 1,
                    modules: true,
                },
            },
            "postcss-loader",
        ],
    });
} else {
    // Minify and uglify in production environment
    //config.plugins.push(new UglifyJsPlugin());
    config.module.rules.push({
        test: /\.css$/,
        use: [
            "css-hot-loader",
            MiniCssExtractPlugin.loader,
            {
                loader: "css-loader",
                options: {
                    importLoaders: 1,
                    modules: true,
                },
            },
            "postcss-loader",
        ],
    });
}

module.exports = config;
