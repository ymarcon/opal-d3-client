// Parallel Graph class
function ParallelGraph() {
  Graph.call(this,"parallel","Parallel Coordinates","Filter entities by crossing variable value ranges.",["Filter","Numeric"]);
};

ParallelGraph.prototype = new Graph();
ParallelGraph.prototype.constructor = ParallelGraph;

ParallelGraph.prototype.form = function() {
  return "<div><label>Graph Width</label><input name=\"width\" type=\"text\" class=\"span3\" value=\"960\">"
    + "<label>Graph Height</label><input name=\"height\" type=\"text\" class=\"span3\" value=\"500\"></div>"
    + "<label>List Size</label><input name=\"limit\" type=\"text\" class=\"span3\" value=\"10\"></div>";
};

ParallelGraph.prototype.show = function(variables,data,params) {

  this.init(params);

  var graph = this;

  // Extract the list of dimensions and create a scale for each.
  this.x.domain(dimensions = d3.keys(data[0]).filter(function(d) {
    var variable = variables[d];
    return Graph.isNumeric(variable) && (graph.y[d] = d3.scale.linear()
        .domain(d3.extent(data, function(p) { return +p[d]; }))
        .range([graph.height, 0]));
  }));

  // Add grey background lines for context.
  this.background = this.svg.append("g")
      .attr("class", "background")
    .selectAll("path")
      .data(data)
    .enter().append("path")
      .attr("d", path);

  // Add blue foreground lines for focus.
  this.foreground = this.svg.append("g")
      .attr("class", "foreground")
    .selectAll("path")
      .data(data)
    .enter().append("path")
      .attr("d", path);

  // Add a group element for each dimension.
  var g = this.svg.selectAll(".dimension")
      .data(dimensions)
    .enter().append("g")
      .attr("class", "dimension")
      .attr("transform", function(d) { return "translate(" + graph.x(d) + ")"; });

  // Add an axis and title.
  g.append("g")
      .attr("class", "axis")
      .each(function(d) { d3.select(this).call(graph.axis.scale(graph.y[d])); })
    .append("text")
      .attr("text-anchor", "middle")
      .attr("y", -9)
      .text(String);

  // Add and store a brush for each axis.
  g.append("g")
      .attr("class", "brush")
      .each(function(d) { d3.select(this).call(graph.y[d].brush = d3.svg.brush().y(graph.y[d]).on("brush", brush).on("brushend",brushend)); })
    .selectAll("rect")
      .attr("x", -8)
      .attr("width", 16);

  // Initial list
  this.list(variables,data,params);

  // Returns the path for a given data point.
  function path(d) {
    return graph.line(dimensions.map(function(p) { return [graph.x(p), graph.y[p](d[p])]; }));
  }

  // Handles a brush event, toggling the display of foreground lines.
  function brush() {
    var actives = dimensions.filter(function(p) { return !graph.y[p].brush.empty(); });
    var extents = actives.map(function(p) { return graph.y[p].brush.extent(); }); 
    graph.foreground.style("display", function(d) {
      return actives.every(function(p, i) {
        return extents[i][0] <= d[p] && d[p] <= extents[i][1];
      }) ? null : "none";
    });
  }

  function brushend() {
    var actives = dimensions.filter(function(p) { return !graph.y[p].brush.empty(); });
    var extents = actives.map(function(p) { return graph.y[p].brush.extent(); }); 
    var filtered = data.filter(function(d){
      var selected = true;
      actives.forEach(function(p, i) {
        if (extents[i][0] > d[p] || d[p] > extents[i][1]) {
          selected = false;
        }
      });
      return selected;
    });
    graph.list(variables,filtered,params);
  } 
};

// Initialize the layout
ParallelGraph.prototype.init =  function(params) {
  if (!params) {
    params = new Object();
  }
  if (!params.width) {
    params.width = 960;
  }
  if (!params.height) {
    params.height = 500;
  }
  //console.log(params);

  var margin = {top: 30, right: 10, bottom: 10, left: 10};
  this.width = params.width - margin.right - margin.left;
  this.height = params.height - margin.top - margin.bottom;

  this.x = d3.scale.ordinal().rangePoints([0, this.width], 1);
  this.y = {};

  this.line = d3.svg.line();
  this.axis = d3.svg.axis().orient("left");

  // Clear svg
  this.clear();

  // Add svg tag
  this.svg = d3.select("#graph-body").append("svg")
      .attr("width", this.width + margin.right + margin.left)
      .attr("height", this.height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  $.get("css/opal-parallel.css", function(css) {
    $('<style type="text/css"></style>')
      .html(css)
      .appendTo("#graph-body");
  });
};

// Register instance
new ParallelGraph();





