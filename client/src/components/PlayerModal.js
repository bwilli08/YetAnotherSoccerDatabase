import React, {Component} from "react";
import Client from "../Client";
import {
    TabContent,
    TabPane,
    NavLink,
    Nav,
    NavItem,
    Button,
    Modal,
    ModalBody,
    ModalHeader,
    ModalFooter,
    Table
} from "reactstrap";
import {find_club_by_id} from "../util/ClubFunctions";
import MatchLineupTable from "./MatchLineupTable";
import MatchStatTable from "./MatchStatTable";
import MatchPlayerStats from "./MatchPlayerStats";
import "react-select/dist/react-select.css";


const positionToPriority = {
    "G": 0,
    "D": 1,
    "M": 2,
    "F": 3
};

const sortByPosition = (p1, p2) => {
    const p1Position = positionToPriority[p1.position];
    const p2Position = positionToPriority[p2.position];

    if (p1Position > p2Position) {
        return 1;
    } else if (p1Position < p2Position) {
        return -1;
    }
    return 0;
};

export default class PlayerModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isOpen: false,
            stats: []
        };
    }

    componentWillReceiveProps(nextProps) {
        const {player} = nextProps;

        if (player) {
            Client.stat_search(player.player_id, stats => {
                this.setState({
                    isOpen: true,
                    stats: stats
                });
            });
        }
    }

    closeModal = () => {
        this.setState({
            isOpen: false,
            stats: []
        });
        this.props.handler(false);
    };

    getHeaderText = () => {
        const {player} = this.props;

        if (player) {
            return `${player.player_nickname} (${player.player_name})`;
        }
        return "";
    };

    render() {
        const {stats} = this.state;

        const header = this.getHeaderText();

        const statRows = stats.map((stat, idx) => {
            var minutes = stat.minutes;
            if (stat.apps > 0 && minutes === 0) {
                minutes = "N/A";
            }
            return (
                <tr key={idx}>
                    <td className="right aligned">{stat.comp_name}</td>
                    <td className="right aligned">{stat.year}</td>
                    <td className="right aligned">{stat.country_name}</td>
                    <td className="right aligned">{stat.club_name}</td>
                    <td className="right aligned">{stat.apps} ({stat.subs})</td>
                    <td className="right aligned">{minutes}</td>
                    <td className="right aligned">{stat.goals}</td>
                    <td className="right aligned">{stat.assists}</td>
                    <td className="right aligned">{stat.yellows}</td>
                    <td className="right aligned">{stat.reds}</td>
                </tr>
            )
        });

        return (
            <Modal isOpen={this.state.isOpen} toggle={this.closeModal} size="lg">
                <ModalHeader toggle={this.closeModal}>{header}</ModalHeader>
                <ModalBody>
                    <table className="table table-bordered table-striped table-sm">
                        <thead>
                        <tr>
                            <th>Comp</th>
                            <th>Season</th>
                            <th>Country</th>
                            <th>Club</th>
                            <th>Gm (Sub)</th>
                            <th>Min</th>
                            <th>G</th>
                            <th>A</th>
                            <th>Y</th>
                            <th>R</th>
                        </tr>
                        </thead>
                        <tbody>
                        {statRows}
                        </tbody>
                    </table>
                    <p style={{"font-size": "10px"}}>
                        Gm = Games, Sub = Substitute Appearances, Min = Minutes Played, G = Goals,
                        A = Assists, YC = Yellow Cards, RC = Red Cards
                    </p>
                </ModalBody>
                <ModalFooter>
                    <Button color="danger" onClick={this.closeModal}>Close</Button>
                </ModalFooter>
            </Modal>
        );
    }
}
