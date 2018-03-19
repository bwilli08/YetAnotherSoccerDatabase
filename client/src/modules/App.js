import React from "react";
import {Navbar, NavbarBrand, Nav, NavLink, NavItem, Container, Jumbotron} from "reactstrap";
import {Link, withRouter} from "react-router-dom";

class App extends React.Component {

    render() {
        return (
            <div>
                <Navbar color="inverse" light expand="md">
                    <NavbarBrand href="/">YetAnotherSoccerDatabase</NavbarBrand>
                    <Nav className="ml-auto" navbar>
                        <NavItem>
                            <NavLink tag={Link} to="/">Home</NavLink>
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
                    </Nav>
                </Navbar>
                <Jumbotron>
                    <Container>
                                <h2>Welcome to Yet Another Soccer Database!</h2>
                    </Container>
                </Jumbotron>

                { this.props.children }
            </div>
        );
    }
}

export default withRouter(App);