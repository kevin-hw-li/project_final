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
//= require_tree .

var apikey = "LxUsPWgzw_oJMSdTP3MH"

var parseResult = function (data) {
  // debugger
  $("p").html("");
  var dataArray = data.dataset.data
  dataArray.forEach(function (el) {
    var $price = $("<p>" + el + "</p>")
    $("body").append($price);
  })
};

var searchQuote = function(apiurl){
  $.ajax({
    url: apiurl,
    method: "GET",
    data: {
      column_index: "4",
      start_date: "2017-01-01",
      api_key: apikey
    },
    success: parseResult
  })
};

$(document).ready(function () {

  $("#quote").keyup(function(event){
    if(event.keyCode === 13){
        $("#search").click();
    }
  });

  $("#search").on("click", function () {
    var $quote = $("#quote").val();
    var apiurl = "https://www.quandl.com/api/v3/datasets/WIKI/" + $quote + ".json"
    searchQuote(apiurl)
  });

});

$(document).ajaxStart(function() {
  $(document.body).css({'cursor' : 'wait'});
}).ajaxStop(function() {
  $(document.body).css({'cursor' : 'default'});
});
