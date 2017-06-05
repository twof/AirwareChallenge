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

    // var str = `{"city":{"id":524901,"name":"Moscow","coord":{"lon":37.6156,"lat":55.7522},"country":"RU","population":0},"cod":"200","message":0.1594464,"cnt":14,"list":[{"dt":1497258000,"temp":{"day":19.5,"min":8.89,"max":19.5,"night":8.89,"eve":15.11,"morn":14.83},"pressure":1003.3,"humidity":0,"weather":[{"id":500,"main":"Rain","description":"light rain","icon":"10d"}],"speed":5.75,"deg":359,"clouds":0,"rain":2.8},{"dt":1497344400,"temp":{"day":10.26,"min":6.33,"max":10.26,"night":6.33,"eve":9.94,"morn":9.75},"pressure":999.65,"humidity":0,"weather":[{"id":501,"main":"Rain","description":"moderate rain","icon":"10d"}],"speed":7.88,"deg":12,"clouds":60,"rain":5.86},{"dt":1497430800,"temp":{"day":18.08,"min":12.71,"max":18.08,"night":12.71,"eve":14.82,"morn":13.52},"pressure":1004.7,"humidity":0,"weather":[{"id":500,"main":"Rain","description":"light rain","icon":"10d"}],"speed":8.52,"deg":68,"clouds":36,"rain":2.2},{"dt":1497517200,"temp":{"day":15.55,"min":10.88,"max":16.33,"night":11.49,"eve":16.33,"morn":10.88},"pressure":997.64,"humidity":0,"weather":[{"id":501,"main":"Rain","description":"moderate rain","icon":"10d"}],"speed":8.32,"deg":79,"clouds":98,"rain":9.41},{"dt":1497603600,"temp":{"day":18.51,"min":14.09,"max":18.51,"night":14.09,"eve":16.76,"morn":16.65},"pressure":1000.7,"humidity":0,"weather":[{"id":500,"main":"Rain","description":"light rain","icon":"10d"}],"speed":7.07,"deg":165,"clouds":40,"rain":0.54},{"dt":1497690000,"temp":{"day":21.22,"min":17.89,"max":21.22,"night":17.89,"eve":20.49,"morn":18.32},"pressure":1003.76,"humidity":0,"weather":[{"id":501,"main":"Rain","description":"moderate rain","icon":"10d"}],"speed":7.11,"deg":145,"clouds":41,"rain":6.59},{"dt":1497776400,"temp":{"day":24.74,"min":18.61,"max":24.74,"night":18.61,"eve":20.75,"morn":21.04},"pressure":1002.64,"humidity":0,"weather":[{"id":501,"main":"Rain","description":"moderate rain","icon":"10d"}],"speed":7.39,"deg":149,"clouds":75,"rain":3.23}]}`;
    //
    // var weatherList = [];
    //
    // JSON.parse(str).list.forEach(function(day) {
    //     var newWeather = new Weather(day.temp.min,
    //                                  day.temp.max,
    //                                  (day.temp.min + day.temp.max)/2,
    //                                  day.weather[0].description,
    //                                  day.dt);
    //     weatherList.push(newWeather);
    // });
    //
    // res.status(200).send(weatherList);


    // The return should contain the following
    // Temp min, max, average, description, and date for each day
});

app.listen(8080, function () {
    console.log('Example app listening on port 3000!');
});
