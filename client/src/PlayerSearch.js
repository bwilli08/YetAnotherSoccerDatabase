import React from "react";
import {
    Button,
    InputGroup,
    InputGroupButtonDropdown,
    Input,
    DropdownToggle,
    DropdownMenu,
    DropdownItem
} from "reactstrap";
import {withRouter} from "react-router-dom";
import Client from "./Client";

const MATCHING_PLAYER_LIMIT = 25;

class PlayerSearch extends React.Component {
    constructor(props) {
        super(props);

        this.toggle = this.toggle.bind(this);
        this.state = {
            name: "",
            dropdownText: "Search for...",
            searchFor: "",
            dropdownOpen: false,
            players: []
        };
    }

    toggle() {
        this.setState({
            dropdownOpen: !this.state.dropdownOpen
        });
    }

    handleTextChange = (event) => {
        this.setState({
            name: event.target.value,
            isTyping: false
        });
    };

    populatePlayers = name => {
        if (name === "" || name.length < 3) {
            this.setState({
                players: []
            });
        } else {
            Client.player_search(name, players => {
                this.setState({
                    players: players.slice(0, MATCHING_PLAYER_LIMIT)
                });
            });
        }
    };

    handleSearch = () => {
        if (this.state.searchFor) {
            this.props.history.push({
                pathname: this.state.searchFor,
                state: {
                    name: this.state.name
                }
            })
        }
    };

    _handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            this.handleSearch();
        }
    };

    setClub = () => {
        this.setState({
            dropdownText: "Club Search",
            searchFor: "/clubs"
        });
    };

    setPlayer = () => {
        this.setState({
            dropdownText: "Player Search",
            searchFor: "/players"
        });
    };

    render() {
        return (
            <InputGroup>
                <InputGroupButtonDropdown addonType="append" isOpen={this.state.dropdownOpen} toggle={this.toggle}>
                    <DropdownToggle caret>
                        {this.state.dropdownText}
                    </DropdownToggle>
                    <DropdownMenu>
                        <DropdownItem onClick={this.setClub}>Club Search</DropdownItem>
                        <DropdownItem onClick={this.setPlayer}>Player Search</DropdownItem>
                    </DropdownMenu>
                </InputGroupButtonDropdown>
                <Input placeholder="Enter text..." onKeyPress={this._handleKeyPress} onChange={this.handleTextChange}/>
                <Button onClick={this.handleSearch}>Search</Button>
            </InputGroup>
        );
    }
}

export default withRouter(PlayerSearch);