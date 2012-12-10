// Parallel List class
function ListGraph() {
  Graph.call(this,"list","Data list","Display data list.",["List"]);
};

ListGraph.prototype = new Graph();
ListGraph.prototype.constructor = ListGraph;

ListGraph.prototype.form = function() {
  return "<div><label>List Size</label><input name=\"limit\" type=\"text\" class=\"span3\" value=\"10\"></div>";
};

ListGraph.prototype.show = function(variables,data,params) {

  this.list(variables,data,params);

};


// Register instance
new ListGraph();





