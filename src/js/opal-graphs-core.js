// Graph class
function Graph(name,title,description,tags) {
  // register this graph
  if (opal && opal.graphs && name) {
    opal.graphs.registry[name] = this;
  }
  this.name = name;
  this.title= title;
  this.description = description;
  this.tags = tags;
}

/**
 * Do the graph in markup.
 */
Graph.prototype.show = function(variables,data,params) {
  // no-op
};

/**
 * Remove the graph from markup
 */
Graph.prototype.clear = function() {
  $("#graph-body").empty();
};

/**
 * Get the markup for the graph specific form.
 */
Graph.prototype.form = function() {
  // empty form
  return null;
};


Graph.prototype.list = function(variables,data,params,offset,limit) {
  $("#graph-body .graph-list").remove();
  $("#graph-body").append("<div class=\"graph-list\"></div>");

  // Pager
  if (offset == undefined) {
    offset = 0;
  }
  if (limit == undefined) {
    limit = params.limit ? +(params.limit) : 20;
  }
  Graph.pager = { 
    "graph": this, 
    "offset": offset, 
    "limit": limit,
    "args" : arguments 
  };
  //console.log(Graph.pager);
  $("#graph-body .graph-list").append("<div class=\"pagination\"></div>");
  var ul = d3.select("#graph-body .graph-list .pagination").append("ul");
  for (var i=0;i<data.length;i=i+limit) {
    var li = ul.append("li");
    var a = li.append("a");
    if (i>=offset && i<offset+limit) {
      li.attr("class","active");
    } else {
      a.attr("onclick","Graph.pager.graph.listPage(" + i + ")");
    }
    if (i==0) {
      a.text("«");
    } else if (i+limit>=data.length) {
      a.text("»");
    } else {
      a.text(i);
    } 
  }
  if (limit>=data.length) {
    var li = ul.append("li");
    li.attr("class","disabled");
    li.append("a").text("»");
  }
  
  // List
  $("#graph-body .graph-list").append("<table class=\"table table-striped table-condensed\"><thead><tr></tr></thead><tbody></tbody></table>");
  
  d3.select("#graph-body .graph-list table thead tr").append("th").text(d3.first(d3.values(variables))["entityType"]);
  d3.keys(variables).forEach(function(name){
    d3.select("#graph-body .graph-list table thead tr").append("th").text(name);
  });

  var index = 0;
  data.forEach(function(datum){
    if (index>=offset && index<offset+limit) {
      var tr = d3.select("#graph-body .graph-list table tbody").append("tr");
      tr.append("td").text(datum["identifier"]);
      d3.keys(variables).forEach(function(name){
        tr.append("td").text(datum[name]);
      });
    }
    index++;
  });
};

Graph.prototype.listPage = function(page) {
  this.list(Graph.pager.args[0],Graph.pager.args[1],Graph.pager.args[2],+page,Graph.pager.limit);
};

Graph.isNumeric = function(variable) {
  return variable && variable.valueType && (variable.valueType == "integer" || variable.valueType == "decimal");
};

Graph.isInteger = function(variable) {
  return variable && variable.valueType && variable.valueType == "integer";
};

Graph.isDecimal = function(variable) {
  return variable && variable.valueType && variable.valueType == "decimal";
};

Graph.isTemporal = function(variable) {
  return variable && variable.valueType && (variable.valueType == "date" || variable.valueType == "datetime");
};

Graph.isDate = function(variable) {
  return variable && variable.valueType && variable.valueType == "date";
};

Graph.isDateTime = function(variable) {
  return variable && variable.valueType && variable.valueType == "datetime";
};

Graph.cast = function(variable, datum) {
  if (Graph.isTemporal(variable)) {
    return new Date(datum);
  } else if (Graph.isNumeric(variable)) {
    return +datum;
  }
  return datum;
};

Graph.castData = function(variables, data) {
  data.forEach(function(d, i) {
    d.index = i;
    Object.keys(variables).forEach(function(v) {
      d[v] = Graph.cast(variables[v],d[v]);
    });
    console.log(d);
  });
  return data;
}
