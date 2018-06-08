import React, {Component} from "react";
import {Button, Col, Container, Input, InputGroup, Row, Table} from "reactstrap";
import Client from "../Client";
import ClubModal from "../components/ClubModal";
import ToggleDisplay from "react-toggle-display";

const MATCHING_CLUB_LIMIT = 25;

class Clubs extends Component {

    handleTextChange = (event) => {
        this.setState({
            searchText: event.target.value
        });
    };
    handleSearch = () => {
        const club_name = this.state.searchText;

        if (club_name === this.state.activeSearchText) {
            return;
        }

        if (club_name.length > 3) {
            this.setState({
                displaySearchMessage: false,
                displayClubs: true,
                clubs: [],
                isClubSearching: true
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
    setActiveClub = (club) => {
        this.setState({
            activeClub: club
        });
    };

    constructor() {
        super();

        this.state = {
            searchText: "",
            activeSearchText: "",

            displaySearchMessage: false,
            displayClubs: false,
            clubs: [],
            isClubSearching: false,

            activeClub: null
        };
    }

    render() {
        const {clubs, activeClub} = this.state;

        const clubRows = clubs.map((club, idx) => (
            <tr key={idx}>
                <td className="right aligned">{club.club_name}</td>
                <td className="right aligned">{club.country_name}</td>
                <td className="right aligned">{club.continent}</td>
                <td className="right aligned">{club.venue_city}</td>
                <td className="right aligned">{club.venue_name}</td>
                <td className="right aligned">{club.venue_capacity}</td>
                <td>
                    <Button onClick={() => this.setActiveClub(club)}>More</Button>
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
                                    <th></th>
                                </tr>
                                </thead>
                                <tbody>
                                {clubRows}
                                </tbody>
                            </Table>
                        </ToggleDisplay>
                        <ClubModal club={activeClub} handler={() => this.setActiveClub(null)}/>
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default Clubs;