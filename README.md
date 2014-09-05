cns
===

Clone 'n' Start - A simple tool for deploying multiple servers. What it does are the followings:

* creates a new folder in your deployments directory, the name of the folder is the actual time
* clones a bunch of repositories
* runs npm install on them
* runs grunt on them
* (re)starts arbitrary number of servers in each repository

##Install
npm install -g cns

or

sudo npm install -g cns

##Usage
cns --config PathToYourConfig.json

If you don't use the --config param, then cns will try to use cnsConfig.json in the actual folder.

##Config.json example


    {
    	"deploymentsBasePath": "/Users/proland/deployments",
    	"repos": {
    		"EDMdesigner-API": {
    			"git": {
    				"repositoryBase": "git@github.com:EDMdesigner",
    				"repositoryName": "EDMdesigner-API",
    				"branch": "master"
    			},
    			"start": {
    				"api": {
    					"dir": "build/api",
    					"command": "api-server.js --TEST_MODE"
    				},
    				"dashboard": {
    					"dir": "src",
    					"command": "dashboard-server.js --TEST_MODE"
    				},
    				"admin": {
    					"dir": "src",
    					"command": "admin-server.js --TEST_MODE"
    				}
    			}
    		},
    		"EDMdesigner-App": {
    			"git": {
    				"repositoryBase": "git@github.com:EDMdesigner",
    				"repositoryName": "EDMdesigner-App",
    				"branch": "master"
    			},
    			"start": {
    				"app": {
    					"dir": "build/app",
    					"command": "server.js --TEST_MODE"
    				},
    				"admin": {
    					"dir": "src",
    					"command": "admin-server.js --TEST_MODE"
    				}
    			}
    		}
    	}
    }


