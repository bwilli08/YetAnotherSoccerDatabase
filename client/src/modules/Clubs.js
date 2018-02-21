import React, {Component} from "react";
import {Button, InputGroup, Input, Table, Container, Row, Col} from "reactstrap";
import Client from "../Client";
import ToggleDisplay from "react-toggle-display";

const MATCHING_CLUB_LIMIT = 25;

class Clubs extends Component {

    constructor(params) {
        super(params);

        this.state = {
            searchText: "",
            activeSearchText: "",

            displaySearchMessage: false,
            displayClubs: false,
            clubs: [],
            isClubSearching: false,

            displayStats: false,
            isStatsSearching: false,
            stats: []
        };
    }

    handleTextChange = (event) => {
        this.setState({
            searchText: event.target.value
        });
    };

    handleSearch = () => {
        const club_name = this.state.searchText;

        if (!this.state.displayStats && club_name === this.state.activeSearchText) {
            return;
        }

        if (club_name.length > 3) {
            this.setState({
                displaySearchMessage: false,
                displayClubs: true,
                clubs: [],
                isClubSearching: true,
                displayStats: false
            });

            Client.club_search(club_name, clubs => {
                this.setState({
                    activeSearchText: club_name,
                    clubs: clubs.slice(0, MATCHING_CLUB_LIMIT),
                    isClubSearching: false
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

    getClubStats = (club) => {
        this.setState({
            displayStats: true,
            isStatsSearching: true,
            clubs: [club]
        });

        Client.club_stats(club.club_id, stats => {
            this.setState({
                stats: stats,
                isStatsSearching: false
            });
        });
    };

    render() {
        const {stats, clubs} = this.state;

        const clubRows = clubs.map((club, idx) => (
            <tr key={idx}>
                <td className="right aligned">{club.club_name}</td>
                <td className="right aligned">{club.comp}</td>
                <td>
                    <Button onClick={() => this.getClubStats(club)}>View</Button>
                </td>
            </tr>
        ));

        const statRows = stats.map((stat, idx) => (
            <tr>
                <td>{stat.season}</td>
                <td>{stat.comp}</td>
                <td>{stat.goals}</td>
                <td>{stat.assists}</td>
                <td>{stat.fouls}</td>
                <td>{stat.yc}</td>
                <td>{stat.rc}</td>
                <td>{stat.shots}</td>
            </tr>
        ));

        const showNoResultMessage = clubRows.length === 0 && this.state.displayClubs && !this.state.isClubSearching;
        const showSearchTable = this.state.displayClubs && !showNoResultMessage;

        return (
            <Container>
                <Row>
                    <Col>
                        <InputGroup>
                            <Input onKeyPress={this._handleKeyPress} onChange={this.handleTextChange}
                                   placeholder="Enter club name..."/>
                            <Button onClick={this.handleSearch}>Search</Button>
                        </InputGroup>
                        <ToggleDisplay show={this.state.displaySearchMessage}>
                            Searches must be greater than 3 characters.
                        </ToggleDisplay>
                        <ToggleDisplay show={showNoResultMessage}>
                            <h4>No results found for "{this.state.activeSearchText}"</h4>
                        </ToggleDisplay>
                        <ToggleDisplay show={this.state.isClubSearching}>
                            <h5>Searching for "{this.state.searchText}"...</h5>
                        </ToggleDisplay>
                        <ToggleDisplay show={showSearchTable}>
                            <Table>
                                <thead>
                                <tr>
                                    <th>Club</th>
                                    <th>Primary Competition</th>
                                    <th>About</th>
                                </tr>
                                </thead>
                                <tbody>
                                {clubRows}
                                </tbody>
                            </Table>
                        </ToggleDisplay>
                        <ToggleDisplay show={this.state.displayStats}>
                            <h4>Season Statistics</h4>
                            <Table>
                                <thead>
                                <tr>
                                    <th>Season</th>
                                    <th>Competition</th>
                                    <th>Goals</th>
                                    <th>Assists</th>
                                    <th>Fouls</th>
                                    <th>YC</th>
                                    <th>RC</th>
                                    <th>Shots</th>
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

export default Clubs;