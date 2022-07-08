import svelte from "rollup-plugin-svelte";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
//import livereload from "rollup-plugin-livereload";
import { terser } from "rollup-plugin-terser";
import css from "rollup-plugin-css-only";
import babel from "@rollup/plugin-babel";
import copy from "rollup-plugin-copy";
import json from "@rollup/plugin-json";
import url from "@rollup/plugin-url";

const quick = process.env.quick === "true";
const kaios3 = process.env.kaios === "3";
const test = process.env.test === "true";

export default {
	input: "src/main.js",
	output: {
		sourcemap: false,
		format: "iife",
		file: `dist/build/bundle.js`,
		intro: `const PRODUCTION = true; const DEBUG = ${test};`,
		// no more need for replacing
		// terser will crossout the unnecessary stuff because it is a const
	},
	plugins: [
		copy({
			targets: [{ src: "public/*", dest: "dist/" }],
		}),
		url({ limit: 0 }),
		commonjs(),
		json(),
		svelte({
			compilerOptions: {
				// compiler checks makes the thing very slow
				dev: false,
			},
		}),
		// we'll extract any component CSS out into
		// a separate file - better for performance
		css({ output: "bundle.css" }),

		babel({
			extensions: [".js", ".mjs", ".html", ".svelte"],
			babelHelpers: "runtime",
			exclude: ["node_modules/@babel/**", /\/core-js\//],
			presets: [["@babel/preset-env", { targets: { firefox: kaios3 ? "84" : "48" }, useBuiltIns: "usage", corejs: 3 }]],
			plugins: [
				"@babel/plugin-syntax-dynamic-import",
				...(kaios3 ? [] : ["babel-plugin-transform-async-to-promises"]),
				["@babel/plugin-transform-runtime", { useESModules: true }],
			],
		}),

		// If you have external dependencies installed from
		// npm, you'll most likely need these plugins. In
		// some cases you'll need additional configuration -
		// consult the documentation for details:
		// https://github.com/rollup/plugins/tree/master/packages/commonjs
		resolve({
			browser: true,
			dedupe: ["svelte"],
		}),
		!quick && terser(),
	],
};
