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
            away_club: null,
            can_predict: false,
            outcome: null,
            score: null,
            running_prediction: false
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
        }, () => {
            this.setState({
                can_predict: this.state.activeSeason && this.state.home_is_valid && this.state.away_is_valid
            })
        })
    };

    predictOutcome = () => {
        const {activeSeason, home_club, home_players, away_club, away_players} = this.state;

        console.log(activeSeason);
        console.log(home_club);
        console.log(home_players);
        console.log(away_club);
        console.log(away_players);

        this.setState({
            running_prediction: true
        });

        Client.predict(activeSeason.id, home_club, home_players, away_club, away_players, (res) => {
            this.setState({
                outcome: res.outcome,
                score: res.score,
                running_prediction: false
            })
        });
    };

    scorePredictionComponent = () => {
        const {outcome, score, running_prediction} = this.state;

        if (running_prediction) {
            return [
                <Row style={{"text-align": "center"}}>
                    <h5>Running prediction analysis...</h5>
                    <div className="loader"/>
                </Row>,
                <hr/>
            ];
        } else if (outcome === null || score === null) {
            return "";
        } else {
            return [
                <Row style={{"text-align": "center"}}>
                    <h4>Home Win: {outcome[0]} - Draw: {outcome[1]} - Away Win: {outcome[2]}</h4>
                    <br/>
                    <h5>Most Likely Score: {score[0]}-{score[1]} ({score[2]}%)</h5>
                </Row>,
                <hr/>
            ];
        }
    };

    render() {
        const {activeSeason, seasonClubs, can_predict} = this.state;

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
                        <Button disabled={!can_predict} onClick={this.predictOutcome}>Predict Outcome</Button>
                    </Col>
                </Row>
                <hr/>
                {this.scorePredictionComponent()}
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