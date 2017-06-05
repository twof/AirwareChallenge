/*jshint esversion: 6 */
import React, { Component } from 'react';
import './App.css';
import './bootstrap-4.0.0-alpha.6-dist/css/bootstrap.css';

class WeatherTable extends Component {
    constructor(props) {
        super(props);
        this.state = {weatherDict: {}, forecasts: []};  // Mapping city name to weather data
        this.formState = {numDays: "6", city: 'San Francisco, US', units: 'metric'};

        this.getWeather = this.getWeather.bind(this);
        this.deleteRow = this.deleteRow.bind(this);
        this.addRow = this.addRow.bind(this);
        this.updateFormState = this.updateFormState.bind(this);
        this.refreshAllRows = this.refreshAllRows.bind(this);
    }

    // Sorta acts as a delagate?
    // Existance of the `oldCity` param determines if we
    //      want to replace the row or add a new one
    getWeather(city, numDays, units, oldCity, forecastIndex) {
        var xhttp = new XMLHttpRequest();
        let _this = this;

        console.log("index", forecastIndex);

        xhttp.onreadystatechange = function() {
            if (this.readyState === 4 && this.status === 200) {
                const weatherList = JSON.parse(this.response);
                var newWeatherDict = _this.state.weatherDict;
                newWeatherDict[city] = weatherList;

                if(oldCity) {
                    var newForecasts = _this.state.forecasts;

                    if(forecastIndex !== undefined) {
                        newForecasts[forecastIndex] = city;
                    }else{
                        newForecasts[newForecasts.length-1] = city;
                    }

                    _this.setState({forecasts: newForecasts, weatherDict: newWeatherDict}, () => {
                        console.log(_this.state.forecasts);
                    });
                }else{
                    var newForecasts = _this.state.forecasts;
                    newForecasts.push(city);
                    _this.setState({forecasts: newForecasts, weatherDict: newWeatherDict});
                }
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

        if(newForecastList.indexOf(cityName) === -1) {
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

    refreshAllRows(numDays, units) {
        let keys = Object.keys(this.state.weatherDict);
        let _this = this;

        // Trying to figure out why we're clearing the forecast array
        keys.forEach(function(city, index) {
            _this.getWeather(city, numDays, units, city, index);
        });
    }

    render() {
        var wDict = this.state.weatherDict;
        var wDictCities = Object.keys(wDict);
        var dates = [];
        var _this = this;

        if(wDictCities.length > 0) {
            dates = wDict[wDictCities[0]].map(function(weather, i) {
                var a = new Date(weather.date * 1000);
                var year = a.getFullYear();
                var month = a.getMonth();
                var date = a.getDate();

                return `${month}/${date}/${year}`;
            });
        }

        var forecasts = _this.state.forecasts.map(function(cityName, i) {
            var currentForecast = wDict[cityName];
            console.log(cityName);
            return (<WeatherTableRow key={cityName, i} cityName={cityName} weather={currentForecast} deleteRow={_this.deleteRow}/>);
        });

        return (
            <div className="container-fluid">
                <table className="table table-responsive">
                    <WeatherTableHeaderRow dates={dates}/>
                    <tbody>
                        {forecasts}
                    </tbody>
                </table>
                <div className="row">
                    <WeatherForm getWeather={_this.getWeather} updateFormState={_this.updateFormState} refreshAllRows={_this.refreshAllRows}/>
                    <AddForecastButton addRow={_this.addRow} cityName={this.formState.city} units={this.formState.units} numDays={this.formState.numDays}/>
                </div>
            </div>
        )
    }
}


// Table header will be the date
class WeatherTableHeaderRow extends Component {
    render() {
        let dates = this.props.dates;

        let headers = dates.map(function(date) {
            return <WeatherTableHeader key={date} date={date}/>
        });

        return (
            <thead>
                <tr>
                    <th>City</th>
                    {headers}
                </tr>
            </thead>
        )
    }
}

class WeatherTableHeader extends Component {
    render() {
        return (
            <th className="text-md-center">{this.props.date}</th>
        )
    }
}

class WeatherTableRow extends Component {
    constructor(){
        super();
    }

    render() {
        let _this = this;
        let tableItems = this.props.weather.map(function(daysWeather, i) {
            return <WeatherTableItem key={daysWeather.date, i} high={daysWeather.max.toFixed(0)} low={daysWeather.min.toFixed(0)} ave={daysWeather.average.toFixed(0)} description={daysWeather.description}/>
        })

        return (
            <tr>
                <th scope="row">{this.props.cityName}</th>
                {tableItems}
                <td>
                    <RemoveForecastButton cityName={this.props.cityName} deleteRow={this.props.deleteRow}/>
                </td>
            </tr>
        )
    }
}

class WeatherTableItem extends Component {
    constructor(props) {
        super();

        this.mouseIn = this.mouseIn.bind(this);
        this.mouseOut = this.mouseOut.bind(this);

        this.state = {overlay: false};
    }

    mouseIn() {
        this.setState({overlay: true});
    }

    mouseOut() {
        this.setState({overlay: false});
    }

    render() {
        let display = this.state.overlay ? (<h5>{this.props.description}</h5>) :
        (
            <div>
                <h5>High: {this.props.high}</h5>
                <h5>Low: {this.props.low}</h5>
                <h5>Ave: {this.props.ave}</h5>
            </div>
        );

        return (
            <td onMouseEnter={this.mouseIn} onMouseLeave={this.mouseOut}>
                {display}
            </td>
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
                <span className="glyphicon glyphicon-plus-sign">+</span>
            </button>
        )
    }
}

class WeatherForm extends Component {
    constructor(props) {
        super(props);
        this.oldCity = 'San Francisco, US';
        this.vals = {numDays: "6", city: 'San Francisco, US', units: 'metric'};

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);

        this.handleChange();
    }

    handleChange(event) {
        if(event) {
            this.vals[event.target.id] = event.target.value;
            this.props.updateFormState(this.vals.city, this.vals.numDays, this.vals.units);

            if(this.vals.city !== undefined && this.vals.units !== undefined && this.vals.numDays !== undefined){
                if(event.target.id === "units" || event.target.id === "numDays") {
                    this.props.refreshAllRows(this.vals.numDays, this.vals.units);
                }else{
                    this.props.getWeather(this.vals.city, this.vals.numDays, this.vals.units, this.oldCity);
                }

                this.oldCity = this.vals.city;
            }
        }
    }

    handleSubmit(event) {
        event.preventDefault();
    }

    render() {
        return (
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
                    <input id="numDays" type="number" min="6" max="15" value={this.vals.numDays} onChange={this.handleChange} />
                </div>
                <div className="form-group">
                    <label for="units">Units:</label>
                    <select className="form-control" id="units" value={this.vals.units} onChange={this.handleChange}>
                        <option value="imperial">Fahrenheit</option>
                        <option value="metric">Celsius</option>
                    </select>
                </div>
            </form>
        )
    }
}

export default WeatherTable;
