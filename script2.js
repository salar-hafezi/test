$("iframe").contents().find(".tabDashboard");
console.log($("iframe").contents());
var m = [20, 120, 20, 50],
    w = 680 - m[1] - m[3],
    h = 600 - m[0] - m[2],
    i = 0,
    root;
	
var selected = null;
var colored = null;
var firstClick = true; //to get around double-firing on first Tableau click

var tree = d3.layout.tree()
    .size([h, w]);

var diagonal = d3.svg.diagonal()
    .projection(function(d) { return [d.y, d.x]; });

var dvis = d3.select("#d3viz").append("svg:svg")
    .attr("width", w + m[1] + m[3])
    .attr("height", h + m[0] + m[2])
  .append("svg:g")
    .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

d3.json("https://codepen.io/robertrouse/pen/GpRBOm.js", function(json) {
  root = json;
  root.x0 = h / 2;
  root.y0 = 0;

  function toggleAll(d) {
    if (d.children) {
      d.children.forEach(toggleAll);
      toggle(d);
    }
  }

  // Initialize the display to show a few nodes.
  root.children.forEach(toggleAll);
  selected = root.name[0];
  colored = selected;
  toggle(selected);
  update(root);
  
  //test filter
  tabfilter();
});

//listen for Tableau selections
//viz.addEventListener('marksselection', selectFunc);

function update(source) {
  var duration = d3.event && d3.event.altKey ? 5000 : 500;

  // Compute the new tree layout.
  var nodes = tree.nodes(root).reverse();

  // Normalize for fixed-depth.
  nodes.forEach(function(d) { 
  	if (d.depth==0){ 
		d.y = 20; 
	}
	else if (d.depth==1){
		d.y = 260;
	}
	else {
		d.y = 350;
	}
	});

  // Update the nodes…
  var node = dvis.selectAll("g.node")
      .data(nodes, function(d) { return d.id || (d.id = ++i); });

  // Enter any new nodes at the parent's previous position.
  var nodeEnter = node.enter().append("svg:g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
      .on("click", function(d) {
		  //on first click, hide explainer div
		  document.getElementById("intro").style.display = "none";

		  //expand if clicked node is not root & not selected
		  //todo: set filter on parents where one bureau exists in multiple agencies
		  if(d.depth==1 && d!=selected){ 
			toggle(selected);
			toggle(d); 
			update(d); 
			tabfilter(d); 
		  } else {
		  	tabfilter(d);
			colored=d;
			update(d);
		  }
		});

  nodeEnter.append("svg:circle")
      .attr("r", 1e-6)
      .style("fill", function (d){ 
	  		if (d==colored){
				return "red";
			}else if(d._children){return "lightsteelblue"; 
			}else{return "#fff";}
			});
	  
  nodeEnter.append("svg:text")
      .attr("x", function(d) { return d.children || d._children ? -10 : 10; })
      .attr("dy", ".35em")
      .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
	  .attr("font-size",function(d) { return d.depth==0?"14px":"11px"})
	  .attr("cursor","pointer")
      .text(function(d) { 
	  	if (d.depth==0){
	  		return "Federal"; 
		}
		else{
			return splitName(d);
		}
	  })
      .style("fill-opacity", 1e-6);

  // Transition nodes to their new position.
  var nodeUpdate = node.transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

  nodeUpdate.select("circle")
      .attr("r", 4.5)
      .style("fill", function (d){ 
	  		if (d==colored){
				return "red";
			}else if(d._children){return "lightsteelblue"; 
			}else{return "#fff";}
			});
	  
  nodeUpdate.select("text")
      .style("fill-opacity", 1);

  // Transition exiting nodes to the parent's new position.
  var nodeExit = node.exit().transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
      .remove();

  nodeExit.select("circle")
      .attr("r", 1e-6);

  nodeExit.select("text")
      .style("fill-opacity", 1e-6);

  // Update the links…
  var link = dvis.selectAll("path.link")
      .data(tree.links(nodes), function(d) { return d.target.id; });

  // Enter any new links at the parent's previous position.
  link.enter().insert("svg:path", "g")
      .attr("class", "link")
      .attr("d", function(d) {
        var o = {x: source.x0, y: source.y0};
        return diagonal({source: o, target: o});
      })
    .transition()
      .duration(duration)
      .attr("d", diagonal);

  // Transition links to their new position.
  link.transition()
      .duration(duration)
      .attr("d", diagonal);

  // Transition exiting nodes to the parent's new position.
  link.exit().transition()
      .duration(duration)
      .attr("d", function(d) {
        var o = {x: source.x, y: source.y};
        return diagonal({source: o, target: o});
      })
      .remove();

  // Stash the old positions for transition.
  nodes.forEach(function(d) {
    d.x0 = d.x;
    d.y0 = d.y;
  });
//console.log("updated");
}


// Toggle children.
function toggle(d) {
  //selected = (d.depth!=2) ? d : selected;
  //d.select(this).attr("fill")="red"
  selected = d;
  colored = selected;
  if (d.children) {
    d._children = d.children;
    d.children = null;
  } else {
    d.children = d._children;
    d._children = null;
  }
  //console.log(selected);
}

//filter Tableau viz
function tabfilter(d) {
  var filterString = "";
  if (d.depth==0){
     setParameter('filterInput','Federal');
  }else if(d.depth==1){
    filterString = 'Agency|'+d.name;
     setParameter('filterInput',filterString);
  } else {
     filterString = 'Bureau|'+d.parent.name+'|'+d.name;
     setParameter('filterInput',filterString);
  }
} 

function splitName(d) {
    var str = d.name;
	var res = str;
    if (d.depth==2 && str.length>50) {
		res = str.substring(0,50)+"..."
	}
    return res;
}
function colorSelected (d) {
	  		if (d==selected){
				return "lightsteelblue";
			}else if(d._children){return "#ccc"; 
			}else{return "#fff";}
}
