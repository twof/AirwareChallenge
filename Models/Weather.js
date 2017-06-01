/*jshint esversion: 6 */
class Weather {
    constructor(min, max, average, description, date) {
        this.min = min;
        this.max = max;
        this.average = average;
        this.description = description;
        this.date = date;
    }
}

module.exports = Weather;
