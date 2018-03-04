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

    populateRows = (stat, idx) => {
            return (
                <tr key={idx}>
                    <td className="right aligned">{stat.club_name}</td>
                    <td className="right aligned">{stat.comp_name}</td>
                    <td className="right aligned">{stat.year}</td>
                    <td className="right aligned">{stat.most_used_position}</td>
                    <td className="right aligned">{stat.games_played}</td>
                    <td className="right aligned">{stat.minutes_played}</td>
                    <td className="right aligned">{stat.goals}</td>
                    <td className="right aligned">{stat.assists}</td>
                    <td className="right aligned">{stat.yellow_cards}</td>
                    <td className="right aligned">{stat.red_cards}</td>
                    <td className="right aligned">{stat.goals_conceded}</td>
                    <td className="right aligned">{stat.saves}</td>
                </tr>
            )
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
                <td className="right aligned">{player.name}</td>
                <td className="right aligned">{player.nationality}</td>
                <td className="right aligned">{player.dob}</td>
                <td className="right aligned">{player.height}</td>
                <td className="right aligned">{player.foot}</td>
                <td className="right aligned">{player.position}</td>
                <td>
                    <Button onClick={() => this.getPlayerStats(player)}>View Stats</Button>
                </td>
            </tr>
        ));

        const statRows = stats.map((stat, idx) => this.populateRows(stat, idx));
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
                                    <DropdownItem onClick={this.selectPosition} value="GK">Goalkeeper</DropdownItem>
                                    <DropdownItem onClick={this.selectPosition} value="DF">Defender</DropdownItem>
                                    <DropdownItem onClick={this.selectPosition} value="MF">Midfielder</DropdownItem>
                                    <DropdownItem onClick={this.selectPosition} value="FW">Forward</DropdownItem>
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
                            <Table>
                                <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Nationality</th>
                                    <th>DOB</th>
                                    <th>Height</th>
                                    <th>Pref. Foot</th>
                                    <th>Position</th>
                                </tr>
                                </thead>
                                <tbody>
                                {playerRows}
                                </tbody>
                            </Table>
                        </ToggleDisplay>
                        <ToggleDisplay show={this.state.displayStats}>
                            <h4>Game Statistics</h4>
                            <Table>
                                <thead>
                                    <tr>
                                        <th>Club</th>
                                        <th>Comp</th>
                                        <th>Season</th>
                                        <th>Position</th>
                                        <th>Apps</th>
                                        <th>Minutes</th>
                                        <th>Goals</th>
                                        <th>Assists</th>
                                        <th>YC</th>
                                        <th>RC</th>
                                        <th>Goals Conceded</th>
                                        <th>Saves</th>
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