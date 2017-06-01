/*jshint esversion: 6 */
import React from 'react';
import ReactDOM from 'react-dom';
import WeatherBox from './App';
import Forecast from './App';
import registerServiceWorker from './registerServiceWorker';
import './index.css';


ReactDOM.render(<Forecast />,
                document.getElementById('root'));
registerServiceWorker();
