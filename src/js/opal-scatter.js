// Scatter Graph class
function ScatterGraph() {
  Graph.call(this,"scatter","Scatterplot Matrix","Filter entities by crossing variable value ranges.",["Filter"]);
};

ScatterGraph.prototype = new Graph();
ScatterGraph.prototype.constructor = ScatterGraph;

ScatterGraph.prototype.clear = function() {
  d3.select("#graph-body svg").remove();
  d3.select("#graph-body style").remove();
};

ScatterGraph.prototype.show = function(variables,data,params) {

  this.init(params);

  // Size parameters.
  var size = 140,
      padding = 10,
      n = 4,
      traits = ["sepal length", "sepal width", "petal length", "petal width"];

  // Position scales.
  var x = {}, y = {};
  traits.forEach(function(trait) {
    var value = function(d) { return d[trait]; },
        domain = [d3.min(data, value), d3.max(data, value)],
        range = [padding / 2, size - padding / 2];
    x[trait] = d3.scale.linear().domain(domain).range(range);
    y[trait] = d3.scale.linear().domain(domain).range(range.reverse());
  });

  // Axes.
  var axis = d3.svg.axis()
      .ticks(5)
      .tickSize(size * n);

  // Brush.
  var brush = d3.svg.brush()
      .on("brushstart", brushstart)
      .on("brush", brush)
      .on("brushend", brushend);

  // Root panel.
  var svg = this.svg;/*d3.select("body").append("svg:svg")
      .attr("width", 1280)
      .attr("height", 800)
    .append("svg:g")
      .attr("transform", "translate(359.5,69.5)");*/

  // Legend.
  var legend = svg.selectAll("g.legend")
      .data(["setosa", "versicolor", "virginica"])
    .enter().append("svg:g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(0," + (i * 20 + 594) + ")"; });

  legend.append("svg:circle")
      .attr("class", String)
      .attr("r", 3);

  legend.append("svg:text")
      .attr("x", 12)
      .attr("dy", ".31em")
      .text(function(d) { return "Iris " + d; });

  // X-axis.
  svg.selectAll("g.x.axis")
      .data(traits)
    .enter().append("svg:g")
      .attr("class", "x axis")
      .attr("transform", function(d, i) { return "translate(" + i * size + ",0)"; })
      .each(function(d) { d3.select(this).call(axis.scale(x[d]).orient("bottom")); });

  // Y-axis.
  svg.selectAll("g.y.axis")
      .data(traits)
    .enter().append("svg:g")
      .attr("class", "y axis")
      .attr("transform", function(d, i) { return "translate(0," + i * size + ")"; })
      .each(function(d) { d3.select(this).call(axis.scale(y[d]).orient("right")); });

  // Cell and plot.
  var cell = svg.selectAll("g.cell")
      .data(cross(traits, traits))
    .enter().append("svg:g")
      .attr("class", "cell")
      .attr("transform", function(d) { return "translate(" + d.i * size + "," + d.j * size + ")"; })
      .each(plot);

  // Titles for the diagonal.
  cell.filter(function(d) { return d.i == d.j; }).append("svg:text")
      .attr("x", padding)
      .attr("y", padding)
      .attr("dy", ".71em")
      .text(function(d) { return d.x; });

  function plot(p) {
    var cell = d3.select(this);

    // Plot frame.
    cell.append("svg:rect")
        .attr("class", "frame")
        .attr("x", padding / 2)
        .attr("y", padding / 2)
        .attr("width", size - padding)
        .attr("height", size - padding);

    // Plot dots.
    cell.selectAll("circle")
        .data(data)
      .enter().append("svg:circle")
        .attr("class", function(d) { return d.species; })
        .attr("cx", function(d) { return x[p.x](d[p.x]); })
        .attr("cy", function(d) { return y[p.y](d[p.y]); })
        .attr("r", 3);

    // Plot brush.
    cell.call(brush.x(x[p.x]).y(y[p.y]));
  }

  // Clear the previously-active brush, if any.
  function brushstart(p) {
    if (brush.data !== p) {
      cell.call(brush.clear());
      brush.x(x[p.x]).y(y[p.y]).data = p;
    }
  }

  // Highlight the selected circles.
  function brush(p) {
    var e = brush.extent();
    svg.selectAll(".cell circle").attr("class", function(d) {
      return e[0][0] <= d[p.x] && d[p.x] <= e[1][0]
          && e[0][1] <= d[p.y] && d[p.y] <= e[1][1]
          ? d.species : null;
    });
  }

  // If the brush is empty, select all circles.
  function brushend() {
    if (brush.empty()) svg.selectAll(".cell circle").attr("class", function(d) {
      return d.species;
    });
  }

  function cross(a, b) {
    var c = [], n = a.length, m = b.length, i, j;
    for (i = -1; ++i < n;) for (j = -1; ++j < m;) c.push({x: a[i], i: i, y: b[j], j: j});
    return c;
  }
};

// Initialize the layout
ScatterGraph.prototype.init = function(params) {
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

  $.get("css/opal-scatter.css", function(css) {
    $('<style type="text/css"></style>')
      .html(css)
      .appendTo("#graph-body");
  });
};

// Register instance
new ScatterGraph();

