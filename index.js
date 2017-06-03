/*jshint esversion: 6 */
const express = require('express');
const app = express();
const http = require('http');
const Weather = require('./Models/Weather');

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
    res.sendFile('./public/Views/hello-world/build/index.html', {root: __dirname});
});

app.get('/forecast', function (req, res) {
    var cities = req.query.cities;
    var numDays = req.query.numDays;
    var units = req.query.units;

    // Make sure the proper params exist
    if(cities === undefined || numDays === undefined || units === undefined) {
        res.status(400).send("params required: `cities`, `numDays`, `units`");
    }

    // Construct the openweathermap request
    const options = {
        host: "api.openweathermap.org",
        path: "/data/2.5/forecast/daily?q=" + encodeURI(cities) + "&mode=json&cnt=" + numDays + "&APPID=a9c8898c6ccfa4c52d8fc636f24a0bc8&units=" + units
    };

    http.request(options, function(resp) {
        var str = '';

        // Collect the response as it comes in
        resp.on('data', function (chunk) {
            str += chunk;
        });

        resp.on('end', function () {
            var weatherList = [];

            JSON.parse(str).list.forEach(function(day) {
                var newWeather = new Weather(day.temp.min,
                                             day.temp.max,
                                             (day.temp.min + day.temp.max)/2,
                                             day.weather[0].description,
                                             day.dt);
                weatherList.push(newWeather);
            });

            res.status(200).send(weatherList);
        });
    }).end();

    // The return should contain the following
    // Temp min, max, average, description, and date for each day
});

app.listen(8080, function () {
    console.log('Example app listening on port 3000!');
});
