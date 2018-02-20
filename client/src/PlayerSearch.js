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

    handleSearch = () => {
        if (this.state.searchFor && this.state.name.length > 3) {
            this.props.history.push({
                pathname: this.state.searchFor,
                search: `?name=${this.state.name}`,
                state: {
                    name: this.state.name
                }
            });
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