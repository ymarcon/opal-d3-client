opal.application = new Object();

opal.application.init = function() {
  // populate with graphs in the registry

  // home page
  var tags = {};
  for (var key in opal.graphs.registry) {
    var graph = opal.graphs.registry[key];
    var labels = "";
    if (graph.tags) {
      graph.tags.forEach(function(tag){
        labels = labels + "<span class=\"label\">"+tag+"</span>&nbsp;";        
        if (!tags[tag]) {
          tags[tag] = [graph];
        }
        else {
          tags[tag].push(graph);
        }
      });
    }

    $("#home-body dl").append("<dt>"
     +"<a href=\"#" + key + "\" onclick=\"opal.application.select('"+key+"')\">" + graph.title + "</a> "
     + labels
     +"</dt>");
    $("#home-body dl").append("<dd>"
     +"<span class=\"help-block\">" + graph.description + "</span>"
     +"</dd>");
  }

  // nav bar
  for (var key in tags) {
    var html = "<li class=\"dropdown\">"
      +"<a href=\"#\" class=\"dropdown-toggle\" data-toggle=\"dropdown\">"+key+" <b class=\"caret\"></b></a>"
      +"<ul class=\"dropdown-menu\">";
    tags[key].forEach(function(graph){
      html += "<li><a href=\"#"+graph.name+"\" onclick=\"opal.application.select('"+graph.name+"')\">"+graph.title+"</a></li>";
    });
    html += "</ul></li>";

    $("#nav").append(html);
  }

  // init according to credentials
  if (opal.credentials()) {
    opal.application.toggleSignin(false);
    opal.datasources(opal.application.initConfigurationForm);
  } else {
    opal.application.toggleSignin(true);  
  }
};

/**
 * Go to home page.
 */
opal.application.home = function() {
  opal.graphs.select(null);
  $("#home").css("display","block");
  $("#graph").css("display","none");
};

/**
 *
 */
opal.application.select = function(graphname) {
  opal.graphs.clear()
  opal.graphs.select(graphname);
  
  // Update graph div
  $("#graph-header h2").text(opal.graphs.title());
  $("#graph-header p").text(opal.graphs.description());
  opal.graphs.clear()

  var form = opal.graphs.form();
  $("#options-form").empty();
  if (form != null) {
    $("#options-form").append(form);
  } else {
    $("#options-form").append("<p>No options for this graph.</p>");
  }

  $("#home").css("display","none");
  $("#graph").css("display","block");
};

/**
 *
 */
opal.application.signin = function() {
  var username = $("#login-form input[name='username']").val();
  var password = $("#login-form input[name='password']").val();
  $("#login-form input[name='password']").val("");
  opal.session(username,password, function() {
  opal.application.toggleSignin(false);
    opal.datasources(opal.application.initConfigurationForm);
  }, function(status) {
    opal.application.alert("Authentication failed.","error");
  opal.application.toggleSignin(true);
  });
};

/**
 *
 */
opal.application.signout = function() {
  opal.application.home();
  opal.logout();
  opal.application.toggleSignin(true);
};

/**
 *
 */
opal.application.alert = function(content,level,alertid,timeout) {
  var id = "alert-" + (alertid ? alertid.replace(" ","_") : (new Date()).getTime());
  console.log($("#" + id));
  if ($("#" + id).length > 0) {
    $("#" + id).remove();
  }
  var html = "<div id=\"" + id + "\" class=\"alert fade in " + (level ? "alert-" + level : "") +"\">"
   + "<button class=\"close\" data-dismiss=\"alert\">×</button>" + content + "</div>";
  $("#alert-place").append(html);
  $("#" + id).alert();
  
  if (timeout == undefined || timeout > 0) {
    console.log(timeout != undefined ? timeout : 5000);
    setTimeout(function(){
      $("#" + id).remove();
    },timeout != undefined ? timeout : 5000);
  }
};

opal.application.progress = function(content,percent,level,alertid,timeout) {
  var pcontent = content + "<div class=\"progress progress-striped active\"><div class=\"bar\" style=\"width: " + percent + "%;\"></div></div>";
  opal.application.alert(pcontent,level,alertid,timeout);
};

/**
 *
 */
opal.application.toggleSignin = function(visible) {
  $("#signin").css("display", visible ? "block" : "none");
  $("#signout").css("display",visible ? "none" : "block");
};

/**
 *
 */
opal.application.initConfigurationForm = function(ds) {
  opal.application["datasources"] = ds;
  var datasources = new Array();
  var tables = new Array();
  ds.forEach(function(datasource) {
    datasources.push(datasource.name);
    if (datasource.table) {
      datasource.table.forEach(function(table) {
        tables.push(table);
      });
    }
  });
  $("#data-form input[name='datasource']").attr("data-source",JSON.stringify(datasources));
  $("#data-form input[name='table']").attr("data-source",JSON.stringify(tables));
};

/**
 * Validate configuration form and show current graph.
 */
opal.application.submitConfigurationForm = function() {
  if (!opal.credentials()) {
    opal.application.alert("Sign in before querying data.","error");
    return;
  }

  var datasource = $("#data-form input[name='datasource']").val();
  var table = $("#data-form input[name='table']").val();

  // validations
  var error = false;
  if (datasource == "") {
    opal.application.alert("Datasource name is required.","error");
    error = true;
  }
  if (table == "") {
    opal.application.alert("Table name is required.","error");
    error = true;
  } else {
    opal.application["datasources"].forEach(function(ds) {
      if (datasource == ds.name) {
        var found = false;
        ds.table.forEach(function(t) {
          if (table == t) found = true;
        });
        if (!found) {
          opal.application.alert(table + " is not a table of " + datasource + ".","error");
          error = true;
        }
      }
    });
  }
  if (error) return null;

  var select = $("#data-form input[name='select']").val();
  select = select ? "name().matches('"+select+"')" : null;

  var params = { "datasource" : datasource, "table" : table, "select" : select };

  // get graph options
  $("#options-form input").each(function(i,input) {
    params[input.name] = input.value;
  });
  console.log(params);

  opal.graphs.show(params);
};
