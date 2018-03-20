import React, {Component} from "react";
import Client from "../Client";
import {Button, Table, Container, Row, Col, Modal, ModalBody, ModalHeader, ModalFooter} from "reactstrap";
import {find_club_by_id} from "../util/ClubFunctions";
import "react-select/dist/react-select.css";

class MatchStats extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isOpen: false,
            home_lineup: [],
            away_lineup: [],
            matchStats: []
        };

        this.toggle = this.toggle.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        const {match} = nextProps;

        if (match) {
            Client.match_lineup(match.match_id, (lineups) => {
                var home_lineup = [], away_lineup = [];

                for (var i = 0; i < lineups.length; i++) {
                    const entry = lineups[i];

                    if (entry.club_id === match.home_team_id) {
                        home_lineup.push(entry);
                    } else {
                        away_lineup.push(entry);
                    }
                }

                this.setState({
                    home_lineup: home_lineup,
                    away_lineup: away_lineup
                })
            });
            Client.club_match_stats(match.match_id, (stats) => {
                this.setState({
                    matchStats: stats
                })
            });
            this.setState({
                isOpen: true
            });
        }
    }

    toggle = () => {
        this.setState({
            isOpen: !this.state.isOpen
        });
    };

    render() {
        const {match} = this.props;
        const {home_lineup, away_lineup, matchStats} = this.state;

        const home_team = match ? find_club_by_id(match.home_team_id) : "";
        const away_team = match ? find_club_by_id(match.away_team_id) : "";
        const date_of_game = match ? match.date_of_game : "";

        const home_lineup_rows = home_lineup.map((player, idx) => {
            return (
                <div>
                    <tr>player.name</tr>
                    <tr>player.position</tr>
                </div>
            );
        });
        console.log(matchStats);

        return (
            <Modal isOpen={this.state.isOpen} toggle={this.toggle}>
                <ModalHeader toggle={this.toggle}>{home_team.name} vs. {away_team.name} ({date_of_game})</ModalHeader>
                <ModalBody>
                    <h3>{home_team.name} {match.home_team_score} - {match.away_team_score} {away_team.name}</h3>
                    <Col>{home_lineup_rows}</Col>
                    Match stats.
                </ModalBody>
                <ModalFooter>
                    <Button color="danger" onClick={this.toggle}>Close</Button>
                </ModalFooter>
            </Modal>
        );
    }
}

export default MatchStats;