#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const packageJsonPath = path.join(rootDir, "package.json");

function readUtf8(filePath) {
	return fs.readFileSync(filePath, "utf8");
}

function writeUtf8(filePath, content) {
	fs.writeFileSync(filePath, content, "utf8");
}

function getVersion() {
	const pkg = JSON.parse(readUtf8(packageJsonPath));
	if (!pkg.version || typeof pkg.version !== "string") {
		throw new Error("Invalid package version.");
	}
	return pkg.version;
}

function withBanner(content, bannerRegex, bannerLine) {
	let normalized = content;
	if (bannerRegex.test(normalized)) {
		normalized = normalized.replace(bannerRegex, "");
	}
	return `${bannerLine}\n${normalized}`;
}

function run() {
	const version = getVersion();
	const jsPath = path.join(rootDir, "dist", "heartslider.min.js");
	const cssPath = path.join(rootDir, "dist", "heartslider.min.css");

	if (!fs.existsSync(jsPath) || !fs.existsSync(cssPath)) {
		throw new Error("Expected dist files were not found. Run build steps before appending banners.");
	}

	const jsBannerLine = `/* ❤ HeartSlider v${version} ❤ */`;
	const cssBannerLine = `/* ❤ HeartSlider Styles v${version} ❤ */`;

	const jsContent = readUtf8(jsPath);
	const cssContent = readUtf8(cssPath);

	const nextJs = withBanner(jsContent, /^\/\* ❤ HeartSlider v[^\n]*\*\/\n?/, jsBannerLine);
	const nextCss = withBanner(cssContent, /^\/\* ❤ HeartSlider Styles v[^\n]*\*\/\n?/, cssBannerLine);

	writeUtf8(jsPath, nextJs);
	writeUtf8(cssPath, nextCss);

	console.log(`Appended dist banners for v${version}.`);
}

try {
	run();
} catch (error) {
	console.error(error.message);
	process.exit(1);
}
