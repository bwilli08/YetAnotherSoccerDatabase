import React, {Component} from "react";
import {Button, Table, Container, Row, Col, DropdownItem} from "reactstrap";
import "react-select/dist/react-select.css";
import "react-virtualized/styles.css";
import "react-virtualized-select/styles.css";
import Select from "react-virtualized-select";
import ToggleDisplay from "react-toggle-display";
import {clubs, find_club_by_id} from "../util/ClubFunctions";
import MatchStatModal from "../components/MatchStatModal";
import Client from "../Client";

export default class Matches extends Component {
    constructor() {
        super();

        this.state = {
            rSelected: 1,
            club1: null,
            club2: null,
            matches: [],
            displayMatches: false,
            activeMatch: null
        };
    }

    displayMatchStats = (match) => {
        this.setState({
            activeMatch: match
        });
    };

    closeMatchStats = () => {
        this.setState({
            activeMatch: null
        })
    };

    selectOption = (selectedOption, selectFunc) => {
        const nextRSelected = this.state.rSelected === 1 ? 2 : 1;
        const stateAttribute = this.state.rSelected === 1 ? "club1" : "club2";

        this.setState({
            rSelected: nextRSelected,
            [stateAttribute]: selectedOption
        }, () => selectFunc(selectedOption));
    };

    filterOption = (option, inputString) => {
        return option.name.toLowerCase().includes(inputString.toLowerCase());
    };

    renderOption = ({key, style, option, selectValue}) => {
        const {name} = option;

        return (
            <DropdownItem id={key} style={style} onClick={() => this.selectOption(option, selectValue)}>
                {name}
            </DropdownItem>
        );
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
            activeMatch: null
        });
    };

    render() {
        const {matches, activeMatch} = this.state;

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

        return (
            <Container>
                <Row>
                    <Col>
                        <Row>
                            <Col xs="5">
                                <Select
                                    searchPromptText={searchPromptText}
                                    optionRenderer={this.renderOption}
                                    filterOption={this.filterOption}
                                    options={clubs}
                                />
                            </Col>
                            <Col xs="2">
                                <Button onClick={this.handleSearch}>Search</Button>
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
                        <MatchStatModal match={activeMatch} handler={this.closeMatchStats}/>
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
