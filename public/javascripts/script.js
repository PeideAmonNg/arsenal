console.log("gooner")

var games;
var goals;

var arr = window.location.href.split('/');
var club = arr[arr.length - 2];
var season = arr[arr.length - 1];

var xmlhttp = new XMLHttpRequest();
var url = "/api/matches/" + club + "/" + season + "";

xmlhttp.onreadystatechange = function() {
  if (this.readyState == 4 && this.status == 200) {
    var data = JSON.parse(this.responseText);
    console.log("data");
    console.log(data);
    games = data.games;
    goals = data.goals;
    visualize();
  }
};
xmlhttp.open("GET", url, true);
xmlhttp.send();

// var path = "/api/" + window.location.href.replace(/^(?:\/\/|[^\/]+)*\//, "");
// console.log(path);

function visualize(){
  console.log("games");
  console.log(games);
  console.log(goals);
  var svg = d3.select("#allGames"),
      width = +svg.attr("width"),
      height = +svg.attr("height"),
      radius = Math.min(width, height) / 2,
      g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  // var color = d3.scaleOrdinal(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);
  function color(c){ return {lose:"#E8A4A4", draw: "#E87878",win:"#E83737"}[c]; };

  var pie = d3.pie()
      .sort(function(x){ if(x.type == 'draw'){ return 0; }else if(x.type == 'win'){return 1;}else{ return -1;} })
      .value(function(d) { return d.number; });

  var path = d3.arc()
      .outerRadius(radius - 10)
      .innerRadius(0);

  var label = d3.arc()
      .outerRadius(radius - 40)
      .innerRadius(radius - 40);

  var data = games;
    console.log(data)
    var arc = g.selectAll(".arc")
      .data(pie(data))
      .enter().append("g")
        .attr("class", "arc");

    arc.append("path")
        .attr("d", path)
        .attr("fill", function(d) { return color(d.data.type); });

    arc.append("text")
        .attr("transform", function(d) { return "translate(" + label.centroid(d) + ")"; })
        .attr("dy", "0.35em")
        .text(function(d) { return d.data.type + " " + d.data.number; });

  var svg = d3.select("#allGoals"),
      width = +svg.attr("width"),
      height = +svg.attr("height"),
      radius = Math.min(width, height) / 2,
      g2 = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  // var color = d3.scaleOrdinal(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);
  function color2(c){ return {away:"#E8A4A4", draw: "#E87878",home:"#E83737"}[c]; };

  var pie2 = d3.pie()
      .sort(function(x, y){ return x.type > y.type; })
      .value(function(d) { return d.number; });

  var path2 = d3.arc()
      .outerRadius(radius - 10)
      .innerRadius(0);

  var label2 = d3.arc()
      .outerRadius(radius - 40)
      .innerRadius(radius - 40);

  var arr = window.location.href.split('/');
  var club = arr[arr.length - 2];
  var season = arr[arr.length - 1];

  var data = goals;
    console.log(data)
    var arc = g2.selectAll(".arc")
      .data(pie2(data))
      .enter().append("g")
        .attr("class", "arc");

    arc.append("path")
        .attr("d", path2)
        .attr("fill", function(d) { return color2(d.data.type); });


    arc.append("text")
        .attr("transform", function(d) { return "translate(" + label2.centroid(d) + ")"; })
        .attr("dy", "0.35em")
        .text(function(d) { return d.data.type + " " + d.data.number; });

    var totalGoals = 0;
    data.forEach(function(g){
      totalGoals += g.number;
    });

    document.getElementById("allGoalsTitle").innerHTML += " (" + totalGoals + ")";
  
}

