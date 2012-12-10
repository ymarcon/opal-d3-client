opal.graphs = new Object();
opal.graphs.registry = new Object();

/**
 * Select the current graph.
 */
opal.graphs.select = function(graphname) {
  //console.log("current graph: " + graphname);
  opal.graphs.clear();
  opal.graphs.current = graphname;
};

/**
 * Show the current graph.
 */
opal.graphs.show = function(params) {
  var graphname = opal.graphs.current;

  if (!params) return;

  var datasource = params["datasource"];
  var table = params["table"];
  var select = params["select"];

  opal.application.progress("Getting data dictionary of " + datasource + "." + table + "...",0,"info", datasource + "-" + table,0);
  opal.variables(datasource,table,select, function(variables) {
    opal.application.progress("Getting data of " + datasource + "." + table + "...",50,"info",datasource + "-" + table,0);
    opal.data(datasource,table,select, function(data) {
        opal.application.progress("Completed: " + datasource + "." + table,100,"info",datasource + "-" + table);
        opal.graphs.registry[graphname].show(variables,data,params);
      }, function(status,response) {
        opal.application.alert("Failed getting " + datasource + "." + table + " data (" + status + ").","error");
      });
  }, function(status,response) {
    opal.application.alert("Failed getting " + datasource + "." + table + " variables (" + status + ").","error");
  });  
};

/**
 * Get the title of the current graph.
 */
opal.graphs.title = function() {
  return opal.graphs.registry[opal.graphs.current].title;
};

/**
 * Get the description of the current graph.
 */
opal.graphs.description = function() {
  return opal.graphs.registry[opal.graphs.current].description;
};

/**
 * Clear the current graph.
 */
opal.graphs.clear = function() {
  if (opal.graphs.current) {
    opal.graphs.registry[opal.graphs.current].clear();
  }
};

/**
 * Get the form of the current graph.
 */
opal.graphs.form = function() {
  return opal.graphs.registry[opal.graphs.current].form();
};


