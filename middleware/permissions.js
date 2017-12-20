const hjson = require('hjsonfile');
const matcher = require('matcher');

module.exports = {
    name: "permissions",
    run: async function (appExpress) {
        var mm = require('micromatch');
        let nroutes = appExpress._router.stack.length;
        var pconfig = hjson.readFileSync(app.config.locations.permissions);
        var removePath = appExpress.mountpath;
        for (var i = 0; i < nroutes; i++) {
            let route =  appExpress._router.stack[i].route;
            if (!route) continue;
            let routePath = route.path.replace(removePath,"")
            let finalPerms = {};
            for (var ig = 0; ig < pconfig.length; ig++) {
                //groups
                let group = pconfig[ig];
                let groupNames = group.group.split(",");

                for (var ip = 0; ip < group.permissions.length; ip++) {
                    let perm = group.permissions[ip];
                    //permissions
                    let resources = []
                    if (Array.isArray(perm.resource)) {
                        resources = perm.resource
                    } else {
                        resources.push(perm.resource)
                    }
                    for (var ir = 0; ir < resources.length; ir++) {
                        let resource = resources[ir]
                        
                        if (matcher.isMatch(routePath, resource) ){
                            //route inside pattern
                            if (perm.methods[0] && perm.methods[0] == "*") {
                                groupNames.map(name => finalPerms[name] = perm.action);
                            } else {
                                for (var im = 0; im < perm.methods.length; im++) { 
                                    let method = perm.methods[im].toLowerCase();
                                    if (route.methods[method]) {
                                        groupNames.map(name => finalPerms[name] = perm.action);
                                    }
                                }
                            }
    
                        }
                    }
                }
                //default deny
                if (!finalPerms[groupNames[0]]){
                    groupNames.map(name => finalPerms[name] = "deny");
                } 
            }
            route.permissions = finalPerms;
        }
        app.lib.permission = {};
        app.lib.permission.check = function (req, group) {
            let curPerm = req.route.permissions[group];
            if (!curPerm) return "deny";
            return curPerm;
        }

        app.lib.permission.checkPath = function (path, method, group) {
            var result = "deny";
            for (var ig = 0; ig < pconfig.length; ig++) {
                let igroup = pconfig[ig];
                let groupNames = igroup.group.split(",");
                if (groupNames.indexOf(group) < 0 ) continue; //check if has the group
                for (var ip = 0; ip < group.permissions.length; ip++) {
                    let perm = group.permissions[ip];
                    if (!mm.isMatch(routePath, perm.resource) ) continue; // check if route match
                    for (var im = 0; im < perm.methods.length; im++) { 
                        let method = perm.methods[im].toLowerCase();
                        if (route.methods[method]) { //check if method match
                            result = perm.action;
                        }
                    }
                }
            }
            return result;
        }

    }
}

