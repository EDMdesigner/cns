#!/usr/bin/env node

//CNS - Clone 'n' Start


var fs		= require("fs"),
	nconf	= require("nconf"),
	dateFormat = require("dateformat"),
	exec	= require("child_process").exec;
//deploy
//deploy test

//list versions
//activate --version
//activate previous version

nconf
	.argv()
	.env()
	.file({file: "./cnsConfig.json"});

var branch			= nconf.get("git:branch"),
	repositoryBase	= nconf.get("git:repositoryBase"),
	repositoryName	= nconf.get("git:repositoryName");


var dirName = dateFormat(new Date(), "yyyy-mm-dd_hh-MM-ss");

var baseDir = nconf.get("deploymentsBasePath");

var startDir = nconf.get("startDir");
var startCommand = nconf.get("startCommand");


function cloneAndStart() {
	console.log("Clone and start...");
	createDirs();
}

function createDirs() {
	console.log("Creating directories...");

	function dirError(dirPath) {
		console.error("Failed to create directory: ", dirPath);
		process.exit(1);
	}

	function createDirIfNeeded(dirPath) {
		if (fs.existsSync(dirPath)) {
			return;
		}

		try {
			fs.mkdirSync(dirPath);
		} catch (e) {
			dirError(dirPath);
		}
	}

	var dirToMake = baseDir;
	createDirIfNeeded(dirToMake);

	dirToMake = dirToMake + "/" + repositoryName;
	createDirIfNeeded(dirToMake);

	dirToMake = dirToMake + "/" + dirName;
	createDirIfNeeded(dirToMake);



	process.chdir(dirToMake);

	cloneRepo(npmInstall);
}

function exitOnError(err, stdout, stderr, msg) {
	if (err) {
		console.error(msg);
		console.log(stderr);
		process.exit();
	}
}


function cloneRepo() {
	console.log("Cloning repository...")
	var repoUri = repositoryBase + "/" + repositoryName + ".git";

	var gitCloneCommand = "git clone -b " + branch + " --single-branch " + repoUri + " .";
	

	exec(gitCloneCommand, function (err, stdout, stderr) {
		exitOnError(err, stdout, stderr, "Repository cloning failed!");

		console.log(stdout);

		npmInstall();
	});
}

function npmInstall() {
	console.log("NPM install...")
	exec("npm install", function(err, stdout, stderr) {
		exitOnError(err, stdout, stderr, "NPM install failed!");

		console.log(stdout);

		gruntBuild();
	});
}

function gruntBuild() {
	console.log("Grunt build...");
	exec("grunt", function(err, stdout, stderr) {
		exitOnError(err, stdout, stderr, "Grunt build failed!");

		console.log(stdout);

		startNewVersion();
	});
}

//here, the version equals the name of the directory.
function startNewVersion(version) {
	console.log("Forever stop " + startCommand);
	process.chdir(startDir);

	exec("forever stop " + startCommand, function(err, stdout, stderr) {
		console.log("Starting new deployment...");

		exec("forever start " + startCommand, function(err, stdout, stderr) {
			exitOnError(err, stdout, stderr, "Starting new instance failed!");

			console.log(stdout);

			console.log("DEPLOYMENT SUCCESSFUL!!!");
		});	
	});
}




cloneAndStart();
