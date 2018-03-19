import React, {Component} from "react";
import {
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    InputGroupButtonDropdown,
    Button,
    InputGroup,
    Input,
    Table,
    Container,
    Row,
    Col
} from "reactstrap";
import Client from "../Client";
import ToggleDisplay from "react-toggle-display";

const DEFAULT_POSITION = "Any Position";
const MATCHING_PLAYER_LIMIT = 25;

class Players extends Component {

    constructor(params) {
        super(params);

        this.toggleDropDown = this.toggleDropDown.bind(this);

        this.state = {
            dropdownOpen: false,

            activeSearchText: "",
            activeSearchPosition: "",
            displaySearchMessage: false,
            searchText: "",
            displayPlayers: false,
            players: [],
            clubs: [],
            isPlayerSearching: false,
            position: DEFAULT_POSITION,

            displayStats: false,
            stats: [],
            isStatsSearching: false
        };
    }

    handleTextChange = (event) => {
        this.setState({
            searchText: event.target.value
        });
    };

    handleSearch = () => {
        const player_name = this.state.searchText;
        const position = this.state.position;

        if (!this.state.displayStats && player_name === this.state.activeSearchText && position === this.state.activeSearchPosition) {
            return;
        }

        if (player_name.length > 3) {
            this.setState({
                displaySearchMessage: false,
                displayPlayers: true,
                clubs: [],
                isPlayerSearching: true,
                displayStats: false
            });

            Client.player_search(player_name, position === DEFAULT_POSITION ? "" : position, players => {
                this.setState({
                    activeSearchText: player_name,
                    activeSearchPosition: position,
                    players: players.slice(0, MATCHING_PLAYER_LIMIT),
                    isPlayerSearching: false
                });
            });
        } else {
            this.setState({
                displaySearchMessage: true
            });
        }
    };

    _handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            this.handleSearch();
        }
    };

    getPlayerStats = (player) => {
        this.setState({
            displayStats: true,
            isStatsSearching: true,
            players: [player]
        });

        Client.stat_search(player.player_id, stats => {
            this.setState({
                stats: stats,
                isStatsSearching: false
            });
        });
    };

    toggleDropDown() {
        this.setState({
            dropdownOpen: !this.state.dropdownOpen
        });
    };

    selectPosition = (event) => {
        this.setState({
            dropdownOpen: !this.state.dropdownOpen,
            position: event.target.value
        });
    };

    render() {
        const {players, stats} = this.state;

        const playerRows = players.map((player, idx) => (
            <tr key={idx}>
                <td className="right aligned">{player.player_name}</td>
                <td className="right aligned">{player.player_nickname}</td>
                <td className="right aligned">{player.player_nationality}</td>
                <td className="right aligned">{player.position}</td>
                <td className="right aligned">{player.player_birthdate}</td>
                <td className="right aligned">{player.player_height}</td>
                <td className="right aligned">{player.player_weight}</td>
                <td>
                    <Button onClick={() => this.getPlayerStats(player)}>View Stats</Button>
                </td>
            </tr>
        ));

        const statRows = stats.map((stat, idx) => {
            var minutes = stat.minutes;
            if (stat.apps > 0 && minutes === 0) {
                minutes = "N/A";
            }
            return (
                <tr key={idx}>
                    <td className="right aligned">{stat.comp_name}</td>
                    <td className="right aligned">{stat.year}</td>
                    <td className="right aligned">{stat.country_name}</td>
                    <td className="right aligned">{stat.club_name}</td>
                    <td className="right aligned">{stat.apps}</td>
                    <td className="right aligned">{stat.starts}</td>
                    <td className="right aligned">{stat.subs}</td>
                    <td className="right aligned">{minutes}</td>
                    <td className="right aligned">{stat.goals}</td>
                    <td className="right aligned">{stat.assists}</td>
                    <td className="right aligned">{stat.yellows}</td>
                    <td className="right aligned">{stat.double_yellows}</td>
                    <td className="right aligned">{stat.reds}</td>
                </tr>
            )
        });
        const showNoResultMessage = playerRows.length === 0 && this.state.displayPlayers && !this.state.isPlayerSearching;
        const showSearchTable = this.state.displayPlayers && !showNoResultMessage;

        return (
            <Container>
                <Row>
                    <Col>
                        <InputGroup>
                            <Input onKeyPress={this._handleKeyPress} onChange={this.handleTextChange}
                                   placeholder="Enter player name..."/>
                            <InputGroupButtonDropdown addonType="append" isOpen={this.state.dropdownOpen}
                                                      toggle={this.toggleDropDown}>
                                <DropdownToggle caret>
                                    {this.state.position}
                                </DropdownToggle>
                                <DropdownMenu>
                                    <DropdownItem onClick={this.selectPosition}
                                                  value={DEFAULT_POSITION}>{DEFAULT_POSITION}</DropdownItem>
                                    <DropdownItem onClick={this.selectPosition}
                                                  value="Goalkeeper">Goalkeeper</DropdownItem>
                                    <DropdownItem onClick={this.selectPosition} value="Defender">Defender</DropdownItem>
                                    <DropdownItem onClick={this.selectPosition}
                                                  value="Midfielder">Midfielder</DropdownItem>
                                    <DropdownItem onClick={this.selectPosition} value="Attacker">Attacker</DropdownItem>
                                </DropdownMenu>
                            </InputGroupButtonDropdown>
                            <Button onClick={this.handleSearch}>Search</Button>
                        </InputGroup>
                        <ToggleDisplay show={this.state.displaySearchMessage}>
                            Searches must be greater than 3 characters.
                        </ToggleDisplay>
                        <ToggleDisplay show={showNoResultMessage}>
                            <h4>No results found for "{this.state.activeSearchText}"
                                ({this.state.activeSearchPosition})</h4>
                        </ToggleDisplay>
                        <ToggleDisplay show={this.state.isPlayerSearching}>
                            <h5>Searching for "{this.state.searchText}"...</h5>
                        </ToggleDisplay>
                        <ToggleDisplay show={showSearchTable}>
                            <table>
                                <thead>
                                <tr>
                                    <th>Full Name</th>
                                    <th>Short Name</th>
                                    <th>Nationality</th>
                                    <th>Position</th>
                                    <th>Birthdate</th>
                                    <th>Height (cm)</th>
                                    <th>Weight (kg)</th>
                                </tr>
                                </thead>
                                <tbody>
                                {playerRows}
                                </tbody>
                            </table>
                        </ToggleDisplay>
                        <ToggleDisplay show={this.state.displayStats}>
                            <h4>Season Statistics</h4>
                            <Table>
                                <thead>
                                <tr>
                                    <th>Comp</th>
                                    <th>Season</th>
                                    <th>Country</th>
                                    <th>Club</th>
                                    <th>Apps</th>
                                    <th>Starts</th>
                                    <th>Subs</th>
                                    <th>Minutes</th>
                                    <th>Goals</th>
                                    <th>Assists</th>
                                    <th>Yellow</th>
                                    <th>Double Yellow</th>
                                    <th>Red</th>
                                </tr>
                                </thead>
                                <tbody>
                                {statRows}
                                </tbody>
                            </Table>
                        </ToggleDisplay>
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default Players;