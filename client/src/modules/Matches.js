import React, {Component} from "react";
import {Button, Table, Container, Row, Col, Modal, ModalBody, ModalHeader, ModalFooter} from "reactstrap";
import Client from "../Client";
import Select from "react-select";
import "react-select/dist/react-select.css";
import ToggleDisplay from "react-toggle-display";


var clubs = [];
Client.club_search(res => clubs = res);

const find_club_by_id = (id) => {
    for (var i = 0; i < clubs.length; i++) {
        if (clubs[i].id === id) {
            return clubs[i];
        }
    }
};

class Matches extends Component {
    constructor() {
        super();

        this.state = {
            rSelected: 1,
            club1: null,
            club2: null,
            matches: [],
            displayMatches: false,
            isOpen: false,
            activeMatch: null,
            matchStats: []
        };

        this.toggle = this.toggle.bind(this);
    }

    toggle = () => {
        this.setState({
            isOpen: !this.state.isOpen
        });
    };

    displayMatchStats = (match) => {
        this.setState({
            activeMatch: match
        });
        Client.club_match_stats(match.match_id, (stats) => {
            this.setState({
                matchStats: stats
            });
        });
        this.toggle();
    };

    handleChange = (selectedOption) => {
        if (this.state.rSelected === 1) {
            this.setState({
                rSelected: 2,
                club1: selectedOption
            });
        } else {
            this.setState({
                rSelected: 1,
                club2: selectedOption
            });
        }
    };

    filterOption = (option, inputString) => {
        return option.name.toLowerCase().includes(inputString.toLowerCase());
    };

    renderOption = (option) => {
        return option.name;
    };

    onRadioButtonClick = (target) => {
        this.setState({
            rSelected: target
        });
    };

    handleSearch = () => {
        const {club1, club2} = this.state;

        Client.club_match_search(
            club1 ? club1.id : null,
            club2 ? club2.id : null,
            matches => {
                this.setState({
                    displayMatches: true,
                    matches: matches
                });
            });
    };

    hardReset = () => {
        this.setState({
            rSelected: 1,
            club1: null,
            club2: null,
            matches: [],
            displayMatches: false,
            isOpen: false,
            activeMatch: null,
            matchStats: []
        });
    };

    render() {
        const {selectedOption, matches, activeMatch} = this.state;
        const name = selectedOption && selectedOption.name;

        const team1String = this.state.club1 ? this.state.club1.name : "Team 1";
        const team2String = this.state.club2 ? this.state.club2.name : "Team 2";

        const searchPromptText = `Select team for club ${this.state.rSelected}`;

        const matchRows = matches.map((match, idx) => {
            const home_team = find_club_by_id(match.home_team_id);
            const away_team = find_club_by_id(match.away_team_id);

            return (
                <tr key={idx}>
                    <td>{match.league}</td>
                    <td>{match.venue}</td>
                    <td>{match.date_of_game}</td>
                    <td>{home_team.name}</td>
                    <td>{away_team.name}</td>
                    <td>{match.home_team_score} - {match.away_team_score}</td>
                    <td>
                        <Button onClick={() => this.displayMatchStats(match)}>View Stats</Button>
                    </td>
                </tr>
            )
        });

        const home_team = activeMatch ? find_club_by_id(activeMatch.home_team_id) : "";
        const away_team = activeMatch ? find_club_by_id(activeMatch.away_team_id) : "";
        const date_of_game = activeMatch ? activeMatch.date_of_game : "";
        const matchStatRows = this.state.matchStats.map((stat, idx) => {
            var clubName;
            if (stat.club_id === home_team.id) {
                clubName = home_team.name;
            } else {
                clubName = away_team.name;
            }

            return <div>
                {clubName}
            </div>
        });
        const modal = activeMatch ?
                <Modal isOpen={this.state.isOpen} toggle={this.toggle}>
                    <ModalHeader toggle={this.toggle}>{home_team.name} vs. {away_team.name} ({date_of_game})</ModalHeader>
                    <ModalBody>
                        {matchStatRows}
                    </ModalBody>
                    <ModalFooter>
                        <Button color="danger" onClick={this.toggle}>Close</Button>
                    </ModalFooter>
                </Modal>
                :
                ""
            ;

        return (
            <Container>
                <Row>
                    <Col>
                        <Row>
                            <Col xs="5">
                                <Select
                                    searchPromptText={searchPromptText}
                                    name="form-field-name"
                                    value={name}
                                    valueRenderer={this.renderOption}
                                    optionRenderer={this.renderOption}
                                    filterOption={this.filterOption}
                                    onChange={this.handleChange}
                                    options={clubs}
                                    matchPos="any"
                                    ignoreCase="True"
                                />
                            </Col>
                            <Col xs="2">
                                <Button onClick={this.handleSearch}>Search Matches</Button>
                            </Col>
                            <Col xs="auto">
                                <Button color="primary" active={this.state.rSelected === 1}
                                        onClick={() => this.onRadioButtonClick(1)}>{team1String}</Button>
                            </Col>
                            <Col xs="auto">
                                <Button color="primary" active={this.state.rSelected === 2}
                                        onClick={() => this.onRadioButtonClick(2)}>{team2String}</Button>
                            </Col>
                            <Col>
                                <Button color="danger" onClick={() => this.hardReset()}>Clear</Button>
                            </Col>
                        </Row>
                        {modal}
                        <Row>
                            <ToggleDisplay show={this.state.displayMatches}>
                                <h4>Matches</h4>
                                <Table bordered striped>
                                    <thead>
                                    <tr>
                                        <th>Competition</th>
                                        <th>Venue</th>
                                        <th>Date</th>
                                        <th>Home Team</th>
                                        <th>Away Team</th>
                                        <th>Score</th>
                                        <th>See More</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {matchRows}
                                    </tbody>
                                </Table>
                            </ToggleDisplay>
                        </Row>
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default Matches;