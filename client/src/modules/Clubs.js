import React, {Component} from "react";
import {
    Collapse,
    Navbar,
    NavbarToggler,
    NavbarBrand,
    Nav,
    NavItem,
    Container,
    Row,
    Col,
    Jumbotron
} from "reactstrap";
import {Link} from "react-router-dom";
import PlayerSearch from "../PlayerSearch";

class Clubs extends Component {
    constructor(props) {
        super(props);

        this.toggle = this.toggle.bind(this);
        this.state = {
            isOpen: false
        };
    }

    toggle() {
        this.setState({
            isOpen: !this.state.isOpen
        });
    }

    render() {
        return (
            <div>
                <Navbar color="inverse" light expand="md">
                    <NavbarBrand href="/">YetAnotherSoccerDatabase</NavbarBrand>
                    <NavbarToggler onClick={this.toggle}/>
                    <Collapse isOpen={this.state.isOpen} navbar>
                        <Nav className="ml-auto" navbar>
                            <NavItem>
                                <Link to="/">Home</Link>
                            </NavItem>
                            <NavItem>
                                <Link to="/about">About</Link>
                            </NavItem>
                            <NavItem>
                                <Link to="/clubs">Clubs</Link>
                            </NavItem>
                            <NavItem>
                                <Link to="/players">Players</Link>
                            </NavItem>
                        </Nav>
                    </Collapse>
                </Navbar>
                <Jumbotron>
                    <Container>
                        <Row>
                            <Col>
                                <h1>Welcome to Yet Another Soccer Database!</h1>
                            </Col>
                        </Row>
                    </Container>
                </Jumbotron>
                <div className="ui text container">
                    <PlayerSearch/>
                </div>
            </div>
        );
    }
}

export default Clubs;