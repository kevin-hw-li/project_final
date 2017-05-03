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
//= require browser
//= require underscore
//= require_tree .


$(document).ready(function () {

  var formatTime = d3.timeFormat("%Y-%m-%d");
  var parseDate = d3.timeParse("%Y-%m-%d");
  var apikey = "LxUsPWgzw_oJMSdTP3MH"

  var genNum = function (num) {
    if (num >= 0) {
      return "+" + num;
    } else {
      return num;
    }
  };

  $("#quote").keyup(function(event){
    if(event.keyCode === 13){
        $("#search").click();
    }
  });

  $("#stock, #sellIndicatorValue").keyup(function(event){
    if(event.keyCode === 13){
        $("#test").click();
    }
  });

  $("#search").on("click", function (e) {
    var $quote = $("#quote").val();
    var $timeframe = $("#timeframe").val();
    var startDate = formatTime(generateStartDate($timeframe));
    var interval = $("#interval").val().toLowerCase();
    var apiurl = "https://www.quandl.com/api/v3/datasets/WIKI/" + $quote + ".csv?start_date=" + startDate + "&collapse=" + interval + "&api_key=" + apikey
    generateChart(apiurl);
  });

  $("#test").on("click", function (e) {
    var $stock = $("#stock").val();
    var $testTimeframe = $("#testTimeframe").val();
    var startDate = formatTime(generateStartDate($testTimeframe));
    var apiurl = "https://www.quandl.com/api/v3/datasets/WIKI/" + $stock + ".csv?start_date=" + startDate + "&api_key=" + apikey
    generateTestResult(apiurl);
  });

  var generateStartDate = function (el) {
    var today = new Date();
    if (el === "1-month") {
      return today.setMonth(today.getMonth()-1);
    } else if (el === "3-months") {
      return today.setMonth(today.getMonth()-3);
    } else if (el === "6-months") {
      return today.setMonth(today.getMonth()-6);
    } else if (el === "1-year") {
      return today.setFullYear(today.getFullYear()-1);
    } else if (el === "2-years") {
      return today.setFullYear(today.getFullYear()-2);
    } else if (el === "5-years") {
      return today.setFullYear(today.getFullYear()-5);
    }
  };

  var generateChart = function (apiurl) {

    $("svg").remove();

    var margin = {top: 20, right: 50, bottom: 30, left: 50},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var x = techan.scale.financetime()
      .range([0, width]);

    var y = d3.scaleLinear()
      .range([height, 0]);

    var yVolume = d3.scaleLinear()
      .range([y(0), y(0.3)]);

    var candlestick = techan.plot.candlestick()
      .xScale(x)
      .yScale(y);

    var volume = techan.plot.volume()
      .accessor(candlestick.accessor())   // Set the accessor to a candlestick accessor so we get highlighted bars
      .xScale(x)
      .yScale(yVolume);

    var xAxis = d3.axisBottom(x);

    var xTopAxis = d3.axisTop(x);

    var yAxis = d3.axisLeft(y);

    var yRightAxis = d3.axisRight(y);

    var volumeAxis = d3.axisRight(yVolume)
      .ticks(3)
      .tickFormat(d3.format(",.3s"));

    var volumeAnnotation = techan.plot.axisannotation()
      .axis(volumeAxis)
      .orient("right")
      .width(35);

    var ohlcAnnotation = techan.plot.axisannotation()
      .axis(yAxis)
      .orient('left')
      .format(d3.format(',.2f'));

    var ohlcRightAnnotation = techan.plot.axisannotation()
      .axis(yRightAxis)
      .orient('right')
      .translate([width, 0]);

    var timeAnnotation = techan.plot.axisannotation()
      .axis(xAxis)
      .orient('bottom')
      .format(d3.timeFormat('%Y-%m-%d'))
      .width(65)
      .translate([0, height]);

    var timeTopAnnotation = techan.plot.axisannotation()
      .axis(xTopAxis)
      .orient('top');

    var crosshair = techan.plot.crosshair()
      .xScale(x)
      .yScale(y)
      .xAnnotation([timeAnnotation, timeTopAnnotation])
      .yAnnotation([ohlcAnnotation, ohlcRightAnnotation, volumeAnnotation])
      .on("enter", enter)
      .on("out", out)
      .on("move", move);

    var svg = d3.select("body").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var coordsText = svg.append('text')
      .style("text-anchor", "end")
      .attr("class", "coords")
      .attr("x", width - 5)
      .attr("y", 15);

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

      x.domain(data.map(accessor.d));
      y.domain(techan.scale.plot.ohlc(data, accessor).domain()); // render the time scale
      yVolume.domain(techan.scale.plot.volume(data).domain());

      svg.append("g")
        .datum(data)
        .attr("class", "volume")
        .call(volume);

      svg.append("g")
        .datum(data)
        .attr("class", "candlestick")
        .call(candlestick); // append and render the candlesticks

      svg.append("g")
        .attr("class", "volume axis")
        .call(volumeAxis);

      svg.append("g")
        .attr("class", "x axis")
        .call(xTopAxis);

      svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

      svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

      svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + width + ",0)")
        .call(yRightAxis);

      svg.append('g')
        .attr("class", "crosshair")
        .datum({ x: x.domain()[80], y: 67.5 })
        .call(crosshair)
        .each(function(d) { move(d); }); // Display the current data


      var $quote = $("#quote").val();
      currentPrice = data[data.length-1].close;
      previousPrice = data[data.length-2].close;
      priceChange = (currentPrice - previousPrice).toFixed(2);
      percentChange = Math.abs((100 * priceChange / previousPrice).toFixed(2));

      svg.append('text')
        .attr("x", 5)
        .attr("y", 15)
        .attr("class", "price")
        .text($quote.toUpperCase() + " - " + currentPrice + " USD")

      $('.price').css("fontWeight", "bold")
      $("#quote").val("")

      svg.append('text')
        .attr("x", 5)
        .attr("y", 30)
        .attr("class", "change")
        .text(genNum(priceChange) + " (" + percentChange + "%)");

      if (priceChange >= 0) {
        $('.change').css("fill", "green");
      } else {
        $('.change').css("fill", "red");
      }

    });

    function enter() {
      coordsText.style("display", "inline");
    }

    function out() {
      coordsText.style("display", "none");
    }

    function move(coords) {
      coordsText.text(
          timeAnnotation.format()(coords.x) + ", " + ohlcAnnotation.format()(coords.y)
      )
    }
  };

  var generateTestResult = function (apiurl) {

    var close = techan.plot.close();
    var accessor = close.accessor();

    d3.csv(apiurl, function(error, data) {
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

      var $buyIndicator = $("#buyIndicator").val()
      var $sellIndicator = $("#sellIndicator").val()
      var periodPattern = /10|14|20/
      var indicatorPattern = /RSI|SMA/
      var buyIndicatorSymbol = indicatorPattern.exec($buyIndicator).toString()
      var sellIndicatorSymbol = indicatorPattern.exec($sellIndicator).toString()
      var buyIndicatorPeriod = parseInt(periodPattern.exec($buyIndicator))
      var sellIndicatorPeriod = parseInt(periodPattern.exec($sellIndicator))

      dates = _.pluck(data, "date")
      buyDates = dates.slice(buyIndicatorPeriod, dates.length)
      sellDates = dates.slice(sellIndicatorPeriod, dates.length)

      closes = _.pluck(data, "close")
      buyCloses = closes.slice(buyIndicatorPeriod, closes.length)
      sellCloses = closes.slice(sellIndicatorPeriod, closes.length)

      if (buyIndicatorSymbol === "RSI") {
        buyInd = RSI.calculate({period: buyIndicatorPeriod, values: closes})
      } else if (buyIndicatorSymbol === "SMA") {
        buyDates = dates.slice(buyIndicatorPeriod-1, dates.length)
        buyCloses = closes.slice(buyIndicatorPeriod-1, closes.length)
        buyInd = SMA.calculate({period: buyIndicatorPeriod, values: closes})
      }

      if (sellIndicatorSymbol === "RSI") {
        sellInd = RSI.calculate({period: sellIndicatorPeriod, values: closes})
      } else if (sellIndicatorSymbol === "SMA") {
        sellDates = dates.slice(sellIndicatorPeriod-1, dates.length)
        sellCloses = closes.slice(sellIndicatorPeriod-1, closes.length)
        sellInd = SMA.calculate({period: sellIndicatorPeriod, values: closes})
      }

      buyDateCloseInd = _.zip(buyDates, buyCloses, buyInd)
      sellDateCloseInd = _.zip(sellDates, sellCloses, sellInd)

      // var portfolio = $("#portfolio").val();
      var $stock = $("#stock").val();
      var buyNumOfShares = $("#buyNumOfShares").val();
      var buyIndicatorValue = $("#buyIndicatorValue").val();
      var buyOperator = $("#buyOperator").val();
      var sellNumOfShares = $("#sellNumOfShares").val();
      var sellIndicatorValue = $("#sellIndicatorValue").val();
      var sellOperator = $("#sellOperator").val();
      var operators = {
        '<': function(a, b) { return a < b },
        '>': function(a, b) { return a > b },
      };
      var $testResult = $("#testResult")
      $testResult.html("");
      var totalPurchased = 0
      var totalSold = 0
      var result = 0

      buyData = _.filter(buyDateCloseInd, function(el){
        return operators[buyOperator](el[2], buyIndicatorValue) && buyIndicatorValue != ""
      })
      sellData = _.filter(sellDateCloseInd, function(el){
        return operators[sellOperator](el[2], sellIndicatorValue) && sellIndicatorValue != ""
      })

      if (buyData.length === 0) {
        $testResult.append("<p>No matches for the buying criteria.</p>")
      // } else if (sellData.length === 0) {
      //   $testResult.append("<p>No matches for the selling criteria.</p>")
      } else {
        for (var i = 0; i < buyData.length; i++) {
          buyDate = buyData[i][0]
          buyPrice = buyData[i][1]
          $testResult.append("<p>" + formatTime(buyDate) + ": Buy " + buyNumOfShares + " shares of " + $stock.toUpperCase() + "@" + buyPrice.toFixed(2) + " = " + (buyPrice * buyNumOfShares).toFixed(2) + "</p>")
          totalPurchased += buyPrice * buyNumOfShares
        }
        for (var i = 0; i < sellData.length; i++) {
          sellDate = sellData[i][0]
          sellPrice = sellData[i][1]
          $testResult.append("<p>" + formatTime(sellDate) + ": Sell " + sellNumOfShares + " shares of " + $stock.toUpperCase() + "@" + sellPrice.toFixed(2) + " = " + (sellPrice * sellNumOfShares).toFixed(2) + "</p>")
          totalSold += sellPrice * sellNumOfShares
        }
        result = (totalSold - totalPurchased).toFixed(2)
        $testResult.append("<p>Result: " + genNum(result) + "</p>")
      }
      // debugger
    })
  }

});

$(document).ajaxStart(function() {
  $(document.body).css({'cursor' : 'wait'});
}).ajaxStop(function() {
  $(document.body).css({'cursor' : 'default'});
});
