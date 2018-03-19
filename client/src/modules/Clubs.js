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

            displaySeasons: false,
            isSeasonsSearching: false,
            seasons: []
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
                displaySeasons: false
            });

            Client.club_search_with_name(club_name, clubs => {
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

    getSeasons = (club) => {
        this.setState({
            displaySeasons: true,
            isSeasonsSearching: true,
            clubs: [club]
        });

        Client.club_seasons(club.club_id, seasons => {
            this.setState({
                seasons: seasons,
                isSeasonsSearching: false
            });
        });
    };

    render() {
        const {clubs, seasons} = this.state;

        const clubRows = clubs.map((club, idx) => (
            <tr key={idx}>
                <td className="right aligned">{club.club_name}</td>
                <td className="right aligned">{club.country_name}</td>
                <td className="right aligned">{club.continent}</td>
                <td className="right aligned">{club.venue_city}</td>
                <td className="right aligned">{club.venue_name}</td>
                <td className="right aligned">{club.venue_capacity}</td>
                <td>
                    <Button onClick={() => this.getSeasons(club)}>View</Button>
                </td>
            </tr>
        ));

        const seasonRows = seasons.map((season, idx) => (
            <tr>
                <td>{season.name}</td>
                <td>{season.year}</td>
                <td>{season.win_total}-{season.draw_total}-{season.lost_total}</td>
                <td>{season.goals_for_total}-{season.goals_against_total}</td>
                <td>
                    <Button onClick={() => this.showSeasonStats(seasons)}>View Stats</Button>
                </td>
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
                                    <th>Country</th>
                                    <th>Continent</th>
                                    <th>City</th>
                                    <th>Stadium</th>
                                    <th>Capacity</th>
                                    <th>About</th>
                                </tr>
                                </thead>
                                <tbody>
                                {clubRows}
                                </tbody>
                            </Table>
                        </ToggleDisplay>
                        <ToggleDisplay show={this.state.displaySeasons}>
                            <h4>Seasons</h4>
                            <Table>
                                <thead>
                                <tr>
                                    <th>Competition</th>
                                    <th>Season</th>
                                    <th>Record (W-D-L)</th>
                                    <th>Goals (For-Against)</th>
                                    <th>More</th>
                                </tr>
                                </thead>
                                <tbody>
                                {seasonRows}
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