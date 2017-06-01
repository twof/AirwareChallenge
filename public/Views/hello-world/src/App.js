/*jshint esversion: 6 */
import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import './bootstrap-4.0.0-alpha.6-dist/css/bootstrap.css';

class Forecast extends Component {
    constructor(props) {
        super(props);
        this.state = {weatherList: ""};
        this.getWeather = this.getWeather.bind(this);
    }

    // Sorta acts as a delagate ?
    getWeather(city, numDays, units) {
        var xhttp = new XMLHttpRequest();
        let _this = this;

        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                const weatherList = JSON.parse(this.response);
                _this.setState({weatherList: weatherList});
                // const lowsList = weatherList.map(function(item) {return item.min});
                // const highsList = weatherList.map(function(item) {return item.max});
                // const averagesList = weatherList.map(function(item) {return item.average});
                //
                // this.setState({highs: highsList, lows: lowsList, averages: averagesList});

                console.log(_this.state.weatherList);
            }
        };

        const requestURL = `http://localhost:8080/forecast?cities=${city}&numDays=${numDays}&units=${units}`;

        xhttp.open("GET", requestURL, true);
        xhttp.send();
    }

    render() {
        var theWeather = [];

        for(var i=0;i<this.state.weatherList.length;i++) {
            let item = this.state.weatherList[i];

            theWeather.push(<WeatherBox key={i} high={item.max.toFixed(0)} low={item.min.toFixed(0)} average={item.average.toFixed(0)}/>);
        }

        return (
            <div className="container">
                    <ForecastRow theWeather={theWeather}/>
                <div className="row">
                    <WeatherForm getWeather={this.getWeather}/>
                </div>
            </div>
        );
    }
}

class ForecastRow extends Component {
    render() {
        return (
            <div className="row">
                {this.props.theWeather}
                <RemoveForecastButton/>
                <AddForecastButton/>
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
        console.log("clicked");
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
        console.log("clicked");
    }

    render() {
        return (
            <button type="button" className="glyphicon glyphicon-plus" aria-label="Close" onClick={this.handleSubmit}>
                <span aria-hidden="true">&times;</span>
            </button>
        )
    }
}

class WeatherBox extends Component {
    render() {
        return (
            <div className="col-sm-2">
                <h3>High: {this.props.high}</h3>
                <h3>Low: {this.props.low} </h3>
                <h3>Ave: {this.props.average}</h3>
            </div>
        );
    }
}

class WeatherForm extends Component {
    constructor(props) {
        super(props);
        this.vals = {numDays: "6", city: 'San Francisco, US', units: 'metric'};

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);

        this.handleChange();
    }

    handleChange(event) {
        if(event) {
            this.vals[event.target.id] = event.target.value;
        }

        if(this.vals.city != undefined && this.vals.units != undefined && this.vals.numDays != undefined){
            this.props.getWeather(this.vals.city, this.vals.numDays, this.vals.units);
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
                                <option>San Francisco, CA</option>
                                <option>New York, NY</option>
                                <option>Paris, France</option>
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
                </div>
            </div>
        )
    }
}

export default Forecast;
