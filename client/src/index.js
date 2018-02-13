import React from "react";
import ReactDOM from "react-dom";
import "./stylesheets/index.css";
import App from "./modules/App";
import About from "./modules/About";
import Clubs from "./modules/Clubs";
import Players from "./modules/Players";
import {BrowserRouter, Route} from "react-router-dom";
import registerServiceWorker from "./registerServiceWorker";
import "bootstrap/dist/css/bootstrap.css";

ReactDOM.render((
    <BrowserRouter>
        <div>
            <Route path="/" component={App}/>
            <Route path="/about" component={About}/>
            <Route path="/clubs" component={Clubs}/>
            <Route path="/players" component={Players}/>
        </div>
    </BrowserRouter>
), document.getElementById('root'));
registerServiceWorker();
