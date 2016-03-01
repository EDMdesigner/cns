#!/usr/bin/env node

var fs			= require("fs"),
	nconf		= require("nconf"),
	dateFormat	= require("dateformat"),
	async		= require("async"),
	cnsUtils	= require("./cnsUtils");


console.log("CNS - Clone 'N' Start");

//config...
var configFile = "./cnsConfig.json";
nconf.argv();

configFile = nconf.get("config");

console.log("Config file: ", configFile);
if (!fs.existsSync(configFile)) {
	return console.log(" - Config file does not exist!");
}

nconf.file({file: configFile});



var baseDir = nconf.get("deploymentsBasePath"),
	repos = nconf.get("repos")
	noGrunt = nconf.get("noGrunt"),
	formattedDate = dateFormat(new Date(), "yyyy-mm-dd_H-MM-ss");


function getDirNameOfRepo(repoName) {
	return baseDir + "/" + formattedDate + "/" + repoName;
}

var repoPaths = [];
for (var repoName in repos) {
	repoPaths.push(getDirNameOfRepo(repoName));
}


//create dirs
// - one dir with the actual date in the deployments folder
// - one dir in the previously created dir for every repository

function createDirectories(callback) {
	console.log(">>>>>>>>>> Creating directories <<<<<<<<<<");
	var dir = baseDir;
	cnsUtils.createDirIfNeeded(dir);
	cnsUtils.createDirIfNeeded(dir + "/" + formattedDate);

	for (var repoName in repos) {
		cnsUtils.createDirIfNeeded(getDirNameOfRepo(repoName));
	}
	callback();
}


//clone all repos
function cloneAllRepos(callback) {
	console.log(">>>>>>>>>> Cloning repositories <<<<<<<<<<");
	var gitRepos = [];
	for (var repoName in repos) {
		var act = repos[repoName].git;
		act.path = getDirNameOfRepo(repoName);
		gitRepos.push(act);
	}

	async.forEachSeries(gitRepos, function(gitRepo, callback) {
		cnsUtils.cloneRepo(gitRepo.path, gitRepo.repositoryBase, gitRepo.repositoryName, gitRepo.branch, callback);
	}, function(err) {
		callback();
	});
}

//run npm installs
function runNpmInstalls(callback) {
	console.log(">>>>>>>>>> Running npm installs <<<<<<<<<<");

	async.forEachSeries(repoPaths, cnsUtils.npmInstall, function(err) {
		callback();
	});
}

//run grunt scripts
function runGruntScripts(callback) {
	console.log(">>>>>>>>>> Running grunt scripts <<<<<<<<<<");

	if (noGrunt) {
		return callback();
	}

	async.forEachSeries(repoPaths, cnsUtils.gruntBuild, function(err) {
		callback();
	});
}

//start all of the applications
function restartApplications(callback) {
	console.log(">>>>>>>>>> Starting the applications <<<<<<<<<<");

	//function startNewVersion(path, startCommand, callback) {

	var elems = [];

	for (var repoName in repos) {
		var act = repos[repoName].start;

		var basePath = getDirNameOfRepo(repoName);

		for(var prop in act) {
			var uid = repoName + ":" + prop;

			var dir = act[prop].dir;
			var command = act[prop].command;

			elems.push({
				path: basePath + "/" + dir,
				uid: uid,
				startCommand: command
			});
		}
	}

	//function startNewVersion(path, uid, startCommand, callback) {

	async.forEachSeries(elems, function(item, callback) {
		cnsUtils.startNewVersion(item.path, item.uid, item.startCommand, callback);
	}, function(err) {
		callback();
	});
}


async.series([
		createDirectories,
		cloneAllRepos,
		runNpmInstalls,
		runGruntScripts,
		restartApplications
	],
	function(err, result) {
		console.log("********** DONE **********");
	}
);
