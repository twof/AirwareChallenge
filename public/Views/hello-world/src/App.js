/*jshint esversion: 6 */
import React, { Component } from 'react';
import './App.css';
import './bootstrap-4.0.0-alpha.6-dist/css/bootstrap.css';

class Forecast extends Component {
    constructor(props) {
        super(props);
        this.state = {weatherDict: {}, forecasts: []};  // Mapping city name to weather data
        this.formState = {numDays: "5", city: 'San Francisco, US', units: 'metric'};

        this.getWeather = this.getWeather.bind(this);
        this.deleteRow = this.deleteRow.bind(this);
        this.addRow = this.addRow.bind(this);
        this.updateFormState = this.updateFormState.bind(this);
    }

    // Sorta acts as a delagate?
    // Existance of the `oldCity` param determines if we
    //      want to replace the row or add a new one
    getWeather(city, numDays, units, oldCity) {
        var xhttp = new XMLHttpRequest();
        let _this = this;

        xhttp.onreadystatechange = function() {
            if (this.readyState === 4 && this.status === 200) {
                const weatherList = JSON.parse(this.response);
                var newWeatherDict = _this.state.weatherDict;
                newWeatherDict[city] = weatherList;

                if(oldCity) {
                    var newForecasts = _this.state.forecasts;
                    newForecasts[newForecasts.length-1] = city;
                    _this.setState({forecasts: newForecasts});
                    //_this.deleteRow(oldCity);
                    // delete newWeatherDict[oldCity];
                }else{
                    var newForecasts = _this.state.forecasts;
                    newForecasts.push(city);
                    _this.setState({forecasts: newForecasts});
                }

                _this.setState({weatherDict: newWeatherDict});
            }
        };

        const requestURL = `http://localhost:8080/forecast?cities=${city}&numDays=${numDays}&units=${units}`;

        xhttp.open("GET", requestURL, true);
        xhttp.send();
    }

    // delagate for delete row button
    // removes the city from the forecasts list
    // if there are no more of that city name in the forecasts list
    // remove it from the dictionary as well
    deleteRow(cityName) {
        var newForecastList = this.state.forecasts;
        var newWeatherDict = this.state.weatherDict;

        var index = newForecastList.indexOf(cityName);

        if (index > -1) {
            newForecastList.splice(index, 1);
        }

        if(newForecastList.indexOf(cityName) == -1) {
            delete newWeatherDict[cityName];
        }

        this.setState({weatherDict: newWeatherDict, forecasts: newForecastList});
    }

    // delagate for add row button
    addRow(cityName, numDays, units) {
        this.getWeather(cityName, numDays, units);
    }

    updateFormState(cityName, numDays, units) {
        this.formState = {numDays: numDays, city: cityName, units: units};
    }

    render() {
        var wDict = this.state.weatherDict;
        var wDictCities = Object.keys(wDict);
        var theWeather = [];
        var _this = this;

        var forecasts = _this.state.forecasts.map(function(cityName, i) {
            var currentForecast = wDict[cityName];
            console.log("current", currentForecast);
            console.log("cityName", cityName);
            console.log("wDict", wDict);

            theWeather = currentForecast.map(function(item, j) {
                return <WeatherBox key={i, j} high={item.max.toFixed(0)} low={item.min.toFixed(0)} average={item.average.toFixed(0)}/>
            });

            return (<ForecastRow key={cityName, i} cityName={cityName} theWeather={theWeather} deleteRow={_this.deleteRow}/>);
        });

        return (
            <div className="container">
                {forecasts}
                <AddForecastButton addRow={_this.addRow} cityName={this.formState.city} units={this.formState.units} numDays={this.formState.numDays}/>
                <div className="row">
                    <WeatherForm getWeather={_this.getWeather} updateFormState={_this.updateFormState}/>
                </div>
            </div>
        );
    }
}

class ForecastRow extends Component {
    render() {
        return (
            <div className="row">
                {this.props.cityName}
                {this.props.theWeather}
                <RemoveForecastButton cityName={this.props.cityName} deleteRow={this.props.deleteRow}/>
            </div>
        )
    }
}

class RemoveForecastButton extends Component {
    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(event) {
        event.preventDefault();
        this.props.deleteRow(this.props.cityName);
    }

    render() {
        return (
            <button type="button" className="close" aria-label="Close" onClick={this.handleSubmit}>
                <span aria-hidden="true">&times;</span>
            </button>
        )
    }
}

class AddForecastButton extends Component {
    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(event) {
        event.preventDefault();
        this.props.addRow(this.props.cityName, this.props.numDays, this.props.units);
    }

    render() {
        return (
            <button type="button" className="btn btn-default btn-sm"  onClick={this.handleSubmit}>
                <span className="glyphicon glyphicon-plus-sign"></span>+
            </button>
        )
    }
}

class WeatherBox extends Component {
    render() {
        return (
            <div className="col-sm-2">
                <h4>High: {this.props.high}</h4>
                <h4>Low: {this.props.low} </h4>
                <h4>Ave: {this.props.average}</h4>
            </div>
        );
    }
}

class WeatherForm extends Component {
    constructor(props) {
        super(props);
        this.oldCity = 'San Francisco, US';
        this.vals = {numDays: "5", city: 'San Francisco, US', units: 'metric'};

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);

        this.handleChange();
    }

    handleChange(event) {
        if(event) {
            this.vals[event.target.id] = event.target.value;
            this.props.updateFormState(this.vals.city, this.vals.numDays, this.vals.units);
        }

        if(this.vals.city !== undefined && this.vals.units !== undefined && this.vals.numDays !== undefined){
            this.props.getWeather(this.vals.city, this.vals.numDays, this.vals.units, this.oldCity);
            this.oldCity = this.vals.city;
        }
    }

    handleSubmit(event) {
        event.preventDefault();
    }

    render() {
        return (
            <div className="container">
                <div className="row" id="maincontent">
                    <form className="form-inline" onSubmit={this.handleSubmit}>
                        <div className="form-group">
                            <label for="city">City:</label>
                            <select className="form-control" id="city" value={this.vals.city} onChange={this.handleChange}>
                                <option value="San Francisco, US">San Francisco, CA</option>
                                <option value="New York, US">New York, NY</option>
                                <option value="Paris, FR">Paris, France</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label for="numDays">Number of Days:</label>
                            <input id="numDays" type="number" min="5" max="15" value={this.vals.numDays} onChange={this.handleChange} />
                        </div>
                        <div className="form-group">
                            <label for="units">Units:</label>
                            <select className="form-control" id="units" value={this.vals.units} onChange={this.handleChange}>
                                <option value="imperial">Fahrenheit</option>
                                <option value="metric">Celsius</option>
                            </select>
                        </div>
                    </form>
                </div>
            </div>
        )
    }
}

export default Forecast;
