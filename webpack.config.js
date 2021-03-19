const webpack = require('webpack');
const WebpackModules = require('webpack-modules');
const path = require('path');
const config = require('sapper/config/webpack.js');
const pkg = require('./package.json');
const dotenv = require('dotenv');

const mode = process.env.NODE_ENV;
const dev = mode === 'development';

const alias = {
	svelte: path.resolve('node_modules', 'svelte'),
	components: path.resolve(__dirname, 'src/components'),
	utils: path.resolve(__dirname, 'src/utils'),
	"dom-actions": path.resolve(__dirname, 'src/dom-actions')
};
const extensions = ['.mjs', '.js', '.ts', '.json', '.svelte', '.html'];
const mainFields = ['svelte', 'module', 'browser', 'main'];
const fileLoaderRule = {
	test: /\.(png|jpe?g|gif)$/i,
	use: [
		'file-loader',
	]
};

const preprocess = {
	replace: [[/<template(.+)\/>/gim, '<template$1></template>']],
	pug: true,
	preserve: ['ld+json'],
	sass: {
		includePaths: ['src'],
	},
	postcss: {
		plugins: [require('autoprefixer')],
	},
	sourceMap: dev
};

function envVars(filterPrefix = 'VERCEL_', targetPrefix = 'process.env.', excluded = []) {
	dotenv.config();
	let vars = {};
	for (let key in process.env) {
		if (key.includes(filterPrefix) && !excluded.includes(key)) {
			vars[targetPrefix + key] = ("'" + process.env[key] + "'");
		}
	}
	return vars;
}

module.exports = {
	client: {
		entry: { main: config.client.entry().main.replace(/\.js$/, '.ts') },
		output: config.client.output(),
		resolve: { alias, extensions, mainFields },
		module: {
			rules: [
				{
					test: /\.ts$/,
					loader: 'ts-loader'
				},
				{
					test: /\.(svelte|html)$/,
					use: {
						loader: 'svelte-loader',
						options: {
							dev,
							hydratable: true,
							preprocess: require('svelte-preprocess')(preprocess),
							hotReload: false // pending https://github.com/sveltejs/svelte/issues/2377
						}
					}
				},
				fileLoaderRule
			]
		},
		mode,
		plugins: [
			// pending https://github.com/sveltejs/svelte/issues/2377
			// dev && new webpack.HotModuleReplacementPlugin(),
			new webpack.DefinePlugin({
				...envVars(),
				'process.browser': true,
				'process.env.NODE_ENV': JSON.stringify(mode)
			}),
			new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
		].filter(Boolean),
		devtool: dev && 'inline-source-map'
	},

	server: {
		entry: { server: config.server.entry().server.replace(/\.js$/, '.ts') },
		output: config.server.output(),
		target: 'node',
		resolve: { alias, extensions, mainFields },
		externals: Object.keys(pkg.dependencies).concat('encoding'),
		module: {
			rules: [
				{
					test: /\.ts$/,
					loader: 'ts-loader'
				},
				{
					test: /\.(svelte|html)$/,
					use: {
						loader: 'svelte-loader',
						options: {
							css: false,
							generate: 'ssr',
							hydratable: true,
							preprocess: require('svelte-preprocess')(preprocess),
							dev
						}
					}
				},
				fileLoaderRule
			]
		},
		mode,
		plugins: [
			new WebpackModules()
		],
		performance: {
			hints: false // it doesn't matter if server.js is large
		}
	},

	serviceworker: {
		entry: { 'service-worker': config.serviceworker.entry()['service-worker'].replace(/\.js$/, '.ts') },
		output: config.serviceworker.output(),
		resolve: { extensions: ['.mjs', '.js', '.ts', '.json'] },
		module: {
			rules: [
				{
					test: /\.ts$/,
					loader: 'ts-loader'
				}
			]
		},
		mode
	}
};
