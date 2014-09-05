
var fs		= require("fs"),
	exec	= require("child_process").exec;

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
		console.log(" - Directory created: ", dirPath);
	} catch (e) {
		dirError(dirPath);
	}
}

function exitOnError(err, stdout, stderr, msg) {
	if (err) {
		console.error(msg);
		console.log(stderr);
		process.exit();
	}
}

function cloneRepo(path, repositoryBase, repositoryName, branch, callback) {
	process.chdir(path);

	console.log("Cloning repository...")
	var repoUri = repositoryBase + "/" + repositoryName + ".git";

	console.log(" - Repository URI: ", repoUri);
	console.log(" - Branch: ", branch);

	var gitCloneCommand = "git clone -b " + branch + " --single-branch " + repoUri + " .";
	

	exec(gitCloneCommand, function (err, stdout, stderr) {
		exitOnError(err, stdout, stderr, "Repository cloning failed!");

		console.log(stdout);

		//npmInstall();
		callback();
	});
}

function npmInstall(path, callback) {
	process.chdir(path);

	console.log("NPM install...", path)
	exec("npm install", function(err, stdout, stderr) {
		exitOnError(err, stdout, stderr, "NPM install failed!");

		console.log(stdout);

		//gruntBuild();
		callback();
	});
}

function gruntBuild(path, callback) {
	process.chdir(path);

	console.log("Grunt build...", path);
	exec("grunt", function(err, stdout, stderr) {
		exitOnError(err, stdout, stderr, "Grunt build failed!");

		console.log(stdout);

		callback();
	});
}

function startNewVersion(path, uid, startCommand, callback) {
	process.chdir(path);

	console.log("Forever stop " + uid);

	exec("forever stop " + uid, function(err, stdout, stderr) {
		console.log("Starting new deployment...");

		console.log(" - forever --uid " + uid + " start ", startCommand);

		exec("forever --uid " + uid + " --append start " + startCommand, function(err, stdout, stderr) {
			exitOnError(err, stdout, stderr, "Starting new instance failed!");

			console.log(stdout);

			console.log("DEPLOYMENT SUCCESSFUL - " + path + "/" + startCommand);

			setTimeout(callback, 3000);
		});	
	});
}

if (typeof exports !== "undefined") {
	module.exports = {
		createDirIfNeeded: createDirIfNeeded,
		cloneRepo: cloneRepo,
		npmInstall: npmInstall,
		gruntBuild: gruntBuild,
		startNewVersion: startNewVersion
	};
}
