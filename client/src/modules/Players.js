import React, {Component} from "react";
import {Button, InputGroup, Input, Table, Container, Row, Col} from "reactstrap";
import Client from "../Client";
import ToggleDisplay from "react-toggle-display";

const MATCHING_PLAYER_LIMIT = 25;

class Players extends Component {

    constructor(params) {
        super(params);

        this.state = {
            player_name: "",
            displayPlayers: false,
            players: [],
            isPlayerSearching: false,

            player_id: "",
            displayStats: false,
            stats: [],
            isGoalkeeper: false,
            isStatsSearching: false
        };
    }

    handleTextChange = (event) => {
        this.setState({
            player_name: event.target.value
        });
    };

    handleSearch = () => {
        const player_name = this.state.player_name;
        if (player_name.length > 3) {
            this.setState({
                displayPlayers: true,
                isPlayerSearching: true
            });

            Client.player_search(player_name, players => {
                this.setState({
                    players: players.slice(0, MATCHING_PLAYER_LIMIT),
                    isPlayerSearching: false
                });
            });
        }
    };

    _handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            this.handleSearch();
        }
    };

    getPlayerStats = (player_id, position) => {
        const isGoalkeeper = position === "GK";

        this.setState({
            displayStats: true,
            isGoalkeeper: isGoalkeeper,
            isStatsSearching: true
        });

        Client.stat_search(player_id, stats => {
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
                    <th>Games</th>
                    <th>Save Percentage</th>
                    <th>Season ID</th>
                </tr>);
        } else {
            return (
                <tr>
                    <th>Games</th>
                    <th>Goals</th>
                    <th>Season ID</th>
                </tr>);
        }
    };

    populateRows = (stat, idx) => {
        if (this.state.isGoalkeeper) {
            return (
                <tr key={idx}>
                    <td className="right aligned">{stat.games}</td>
                    <td className="right aligned">{stat.save_perc}</td>
                    <td className="right aligned">{stat.season_id}</td>
                </tr>
            )
        } else {
            return (
                <tr key={idx}>
                    <td className="right aligned">{stat.games}</td>
                    <td className="right aligned">{stat.goals}</td>
                    <td className="right aligned">{stat.season_id}</td>
                </tr>
            )
        }
    };

    render() {
        const {players, stats} = this.state;

        const playerRows = players.map((player, idx) => (
            <tr key={idx}>
                <td className="right aligned">{player.name}</td>
                <td className="right aligned">{player.date_of_birth}</td>
                <td className="right aligned">{player.position}</td>
                <td>
                    <Button onClick={() => this.getPlayerStats(player.player_id)}>View Stats</Button>
                </td>
            </tr>
        ));

        const statHeader = this.getStatHeader();
        const statRows = stats.map((stat, idx) => this.populateRows(stat, idx));

        return (
            <Container>
                <Row>

                    <Col>
                        <InputGroup>
                            <Input onKeyPress={this._handleKeyPress} onChange={this.handleTextChange}
                                   placeholder="Enter player name..."/>
                            <Button onClick={this.handleSearch}>Search</Button>
                        </InputGroup>
                        <ToggleDisplay show={this.state.displayPlayers}>
                            <ToggleDisplay show={this.state.isPlayerSearching}>
                                <h4>Searching for "{this.state.player_name}"</h4>
                            </ToggleDisplay>
                            <Table>
                                <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>DOB</th>
                                    <th>Position</th>
                                    <th></th>
                                </tr>
                                </thead>
                                <tbody>
                                {playerRows}
                                </tbody>
                            </Table>
                        </ToggleDisplay>
                    </Col>
                    <Col>
                        <ToggleDisplay show={this.state.displayStats}>
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