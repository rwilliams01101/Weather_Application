// $ uses jQuery to reference the document and makes sure that it is fully loaded before running anything
$(document).ready(function() {
  // using jQuery, reference the "search button" id and listen for a click event on that id
  $("#search-button").on("click", function() {
    // take the value of "search-value" id and save it in variable "searchValue"
    var searchValue = $("#search-value").val();

    // take the value of "search-value" id and clear the value
    $("#search-value").val("");
    // fire function "searchWeather" with searchValue as an argument
    searchWeather(searchValue);
  });

  // using jQuery, reference the "history" class and listen for a click event on any list item in the history class. The benefit here is that since it listens for the "history" class,
  // any item added to that ex: list, will still be recognized
  $(".history").on("click", "li", function() {
    // fires searchWeather function, referencing "this". This refers to the the jQuery object, in this case, the li element
    searchWeather($(this).text());
  });
  // establishes "makeRow" function, passes through the text from above
  function makeRow(text) {
    // sets variable "li" using jQuery creates a new li tag $(''), adds the classes "list-group-item and list-group-item-action". Then adds the passthrough text from above 
    // into the unordered list "history" as an li element
    var li = $("<li>").addClass("list-group-item list-group-item-action").text(text);
    $(".history").append(li);
  }

    // NEW FEATURE - Clear button removes searches from "history" array. Also removes contents of ul element.
    $("#clrBtn").on("click", function() {
    // history.shift();
    history.length = 0;
    $('ul').empty() 
    });

    // establishes "searchWather" function using "searchValue" as an argument
  function searchWeather(searchValue) {
    // fires off the AJAX (Asynchronus JavaScript and XML) call to the API, using "GET" to grab data in JSON format
    $.ajax({
      type: "GET",
      // url to API + searchValue + the app keys
      url: "https://api.openweathermap.org/data/2.5/weather?q=" + searchValue + "&appid=600327cb1a9160fea2ab005509d1dc6d&units=imperial",
      // selects dataType of JSON JavaScript Object Notation
      dataType: "json",
      // if successful call, fire callback function with "data" as an argument
      success: function(data) {
        // callback function using data pulled from successful AJAX call
        // if AJAX call is successful take the content of searchValue 
        if (history.indexOf(searchValue) === -1) {
          // and push it into the "history" array
          history.push(searchValue);
          // take the content of history and stringify (make separate items a string), set to local storage using setItem
          window.localStorage.setItem("history", JSON.stringify(history));
          // create a new row containing the value of searchValue
          makeRow(searchValue);
        }
  
        // clear any old content from the "today" id
        $("#today").empty();

        // create html content for current weather
        // dynamically create h3 header and add class "card-title" for info card (shows selected city and info). Prints city name, current date
        var title = $("<h3>").addClass("card-title").text(data.name + " (" + new Date().toLocaleDateString() + ")");
        // dynamically create div for the card and add class "card"
        var card = $("<div>").addClass("card");
        // dynamically create p element, adding class "card-text" inside p element print wind speed in miles per hour
        var wind = $("<p>").addClass("card-text").text("Wind Speed: " + data.wind.speed + " MPH");
        // dynamically create p element, adding class "card-text" inside p element print humidity percentage
        var humid = $("<p>").addClass("card-text").text("Humidity: " + data.main.humidity + "%");
        // dynamically create p element, adding class "card-text" inside p element print temperature in fahrenheit
        var temp = $("<p>").addClass("card-text").text("Temperature: " + data.main.temp + " °F");
        // dynamically create div element, adding class "card-body"
        var cardBody = $("<div>").addClass("card-body");
        // dynamically create img element, set attribute to corresponding icon, pulled from open weather API
        var img = $("<img>").attr("src", "https://openweathermap.org/img/w/" + data.weather[0].icon + ".png");

        // merge and add to page
        // append icon (from line above) to the h3 title
        title.append(img);
        // append title temp humidity and wind speed to cardBody
        cardBody.append(title, temp, humid, wind);
        // append cardBody to card
        card.append(cardBody);
        // using jQuery, append the card to the "today" id
        $("#today").append(card);

        // call follow-up api endpoints
        getForecast(searchValue);
        getUVIndex(data.coord.lat, data.coord.lon);
      }
    });
  }
  // creates function "getForecast" with "searchValue" as an argument
  function getForecast(searchValue) {
    // fires off the AJAX (Asynchronus JavaScript and XML) call to the API, using "GET" to grab data in JSON format
    $.ajax({
      type: "GET",
      // url to API + searchValue + the app keys
      url: "https://api.openweathermap.org/data/2.5/forecast?q=" + searchValue + "&appid=600327cb1a9160fea2ab005509d1dc6d&units=imperial",
      // selects dataType of JSON JavaScript Object Notation
      dataType: "json",
      // if successful call, fire callback function with "data" as an argument
      success: function(data) {
        // overwrite any existing content with title and empty row
        $("#forecast").html("<h4 class=\"mt-3\">5-Day Forecast:</h4>").append("<div class=\"row\">");
        // loop over all forecasts (by 3-hour increments)
        for (var i = 0; i < data.list.length; i++) {
          // only look at forecasts around 3:00pm
          if (data.list[i].dt_txt.indexOf("15:00:00") !== -1) {
            // create html elements for a bootstrap card
            // create div, add class of "col-md-2"
            var col = $("<div>").addClass("col-md-2");
            // create div, add class "card, bg-primary, and text-white"
            var card = $("<div>").addClass("card bg-primary text-white");
            // create div, add class "card-body and p-2"
            var body = $("<div>").addClass("card-body p-2");
            // create h5 element, add class "card-title" and create text listing the date on the 5 day forecast
            var title = $("<h5>").addClass("card-title").text(new Date(data.list[i].dt_txt).toLocaleDateString());
            // create img element, using the corresponding weather icon
            var img = $("<img>").attr("src", "https://openweathermap.org/img/w/" + data.list[i].weather[0].icon + ".png");
            // create a p element, adding class "card-text", then print the temperature in fahrenheit
            var p1 = $("<p>").addClass("card-text").text("Temp: " + data.list[i].main.temp_max + " °F");
            // create a p element, adding class "card-text", then print the humidity percentage 
            var p2 = $("<p>").addClass("card-text").text("Humidity: " + data.list[i].main.humidity + "%");
            // merge together and put on page
            col.append(card.append(body.append(title, img, p1, p2)));
            // using jQuery, search for forecast id and row class, append the information from line 118
            $("#forecast .row").append(col);
          }
        }
      }
    });
  }
  

  // creates function "getUVIndex" with lat(itude) and lon(gitude) as arguments
  function getUVIndex(lat, lon) {
    // fires off the AJAX (Asynchronus JavaScript and XML) call to the API, using "GET" to grab data in JSON format
    $.ajax({
      type: "GET",
      // url to API + latitude and longitude
      url: "https://api.openweathermap.org/data/2.5/uvi?appid=600327cb1a9160fea2ab005509d1dc6d&lat=" + lat + "&lon=" + lon,
      // selects dataType of JSON JavaScript Object Notation
      dataType: "json",
      // if successful call, fire callback function with "data" as an argument
      success: function(data) {
        // create p element, adding text "UV Index: "
        var uv = $("<p>").text("UV Index: ");
        // create span element, adding classes "btn, btn-sm" and write text of data returned
        var btn = $("<span>").addClass("btn btn-sm").text(data.value);
        
        // change color depending on uv value
        // less than 3 is low risk
        if (data.value < 3) {
          btn.addClass("btn-success");
        }
        // 3 to 6 is medium risk
        else if (data.value < 7) {
          btn.addClass("btn-warning");
        }
        // your face will melt off when the sun touches it
        else {
          btn.addClass("btn-danger");
        }
        // using jQuery, search for today id and card-body class, append uv and btn values
        $("#today .card-body").append(uv.append(btn));
      }
    });
  }




  // get current history, if any (pulling from local storage)
  var history = JSON.parse(window.localStorage.getItem("history")) || [];
  //  if the length of the history array is less than 0 fire the searchWeather function
  if (history.length > 0) {
    searchWeather(history[history.length-1]);
  }
  // if the length of the history array is greater than i, iterate around that array firing the "makeRow" function with history index [i]. End when this has ran for each
  // value in the history array
  for (var i = 0; i < history.length; i++) {
    makeRow(history[i]);
  }
});
