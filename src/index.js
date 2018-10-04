import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './components/App';
import LocationList from "./components/LocationList";
import * as serviceWorker from './serviceWorker';
ReactDOM.render( < App / > , document.getElementById('root'));
// Registers service worker
serviceWorker.register();