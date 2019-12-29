var margin = {top: 0, right: 0, bottom: 0, left: 0};
	width = 600 - margin.left - margin.right,
	height = 400 - margin.top - margin.bottom;

var projection = d3.geo.albersUsa()
	.scale(770)
	.translate([width / 2, height / 2]);

var path = d3.geo.path()
	.projection(projection);

var map = d3.select("#map").append("svg")
	.attr("width", width)
	.attr("height", height);





/*
MAP
*/

d3.json("us.json", function (error, us) {
	d3.csv("map-data.csv",function(data) {

		map.append("g")
			.selectAll("path")
				.data(topojson.feature(us, us.objects.states).features)
				.enter().append("path")
				.attr("class", "state")
				.attr("d", path);

		map.append("path")
			.datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
			.attr("class", "border")
			.attr("d", path);

		map.append("g")
			.selectAll("g circle")
			.data(data)
			.enter()
			.append("circle")
				.attr("class", function(d) { return "bankfail" + d.yearmonth; })
				.attr("cx", function(d) {return projection([d.longitude, d.latitude])[0];})
				.attr("cy", function(d) {return projection([d.longitude, d.latitude])[1];})
				.attr("r", 3)
				.attr("stroke", "#fff")
				.attr("fill-opacity", 1)
				.attr("stroke-width", 1)
				.style("fill", "#ff0000");

	});
});





/*
TIMER
*/

var twodigits = d3.format("02d");
var parseDate = d3.time.format("%Y-%m").parse;
var formatDate = d3.time.format("%B, %Y");
var duration = 250;
var year = 2007;
var month = 1;
var count = 0;
var dateid = year + twodigits(month);
var yearmonth = String(year) + "-" + String(twodigits(month));
var timerWidth = 200;
var timerHeight = 5;
var timerMargin = 2;
var radius = 7;
var buffer = 12;
var increment = (timerWidth-2*timerMargin)/95;

var slidersvg = d3.select("#slider").append("svg")
	.attr("width", 250)
	.attr("height", 23);

var rect = slidersvg.append("rect")
	.attr("width", timerWidth)
	.attr("height", timerHeight)
	.attr("x", buffer)
	.attr("y", buffer);

var timerCircle = slidersvg.append("circle")
	.attr("class", "timerCircle")
	.attr("cx", buffer+(count*increment)+timerMargin)
	.attr("cy", buffer+timerMargin)
	.attr("r", radius);

d3.select("#play").on("click", function(){

	d3.selectAll("g circle")
		.attr("r", 0);

	year = 2007;
	month = 1;
	count = 0;
	d3.select(".timerCircle")
		.attr("cx", buffer+(count*increment)+timerMargin);
	startTimer();
});

function startTimer() {

	setTimeout(updateMonth, duration);

	function updateMonth() {

		yearmonth = String(year) + "-" + String(twodigits(month));
		dateid = year + twodigits(month);
		d3.select("#yearmonth")
			.text(formatDate(parseDate(yearmonth)));
		updateKnob();
		highlightFailures();
		count = count+1;

		if (year==2014 && month == 12) {

			d3.selectAll("g circle")
				.transition()
				.delay(1000)
				.duration(0)
				.attr("r", 3)
				.style("fill", "#ff0000")
				.style("opacity", 0)
				.transition()
				.delay(1250)
				.duration(750)
				.style("opacity", 1);

			d3.selectAll(".bar")
				.transition()
				.delay(1250)
				.duration(750)
				.style("fill", "#00485d");

			d3.select("#yearmonth")
				.transition()
				.delay(750)
				.duration(500)
				.style("opacity", 0)
				.transition()
				.duration(0)
				.text("2007-2014")
				.transition()
				.duration(750)
				.style("opacity", 1);

			setTimeout(function(){
				d3.select("#play").html("Replay<span class='fa fa-repeat'></span>");
			}, 1000);

		} else if (month < 12) {
			month = month+1;
			setTimeout(updateMonth, duration);
		} else if (month == 12) {
			year = year+1;
			month = 1;
			setTimeout(updateMonth, duration);
		}
	}
};



function updateKnob() {
	timerCircle
		.transition()
		.duration(duration)
		.ease("linear")
		.attr("cx", buffer+(count*increment)+timerMargin);
}





/*
BANK EXPLOSIONS
*/

function highlightFailures() {

	d3.csv("map-data.csv",function(data) {

		d3.selectAll(".bankfail" + dateid)
			.attr("r", 3)
			.style("fill", "#ff0000")
			.style("opacity", 1)
			.transition()
			.duration(750)
			.ease("linear")
			.style("fill", "#feb24c")
			.attr("r", 10)
			.style("opacity", 0.5)
			.transition()
			.duration(750)
			.ease("linear")
			.style("fill", "#ffffcc")
			.attr("r", 17)
			.style("opacity", 0);

		d3.selectAll("#bar" + dateid)
			.style("fill", "#00a1ce");

	});

};





/*
BAR CHART
*/

var chartmargin = {top: 20, right: 0, bottom: 20, left: 20},
	chartwidth = 545,
	chartheight = 200;

var	parseDate = d3.time.format("%Y-%m").parse;

var x = d3.time.scale()
	.range([0, chartwidth]);

var y = d3.scale.linear()
	.range([chartheight, 0]);

var xAxis = d3.svg.axis()
	.scale(x)
	.orient("bottom")
	.ticks(8)
	.tickFormat(d3.time.format("%y"));

var yAxis = d3.svg.axis()
	.scale(y)
	.orient("left")
	.ticks(5)
	.tickSize(-chartwidth);

var chart = d3.select("#chart").append("svg")
	.attr("width", chartwidth + chartmargin.left + chartmargin.right)
	.attr("height", chartheight + chartmargin.top + chartmargin.bottom)
	.append("g")
	.attr("transform", "translate(" + chartmargin.left + "," + chartmargin.top + ")");

d3.csv("chart-data.csv", function(error, chartdata) {

	chartdata.forEach(function(d) {
		d.date = parseDate(d.date);
		d.failures = +d.failures;
    });

	x.domain([parseDate("2007-01"),parseDate("2015-01")]);
	y.domain([0, 25]);

	chart.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + chartheight + ")")
		.call(xAxis);

	d3.selectAll(".x.axis text")
		.attr("dx", 34);

	d3.select(".x.axis text")
		.text("2007");

	chart.append("g")
		.attr("class", "y axis")
		.call(yAxis);

	chart.append("text")
		.attr("class", "right label")
		.text("bank failures per month")
		.attr("x", -17)
		.attr("y", -10);

	chart.selectAll(".bar")
		.data(chartdata)
		.enter().append("rect")
		.attr("id", function(d) { return "bar" + d.yearmonth; })
		.attr("class", "bar")
		.attr("x", function(d) { return x(d.date); })
		.attr("width", 5)
		.attr("y", function(d) { return y(d.failures); })
		.attr("height", function(d) { return chartheight - y(d.failures); });

});

d3.select(self.frameElement).style("height", "800px");