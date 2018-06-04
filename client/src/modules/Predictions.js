import React, {Component} from "react";
import {Col, Container, DropdownItem, Row} from "reactstrap";
import Select from "react-virtualized-select";
import {clubs} from "../util/ClubFunctions";

const HOME_TEAM = "home_team_id";
const AWAY_TEAM = "away_team_id";

class Predictions extends Component {

    constructor() {
        super();

        this.state = {
            [HOME_TEAM]: null,
            home_lineup: [],
            [AWAY_TEAM]: null,
            away_lineup: []
        };
    }

    selectOption = (selectedOption, stateKey, selectFunc) => {
        this.setState({
            [stateKey]: selectedOption
        }, () => selectFunc(selectedOption));
    };

    filterOption = (option, inputString) => {
        return option.name.toLowerCase().includes(inputString.toLowerCase());
    };

    renderOption = ({key, style, option, selectValue}, stateKey) => {
        const {name} = option;

        return (
            <DropdownItem id={key} style={style} onClick={() => this.selectOption(option, stateKey, selectValue)}>
                {name}
            </DropdownItem>
        );
    };

    render() {
        const home_team = this.state[HOME_TEAM];
        const away_team = this.state[AWAY_TEAM];

        return (
            <Container>
                <Row>
                    <h4>Match Predictions</h4>
                </Row>
                <Row>
                    Select a league.
                </Row>
                <Row>
                    <Col>
                        {home_team === null
                            ? <Select
                                placeholder="Select a Home Team..."
                                optionRenderer={(param) => this.renderOption(param, HOME_TEAM)}
                                filterOption={this.filterOption}
                                options={clubs}
                              />
                            : <strong>Selected Home Team: {home_team.name}</strong>}
                    </Col>
                    <Col>
                        {away_team === null
                            ? <Select
                                placeholder="Select an Away Team..."
                                optionRenderer={(param) => this.renderOption(param, AWAY_TEAM)}
                                filterOption={this.filterOption}
                                options={clubs}
                            />
                            : <strong>Selected Away Team: {away_team.name}</strong>}
                    </Col>
                </Row>
                <Row>
                    <Col>
                        HOME LINEUP PICKER
                    </Col>
                    <Col>
                        AWAY LINEUP PICKER
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default Predictions;