import React, {Component} from "react";
import {Button, Col, Container, DropdownItem, DropdownMenu, DropdownToggle, Row, UncontrolledDropdown} from "reactstrap";
import LineupPicker from "../components/LineupPicker";
import {prediction_seasons} from "../util/ClubFunctions";
import Client from "../Client";

class Predictions extends Component {

    constructor() {
        super();

        this.state = {
            activeSeason: null,
            seasonClubs: [],
            home_is_valid: false,
            home_players: [],
            home_club: null,
            away_is_valid: false,
            away_players: [],
            away_club: null
        }
    }

    selectSeason = (season) => {
        this.setState({
            activeSeason: season
        }, () => {
            Client.clubs_for_season(season.id, (result) => this.setState({
                    seasonClubs: result
                })
            )
        });
    };

    updateTeam = (isHome, isValid, club_id, player_ids) => {
        const prefix = isHome ? "home_" : "away_";

        const valid_attribute = prefix + "is_valid";
        const player_attribute = prefix + "players";
        const club_attribute = prefix + "club";

        this.setState({
            [valid_attribute]: isValid,
            [player_attribute]: player_ids,
            [club_attribute]: club_id
        })
    };

    predictOutcome = () => {
        const {home_is_valid, away_is_valid} = this.state;

        console.log(home_is_valid);
        console.log(away_is_valid);

        if (home_is_valid && away_is_valid) {
            const {activeSeason, home_players, home_club, away_players, away_club} = this.state;

            console.log(activeSeason);
            console.log(home_players);
            console.log(home_club);
            console.log(away_players);
            console.log(away_club);
        }
    };

    render() {
        const {activeSeason, seasonClubs} = this.state;

        const season_rows = prediction_seasons.map((season, idx) => (
            <DropdownItem key={idx}
                          onClick={() => this.selectSeason(season)}>[{season.country}] {season.name} ({season.year})</DropdownItem>
        ));

        return (
            <Container>
                <Row>
                    <Col>
                        <h3>Match Predictions</h3>
                    </Col>
                </Row>
                <hr/>
                <Row>
                    <Col>
                        <UncontrolledDropdown>
                            <DropdownToggle caret>
                                {activeSeason === null
                                    ? "Pick a season..."
                                    : "[" + activeSeason.country + "] " + activeSeason.name + " (" + activeSeason.year + ")"}
                            </DropdownToggle>
                            <DropdownMenu>
                                {season_rows}
                            </DropdownMenu>
                        </UncontrolledDropdown>
                    </Col>
                    <Col>
                        <Button onClick={this.predictOutcome}>Predict Outcome</Button>
                    </Col>
                </Row>
                <hr/>
                <Row>
                    <Col>
                        <LineupPicker placeholder="Select a Home Team..."
                                      activeSeason={activeSeason}
                                      clubs={seasonClubs}
                                      callback={(isValid, club_id, player_ids) => this.updateTeam(true, isValid, club_id, player_ids)}/>
                    </Col>
                    <Col>
                        <LineupPicker placeholder="Select an Away Team..."
                                      activeSeason={activeSeason}
                                      clubs={seasonClubs}
                                      callback={(isValid, club_id, player_ids) => this.updateTeam(false, isValid, club_id, player_ids)}/>
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default Predictions;