// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or any plugin's vendor/assets/javascripts directory can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file. JavaScript code in this file should be added after the last require_* statement.
//
// Read Sprockets README (https://github.com/rails/sprockets#sprockets-directives) for details
// about supported directives.
//
//= require jquery
//= require jquery_ujs
//= require d3
//= require techan
//= require underscore
//= require_tree .

// var apikey = "LxUsPWgzw_oJMSdTP3MH"

var generateChart = function (apiurl) {

  $("svg").remove();

  var margin = {top: 20, right: 20, bottom: 30, left: 50},
          width = 960 - margin.left - margin.right,
          height = 500 - margin.top - margin.bottom;

  var parseDate = d3.timeParse("%Y-%m-%d");

  var x = techan.scale.financetime()
          .range([0, width]);

  var y = d3.scaleLinear()
          .range([height, 0]);

  var candlestick = techan.plot.candlestick()
          .xScale(x)
          .yScale(y);

  var xAxis = d3.axisBottom()
          .scale(x);

  var yAxis = d3.axisLeft()
          .scale(y);

  var svg = d3.select("body").append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  d3.csv(apiurl, function(error, data) {

      var accessor = candlestick.accessor();

      data = data.map(function(d) {

          return {
              date: parseDate(d.Date),
              open: +d.Open,
              high: +d.High,
              low: +d.Low,
              close: +d.Close,
              volume: +d.Volume
          };
      }).sort(function(a, b) { return d3.ascending(accessor.d(a), accessor.d(b)); });

      var $quote = $("#quote").val();
      $("#stock").text($quote.toUpperCase())
      currentPrice = data[data.length-1].close
      $("#price").text(currentPrice + " USD")

      svg.append("g")
              .attr("class", "candlestick");

      svg.append("g")
              .attr("class", "x axis")
              .attr("transform", "translate(0," + height + ")");

      svg.append("g")
              .attr("class", "y axis")
              .append("text")
              .attr("transform", "rotate(-90)")
              .attr("y", 6)
              .attr("dy", ".71em")
              .style("text-anchor", "end")
              .text("Price ($)");

      // Data to display initially
      // draw(data.slice(0, data.length-20));

      draw(data);
      // Only want this button to be active if the data has loaded
      // d3.select("button").on("click", function() { draw(data); }).style("display", "inline");
  });

  function draw(data) {
      x.domain(data.map(candlestick.accessor().d));
      y.domain(techan.scale.plot.ohlc(data, candlestick.accessor()).domain());

      svg.selectAll("g.candlestick").datum(data).call(candlestick);
      svg.selectAll("g.x.axis").call(xAxis);
      svg.selectAll("g.y.axis").call(yAxis);
  }

};


$(document).ready(function () {

  $("#quote").keyup(function(event){
    if(event.keyCode === 13){
        $("#search").click();
    }
  });

  $("#search").on("click", function () {
    var $quote = $("#quote").val();
    var startDate = "2017-01-01";
    var apiurl = "https://www.quandl.com/api/v3/datasets/WIKI/" + $quote + ".csv?start_date=" + startDate
    generateChart(apiurl)
  });

});

$(document).ajaxStart(function() {
  $(document.body).css({'cursor' : 'wait'});
}).ajaxStop(function() {
  $(document.body).css({'cursor' : 'default'});
});
