#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const packageJsonPath = path.join(rootDir, "package.json");
const jsPath = path.join(rootDir, "src", "heartslider.js");
const cssPath = path.join(rootDir, "src", "heartslider.css");
const readmePath = path.join(rootDir, "README.md");

const checkOnly = process.argv.includes("--check");

function readUtf8(filePath) {
	return fs.readFileSync(filePath, "utf8");
}

function writeUtf8(filePath, content) {
	fs.writeFileSync(filePath, content, "utf8");
}

function getVersionFromPackageJson() {
	const pkg = JSON.parse(readUtf8(packageJsonPath));
	if (!pkg.version || typeof pkg.version !== "string") {
		throw new Error("Could not find a valid version in package.json");
	}
	return pkg.version;
}

function captureVersion(fileText, regex, label) {
	const match = fileText.match(regex);
	if (!match || !match[1]) {
		throw new Error(`Could not locate ${label} version pattern.`);
	}
	return match[1].trim();
}

function replaceVersion(fileText, regex, replacement) {
	if (!regex.test(fileText)) {
		return { changed: false, nextText: fileText, matched: false };
	}
	const nextText = fileText.replace(regex, replacement);
	return { changed: nextText !== fileText, nextText, matched: true };
}

function syncFileVersion(filePath, regex, replacementBuilder, label, packageVersion) {
	const original = readUtf8(filePath);
	const current = captureVersion(original, regex, label);
	if (current === packageVersion) {
		return { filePath, label, status: "ok" };
	}

	if (checkOnly) {
		return {
			filePath,
			label,
			status: "mismatch",
			current,
			expected: packageVersion,
		};
	}

	const replacement = replacementBuilder(packageVersion);
	const result = replaceVersion(original, regex, replacement);
	if (!result.matched) {
		throw new Error(`Could not update ${label} version pattern.`);
	}
	if (result.changed) {
		writeUtf8(filePath, result.nextText);
	}

	return {
		filePath,
		label,
		status: "updated",
		previous: current,
		expected: packageVersion,
	};
}

function run() {
	const packageVersion = getVersionFromPackageJson();

	const files = [
		{
			filePath: jsPath,
			label: "JS header",
			regex: /❤ Version\s+([^\s]+)\s+❤/,
			replacementBuilder: (version) => `❤ Version ${version} ❤`,
		},
		{
			filePath: cssPath,
			label: "CSS header",
			regex: /\/\* HeartSlider Styles\s+[\u2014\-]\s+([^*]+)\*\//,
			replacementBuilder: (version) => `/* HeartSlider Styles - ${version} */`,
		},
		{
			filePath: readmePath,
			label: "README version",
			regex: /^##### Version\s+(.+)$/m,
			replacementBuilder: (version) => `##### Version ${version}`,
		},
	];

	const results = files.map((entry) => {
		return syncFileVersion(entry.filePath, entry.regex, entry.replacementBuilder, entry.label, packageVersion);
	});

	const mismatches = results.filter((result) => result.status === "mismatch");

	if (checkOnly && mismatches.length > 0) {
		console.error("Version mismatch found. Run `npm run version:sync` to fix:");
		for (const mismatch of mismatches) {
			console.error(`- ${mismatch.label}: found ${mismatch.current}, expected ${mismatch.expected}`);
		}
		process.exit(1);
	}

	if (!checkOnly) {
		const updates = results.filter((result) => result.status === "updated");
		if (updates.length === 0) {
			console.log(`Versions already in sync at ${packageVersion}.`);
		} else {
			console.log(`Synced ${updates.length} file(s) to version ${packageVersion}:`);
			for (const update of updates) {
				console.log(`- ${update.label}: ${update.previous} -> ${update.expected}`);
			}
		}
	} else {
		console.log(`Version check passed: ${packageVersion}`);
	}
}

try {
	run();
} catch (error) {
	console.error(error.message);
	process.exit(1);
}
