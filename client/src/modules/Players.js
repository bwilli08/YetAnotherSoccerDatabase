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
            isGoalkeeper: false,
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
        const isGoalkeeper = player.position === "GK";

        this.setState({
            displayStats: true,
            isGoalkeeper: isGoalkeeper,
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

    getStatHeader = () => {
        if (this.state.isGoalkeeper) {
            return (
                <tr>
                    <th>Club</th>
                    <th>Season</th>
                    <th>Games</th>
                    <th>Save Percentage</th>
                </tr>);
        } else {
            return (
                <tr>
                    <th>Club</th>
                    <th>Season</th>
                    <th>Age</th>
                    <th>Apps</th>
                    <th>Starts</th>
                    <th>Subs</th>
                    <th>MPG</th>
                    <th>Goals</th>
                    <th>Assists</th>
                    <th>Fouls</th>
                    <th>YC</th>
                    <th>RC</th>
                    <th>Shots</th>
                </tr>);
        }
    };

    populateRows = (stat, idx) => {
        if (this.state.isGoalkeeper) {
            return (
                <tr key={idx}>
                    <td className="right aligned">{stat.club_name}</td>
                    <td className="right aligned">{stat.season}</td>
                    <td className="right aligned">{stat.games}</td>
                    <td className="right aligned">{stat.save_perc}</td>
                </tr>
            )
        } else {
            return (
                <tr key={idx}>
                    <td className="right aligned">{stat.club_name}</td>
                    <td className="right aligned">{stat.season}</td>
                    <td className="right aligned">{stat.age}</td>
                    <td className="right aligned">{stat.games}</td>
                    <td className="right aligned">{stat.games_starts}</td>
                    <td className="right aligned">{stat.games_subs}</td>
                    <td className="right aligned">{stat.minutes_per_game}</td>
                    <td className="right aligned">{stat.goals}</td>
                    <td className="right aligned">{stat.assists}</td>
                    <td className="right aligned">{stat.fouls}</td>
                    <td className="right aligned">{stat.cards_yellow}</td>
                    <td className="right aligned">{stat.cards_red}</td>
                    <td className="right aligned">{stat.shots_on_target}</td>
                </tr>
            )
        }
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
                <td className="right aligned">{player.date_of_birth}</td>
                <td className="right aligned">{player.position}</td>
                <td>
                    <Button onClick={() => this.getPlayerStats(player)}>View Stats</Button>
                </td>
            </tr>
        ));

        const statHeader = this.getStatHeader();
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
                                    <th>DOB</th>
                                    <th>Position</th>
                                    <th>Stats</th>
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
                                {statHeader}
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