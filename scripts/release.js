#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const readline = require("readline/promises");
const { stdin, stdout } = require("process");

const rootDir = path.resolve(__dirname, "..");

function runCommand(command, args) {
	const result = spawnSync(command, args, {
		cwd: rootDir,
		stdio: "inherit",
		env: process.env,
	});

	if (result.status !== 0) {
		process.exit(result.status || 1);
	}
}

function runCommandCapture(command, args) {
	const result = spawnSync(command, args, {
		cwd: rootDir,
		stdio: ["ignore", "pipe", "pipe"],
		encoding: "utf8",
		env: process.env,
	});

	return {
		status: result.status,
		stdout: (result.stdout || "").trim(),
		stderr: (result.stderr || "").trim(),
	};
}

function getPackageVersion() {
	const packageJsonPath = path.join(rootDir, "package.json");
	const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
	return pkg.version;
}

function isYes(answer) {
	const normalized = String(answer || "")
		.trim()
		.toLowerCase();
	return normalized === "y" || normalized === "yes";
}

function fileExists(relativePath) {
	return fs.existsSync(path.join(rootDir, relativePath));
}

function getReleaseFilesToStage() {
	const candidates = ["package.json", "package-lock.json", "README.md", "src/heartslider.js", "src/heartslider.css", "dist/heartslider.min.js", "dist/heartslider.min.css", "dist/heartslider.min.mjs"];

	return candidates.filter(fileExists);
}

function tagExists(tagName) {
	const result = runCommandCapture("git", ["rev-parse", "-q", "--verify", `refs/tags/${tagName}`]);
	return result.status === 0;
}

function hasChangesInReleaseFiles(releaseFiles) {
	if (releaseFiles.length === 0) {
		return false;
	}

	const result = runCommandCapture("git", ["status", "--porcelain", "--", ...releaseFiles]);
	if (result.status !== 0) {
		return false;
	}

	return result.stdout.length > 0;
}

async function promptForVersionArg(initialArg) {
	if (initialArg && initialArg.trim()) {
		return initialArg.trim();
	}

	const rl = readline.createInterface({ input: stdin, output: stdout });
	try {
		const response = await rl.question("Version bump (patch/minor/major/prerelease or explicit x.y.z) [patch]: ");
		const selected = response.trim();
		return selected || "patch";
	} finally {
		rl.close();
	}
}

async function run() {
	const bumpArg = await promptForVersionArg(process.argv[2]);

	console.log(`\nBumping version with: npm version ${bumpArg} --no-git-tag-version\n`);
	runCommand("npm", ["version", bumpArg, "--no-git-tag-version"]);

	console.log("\nSyncing version references...\n");
	runCommand("npm", ["run", "version:sync"]);

	console.log("\nRunning build...\n");
	runCommand("npm", ["run", "build"]);

	const version = getPackageVersion();
	const releaseTag = `v${version}`;
	console.log(`\nRelease artifacts are built for v${version}.\n`);

	const rl = readline.createInterface({ input: stdin, output: stdout });
	try {
		const createCommitAndTagAnswer = await rl.question("Create release commit and tag now? (y/N): ");
		if (isYes(createCommitAndTagAnswer)) {
			const releaseFiles = getReleaseFilesToStage();

			if (releaseFiles.length === 0) {
				console.log("No release files found to stage. Skipping commit/tag.");
			} else if (!hasChangesInReleaseFiles(releaseFiles)) {
				console.log("No release file changes to commit. Skipping commit/tag.");
			} else {
				runCommand("git", ["add", ...releaseFiles]);
				runCommand("git", ["commit", "-m", `release: ${releaseTag}`]);

				if (tagExists(releaseTag)) {
					console.log(`Tag ${releaseTag} already exists. Skipping tag creation.`);
				} else {
					runCommand("git", ["tag", releaseTag]);
				}
			}
		} else {
			console.log("Skipped release commit/tag.");
		}

		const publishNpmAnswer = await rl.question("Publish to npm now? (y/N): ");
		if (isYes(publishNpmAnswer)) {
			runCommand("npm", ["publish"]);
		} else {
			console.log("Skipped npm publish.");
		}

		const pushGithubAnswer = await rl.question("Push commits and tags to GitHub now? (y/N): ");
		if (isYes(pushGithubAnswer)) {
			runCommand("git", ["push"]);
			runCommand("git", ["push", "--tags"]);
		} else {
			console.log("Skipped GitHub push.");
		}
	} finally {
		rl.close();
	}

	console.log("\nRelease flow complete.");
}

run().catch((error) => {
	console.error(error.message);
	process.exit(1);
});
