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
                <div className="row">
                    {theWeather}
                </div>
                <div className="row">
                    <WeatherForm getWeather={this.getWeather}/>
                </div>
            </div>
        );
    }
}

class WeatherBox extends Component {
    render() {
        return (
            <div className="col-sm-2">
                <h2>High: {this.props.high}</h2>
                <h2>Low: {this.props.low} </h2>
                <h2>Ave: {this.props.average}</h2>
            </div>
        );
    }
}

class WeatherForm extends Component {
    constructor(props) {
        super(props);
        this.vals = {numDays: "1", city: 'San Francisco, US', units: 'metric'};

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        if(event.target.id === "days") { this.vals.numDays = event.target.value; }
        if(event.target.id === "unit") { this.vals.units = event.target.value; }
        if(event.target.id === "city") { this.vals.city = event.target.value; }

        if(this.vals.city != undefined && this.vals.units != undefined && this.vals.numDays != undefined){
            console.log("hello");
            this.props.getWeather(this.vals.city, this.vals.numDays, this.vals.units);
        }
    }

    handleSubmit(event) {
        alert('A name was submitted: ' + this.state.value);
        event.preventDefault();
    }

    render() {
        return (
            <div className="container">
                <div className="row" id="maincontent">
                    <form className="form-inline" onSubmit={this.handleSubmit}>
                        <div className="form-group">
                            <label for="city">City:</label>
                            <select className="form-control" id="city" value={this.state.city} onChange={this.handleChange}>
                                <option>San Francisco, CA</option>
                                <option>New York, NY</option>
                                <option>Paris, France</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label for="days">Number of Days:</label>
                            <input id="days" type="number" min="1" max="20" value={this.state.numDays} onChange={this.handleChange} />
                        </div>
                        <div className="form-group">
                            <label for="unit">Units:</label>
                            <select className="form-control" id="unit" value={this.state.unit} onChange={this.handleChange}>
                                <option>Fahrenheit</option>
                                <option>Celsius</option>
                            </select>
                        </div>
                        <input type="submit" value="Submit" />
                    </form>
                </div>
            </div>
        )
    }
}

export default Forecast;
