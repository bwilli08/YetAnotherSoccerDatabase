import React, {Component} from "react";
import Client from "../Client";
import {
    Button,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Nav,
    NavItem,
    NavLink,
    TabContent,
    TabPane
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

export default class MatchStatModal extends Component {
    closeModal = () => {
        this.setState({
            isOpen: false,
            home_lineup: [],
            away_lineup: [],
            matchStats: [],
            activeTab: '1'
        });
        this.props.handler(false);
    };
    toggleTab = (tab) => {
        if (this.state.activeTab !== tab) {
            this.setState({
                activeTab: tab
            });
        }
    };
    getHeaderText = () => {
        const {match} = this.props;

        if (match) {
            return `${match.league} - ${match.venue} (${match.date_of_game})`;
        }
        return "";
    };
    getScoreHeader = () => {
        const {match} = this.props;

        if (match) {
            const home_team = find_club_by_id(match.home_team_id);
            const away_team = find_club_by_id(match.away_team_id);

            return (<h3 className="text-center">{home_team.name} {match.home_team_score}
                - {match.away_team_score} {away_team.name}</h3>);
        }
        return "";
    };

    constructor(props) {
        super(props);

        this.state = {
            isOpen: false,
            home_lineup: [],
            away_lineup: [],
            matchStats: [],
            activeTab: '1'
        };

        this.closeModal = this.closeModal.bind(this);
        this.toggleTab = this.toggleTab.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        const {match} = nextProps;

        if (match) {
            Client.match_lineup(match.match_id, (lineups) => {
                let home_lineup = [], away_lineup = [];

                for (let i = 0; i < lineups.length; i++) {
                    const entry = lineups[i];

                    if (entry.club_id === match.home_team_id) {
                        home_lineup.push(entry);
                    } else {
                        away_lineup.push(entry);
                    }
                }

                this.setState({
                    home_lineup: home_lineup.sort(sortByPosition),
                    away_lineup: away_lineup.sort(sortByPosition)
                })
            });
            Client.club_match_stats(match.match_id, (stats) => {
                this.setState({
                    matchStats: stats
                })
            });
            this.setState({
                isOpen: true,
                activeTab: '1'
            });
        }
    }

    render() {
        const header = this.getHeaderText();
        const scoreHeader = this.getScoreHeader();

        return (
            <Modal isOpen={this.state.isOpen} toggle={this.closeModal} size="lg">
                <ModalHeader toggle={this.closeModal}>{header}</ModalHeader>
                <ModalBody>
                    {scoreHeader}
                    <Nav tabs>
                        <NavItem>
                            <NavLink active={this.state.activeTab === '1'} onClick={() => this.toggleTab('1')}>
                                Team Stats
                            </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink active={this.state.activeTab === '2'} onClick={() => this.toggleTab('2')}>
                                Lineups
                            </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink active={this.state.activeTab === '3'} onClick={() => this.toggleTab('3')}>
                                Player Stats
                            </NavLink>
                        </NavItem>
                    </Nav>
                    <TabContent activeTab={this.state.activeTab}>
                        <TabPane tabId='1'>
                            <MatchStatTable match={this.props.match} matchStats={this.state.matchStats}/>
                        </TabPane>
                        <TabPane tabId='2'>
                            <MatchLineupTable match={this.props.match} home_lineup={this.state.home_lineup}
                                              away_lineup={this.state.away_lineup}/>
                        </TabPane>
                        <TabPane tabId='3'>
                            <MatchPlayerStats match={this.props.match} home_lineup={this.state.home_lineup}
                                              away_lineup={this.state.away_lineup}/>
                        </TabPane>
                    </TabContent>
                </ModalBody>
                <ModalFooter>
                    <Button color="danger" onClick={this.closeModal}>Close</Button>
                </ModalFooter>
            </Modal>
        );
    }
}
