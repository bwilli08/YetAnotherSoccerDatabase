import React, {Component} from "react";
import {Col, Container, DropdownItem, DropdownMenu, DropdownToggle, Row, UncontrolledDropdown} from "reactstrap";
import LineupPicker from "../components/LineupPicker";
import {prediction_seasons} from "../util/ClubFunctions";
import Client from "../Client";

class Predictions extends Component {

    constructor() {
        super();

        this.state = {
            activeSeason: null,
            seasonClubs: []
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
                        <h4>Match Predictions</h4>
                    </Col>
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
                </Row>
                <hr/>
                <Row>
                    <Col>
                        <LineupPicker placeholder="Select a Home Team..." activeSeason={activeSeason} clubs={seasonClubs}/>
                    </Col>
                    <Col>
                        <LineupPicker placeholder="Select an Away Team..." activeSeason={activeSeason} clubs={seasonClubs}/>
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default Predictions;