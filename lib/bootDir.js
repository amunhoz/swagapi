//'use strict';
const fs = require("fs");
const path = require('path');
const readdir = require("recursive-readdir-sync");

module.exports = class bootDir {
    constructor (){
        this.scripts = [];
        this.scriptsOrder = [];
    }

    loadDir(xdir, info){
        xdir = path.resolve(xdir + "/");
        var files = readdir(xdir);
            
        for (var i = 0, len = files.length; i < len; i++) {
            var extension = path.extname(files[i]);
            var name = files[i].replace(xdir, "").replace(extension, "").substr(1).replace("\\","/");
            if (extension == ".js") {
                if (info) {
                    if (info[name] && info[name].enabled) {
                        this.loadFile(name, files[i], info[name].priority);
                    }
                } else {
                    this.loadFile(name, files[i]);
                }
            }
        }
        return true;
    }

    loadFile (name, fullFilePath, priority) {
        let data = require(fullFilePath);
        data.name = name;
        if (data.enabled == false && !priority ) return;
        if (!data.run) { throw new Error('boot.run is required'); }
        if (priority && priority > 0) data.priority = priority;
        if (!data.priority) { data.Priority = 1000; }
        data.priority = Number(data.priority);
        this.scripts[data.name] = data;
        this.scriptsOrder.push(data.name);
    };

   async exec(xapp) {
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
                if (_this.scripts[sname].run.constructor.name === 'AsyncFunction')
                    var result = await _this.scripts[sname].run(xapp)
                else 
                    var result = _this.scripts[sname].run(xapp)
    
                if (result instanceof Error) {
                    throw result;
                }
        } 
    }


}




