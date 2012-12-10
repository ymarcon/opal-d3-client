opal = {version: "1.0.0"}; // semver

/**
 * Query for all value sets of a table and transform them as a d3 data structure.
 */
opal.data = function(datasource,table,select,callback,failedcallback) {
  function toData(valueSets) {
    callback(opal.toData(valueSets));
  }
  opal.valueSets(datasource,table,select,toData,failedcallback);
};

/**
 * Generic Opal query function that returns JSON parsed object.
 */
opal.query = function(url, callback, failedcallback) {
  var req = new XMLHttpRequest;
  var mime = "application/json";
  var credentials = opal.credentials();
  if (req.overrideMimeType) req.overrideMimeType(mime);
  req.open("GET", url, true);
  req.setRequestHeader("Accept", mime);
  req.setRequestHeader("X-Opal-Auth", credentials);

  function ready(text) {
    callback(text ? JSON.parse(text) : null);
  }
  req.onreadystatechange = function() {
    if (req.readyState === 4) {
      var s = req.status;
      if (failedcallback) {
        if (!s && req.response || s >= 200 && s < 300 || s === 304) {
          ready(req.responseText);
        } else {
          failedcallback(s,req.responseText);
        }
      }
      else {
        ready(!s && req.response || s >= 200 && s < 300 || s === 304 ? req.responseText : null);
      }
    }
  };
  req.send(null);
};

/**
 * Encodes the query string argument.
 */
opal.encodeQueryString = function(string) {
  var regexp = /%20/g;
  return encodeURIComponent(string).replace(regexp, "+");
};

/**
 * Build the Opal table REST resource path.
 */
opal.tablePath = function(datasource,table) {
  return "/ws/datasource/" + encodeURIComponent(datasource) + "/table/" + encodeURIComponent(table);
};

/**
 * Query for datasources.
 */
opal.datasources = function(callback,failedcallback) {
  opal.query("/ws/datasources",callback,failedcallback);
}

/**
 * Query for table.
 */
opal.table = function(datasource,table,callback,failedcallback) {
  opal.query(opal.tablePath(datasource,table),callback,failedcallback);
}

/**
 * Query for variables map of a table.
 */
opal.variables = function(datasource,table,select,callback,failedcallback) {
  var url = opal.tablePath(datasource,table) + "/variables";
  if (select) {
    url = url + "?script=" + opal.encodeQueryString(select);
  }
  function toMap(variablesArray) {
    var map = new Object();
    variablesArray.forEach(function(variable){
      map[variable.name] = variable;
    });
    callback(map);
  }
  opal.query(url,toMap,failedcallback);
};

/**
 * Query for all value sets of a table.
 */
opal.valueSets = function(datasource,table,select,callback,failedcallback) {
  var url = opal.tablePath(datasource,table) + "/valueSets?limit=-1";
  if (select) {
    url = url + "&select=" + opal.encodeQueryString(select);
  }
  opal.query(url,callback,failedcallback);
};

/**
 * Transforms value sets array to d3 data array.
 */
opal.toData = function(valueSets) {
  if (valueSets) {
    var data = new Array();
    valueSets["valueSets"].forEach(function(valueSet) {
      var map = new Object();
      map["identifier"] = valueSet["identifier"];
      if (valueSets["variables"] != undefined) {
        for (var i=0;i<valueSets["variables"].length;i++) {
          var datum = valueSet["values"][i]["value"];
          map[valueSets["variables"][i]] = datum ? datum : "";
        }
      }
      data.push(map);
    });
    return data;
  }
  return null;
};

/**
 * Opal login.
 */
opal.login = function(username,password,callback,failedcallback) {
  var url = "/ws/auth/sessions";
  var mime = "application/x-www-form-urlencoded";
  var req = new XMLHttpRequest;
  req.open("POST", url, true);
  req.setRequestHeader("Content-Type", mime);
  req.onreadystatechange = function() {
    if (req.readyState === 4) {
      var s = req.status;
      if (failedcallback) {
        if (s === 201) {
          callback(s);
        } else {
          failedcallback(s);
        }
      }
      else { 
        callback(s);
      }
    }
  };
  req.send("username=" + username + "&password=" + password);
}

/**
 * Opal logout.
 */
opal.logout = function(callback) {
  var credentials = opal.credentials();
  if (credentials) {
    var url = "/ws/auth/session/" + credentials;
    var req = new XMLHttpRequest;
    req.open("DELETE", url, true);
    req.setRequestHeader("X-Opal-Auth", credentials);
    if (callback) {
      req.onreadystatechange = function() {
        if (req.readyState === 4) {
          var s = req.status;
          document.cookie = "";
          callback(s);
        }
      };
    }
    req.send(null);
  }
  else {
    document.cookie = "";
    if (callback) {
      callback(null);
    }
  }
}

opal.session = function(username,password,callback,failedcallback) {
  opal.logout(function(status){
    opal.login(username,password,callback,failedcallback);
  });
};

/**
 * Extract Opal credentials from cookie.
 */
opal.credentials = function(){
  var name = "opalsid=";
  var carray = document.cookie.split(';');
  for(var i=0;i < carray.length;i++) {
    var c = carray[i];
    while (c.charAt(0)==' ') c = c.substring(1,c.length);
      if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
    }
  return null;
}
