import "react-select/dist/react-select.css";
import "react-virtualized/styles.css";
import "react-virtualized-select/styles.css";
import "./stylesheets/index.css";
import "bootstrap/dist/css/bootstrap.css";
import "react-bootstrap-table/css/react-bootstrap-table.css";
import "react-bootstrap-table/dist/react-bootstrap-table-all.min.css";

import React from "react";
import ReactDOM from "react-dom";
import HomePage from "./modules/HomePage";
import About from "./modules/About";
import Clubs from "./modules/Clubs";
import Matches from "./modules/Matches";
import Players from "./modules/Players";
import Predictions from "./modules/Predictions";
import {BrowserRouter, Redirect, Route, Link, Switch} from "react-router-dom";
import registerServiceWorker from "./registerServiceWorker";
import {Container, Navbar, NavbarBrand, Nav, NavLink, NavItem, Jumbotron} from "reactstrap";

const Header = () => (
    <div>
        <Navbar color="inverse" light expand="md">
            <NavbarBrand href="/">YASD</NavbarBrand>
            <Nav className="ml-auto" navbar>
                <NavItem>
                    <NavLink tag={Link} to="/home">Home</NavLink>
                </NavItem>
                <NavItem>
                    <NavLink tag={Link} to="/about">About</NavLink>
                </NavItem>
                <NavItem>
                    <NavLink tag={Link} to="/clubs">Clubs</NavLink>
                </NavItem>
                <NavItem>
                    <NavLink tag={Link} to="/matches">Matches</NavLink>
                </NavItem>
                <NavItem>
                    <NavLink tag={Link} to="/players">Players</NavLink>
                </NavItem>
                <NavItem>
                    <NavLink tag={Link} to="/predictions">Predictions</NavLink>
                </NavItem>
            </Nav>
        </Navbar>
        <Jumbotron color="info">
            <h3 className="text-center">Welcome to Yet Another Soccer Database!</h3>
        </Jumbotron>
    </div>
);

const Footer = () => (
    <footer>
        <Container fluid>
        </Container>
    </footer>
);

ReactDOM.render((
    <BrowserRouter>
        <div className="main-container">
            <Header/>
            <Switch>
                <Route path="/home" component={HomePage}/>
                <Route path="/about" component={About}/>
                <Route path="/clubs" component={Clubs}/>
                <Route path="/matches" component={Matches}/>
                <Route path="/players" component={Players}/>
                <Route path="/predictions" component={Predictions}/>
                <Redirect from="/" to="/home"/>
            </Switch>
            <Footer/>
        </div>
    </BrowserRouter>
), document.getElementById('root'));

registerServiceWorker();
