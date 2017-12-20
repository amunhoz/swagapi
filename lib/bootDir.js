//'use strict';
const fs = require("fs");
const path = require('path');
const readdir = require("recursive-readdir");

function cModule() {
    this.scripts = [];
    this.scriptsOrder = [];
};

cModule.prototype.start = async function (xapp, xdir, info) {
    xdir = path.resolve(xdir + "/");
    var files = await readdir(xdir);
        
    for (var i = 0, len = files.length; i < len; i++) {
        var extension = path.extname(files[i]);
		var name = files[i].replace(xdir, "").replace(extension, "").substr(1).replace("\\","/");
        if (extension == ".js") {
			if (info) {
				if (info[name] && info[name].enabled) {
					await cModule.prototype.loadFile.call(this, name, files[i], info[name].priority);
				}
			} else {
				await cModule.prototype.loadFile.call(this, name, files[i]);
			}
		}
    }

    await cModule.prototype.execScript.call(this, xapp); //using call to pass this context to front
    return true;
};

cModule.prototype.loadDir = async function (xdir, info) {
    xdir = path.resolve(xdir + "/");
    var files = await readdir(xdir);
        
    for (var i = 0, len = files.length; i < len; i++) {
        var extension = path.extname(files[i]);
		var name = files[i].replace(xdir, "").replace(extension, "").substr(1).replace("\\","/");
        if (extension == ".js") {
			if (info) {
				if (info[name] && info[name].enabled) {
					await cModule.prototype.loadFile.call(this, name, files[i], info[name].priority);
				}
			} else {
				await cModule.prototype.loadFile.call(this, name, files[i]);
			}
		}
    }

    return true;
};

cModule.prototype.initialize = async function (xapp) { 
    await cModule.prototype.execScript.call(this, xapp); //using call to pass this context to front
}

cModule.prototype.loadFile = async function ( name, fullFilePath, priority) {
   
    let data = require(fullFilePath);
   	data.name = name;
          if (data.enabled == false && !priority ) return;

	if (!data.run) { throw new Error('boot.initialize is required'); }
	if (priority && priority > 0) data.priority = priority;
	if (!data.priority) { data.Priority = 1000; }
	data.priority = Number(data.priority);
	
	this.scripts[data.name] = data;
	this.scriptsOrder.push(data.name);
};


cModule.prototype.execScript = async function (xapp) {
    var _this = this;
    
    this.scripts.sort(function (a, b) {
        return a.priority - b.priority;
    });

    this.scriptsOrder.sort(function (a, b) {
        if (_this.scripts[a].priority > _this.scripts[b].priority) {
            return 1;
        } else {
            return -1;
        }
        
    });

    for (var i = 0, len = _this.scriptsOrder.length; i < len; i++) {
        let sname = _this.scriptsOrder[i];
            console.log("       " + sname + " loaded.")
            await   _this.scripts[sname].run(xapp)
        } 
    
};
    
module.exports = cModule;

