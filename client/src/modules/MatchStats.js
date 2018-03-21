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
    ModalFooter
} from "reactstrap";
import {find_club_by_id} from "../util/ClubFunctions";
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

class MatchStats extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isOpen: false,
            home_lineup: [],
            away_lineup: [],
            matchStats: [],
            activeTab: '1',
            playerTab: '1'
        };

        this.closeModal = this.closeModal.bind(this);
        this.toggleTab = this.toggleTab.bind(this);
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

    closeModal = () => {
        this.setState({
            isOpen: false,
            home_lineup: [],
            away_lineup: [],
            matchStats: [],
            activeTab: '1',
            playerTab: '1'
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

    togglePlayerTab = (tab) => {
        if (this.state.playerTab !== tab) {
            this.setState({
                playerTab: tab
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

            return (<h3 class="text-center">{home_team.name} {match.home_team_score}
                - {match.away_team_score} {away_team.name}</h3>);
        }
        return "";
    };

    getMatchStats = () => {
        const {match} = this.props;
        const {matchStats} = this.state;

        if (match && matchStats.length > 0) {
            const home_team = find_club_by_id(match.home_team_id);
            const away_team = find_club_by_id(match.away_team_id);

            const home_stats = matchStats.filter(stat => stat.club_id === home_team.id)[0];
            const away_stats = matchStats.filter(stat => stat.club_id === away_team.id)[0];

            var statRows = [];

            [
                ['Goals', 'goals'],
                ['Shots', 'shots'],
                ['Shots on Target', 'shots_on_goal'],
                ['Fouls', 'fouls'],
                ['Interceptions', 'interceptions'],
                ['Saves', 'saves'],
                ['Clearances', 'clearances'],
                ['Tackles', 'tackles'],
                ['Offsides', 'offsides'],
                ['Blocks', 'blocks'],
                ['Passes', 'passes'],
                ['Crosses', 'crosses'],
                ['Yellow Cards', 'yellow_cards'],
                ['Red Cards', 'red_cards']
            ]
                .forEach(stat => {
                        const key = "match-" + stat[0];
                        statRows.push(
                            <tr key={key}>
                                <td class="text-left">{home_stats[stat[1]]}</td>
                                <td class="text-center">{stat[0]}</td>
                                <td class="text-right">{away_stats[stat[1]]}</td>
                            </tr>
                        )
                    }
                );

            return (
                <table class="table table-bordered table-striped table-sm" width="100%">
                    <thead>
                    <tr>
                        <th width="33.33%" class="text-left">{home_team.name}</th>
                        <th width="33.33%" class="text-center">Stat</th>
                        <th width="33.33%" class="text-right">{away_team.name}</th>
                    </tr>
                    </thead>
                    <tbody>
                    {statRows}
                    </tbody>
                </table>
            );
        }

        return "";
    };

    getLineupTable = () => {
        const {match} = this.props;
        const {home_lineup, away_lineup} = this.state;

        if (match && home_lineup.length > 0 && away_lineup.length > 0) {
            const home_team = find_club_by_id(match.home_team_id);
            const away_team = find_club_by_id(match.away_team_id);
            const max_size = Math.max(home_lineup.length, away_lineup.length);

            const lineup_rows = [];
            for (var i = 0; i < max_size; i++) {
                const home_player = i < home_lineup.length ? home_lineup[i] : {"name": "", "position": ""};
                const away_player = i < away_lineup.length ? away_lineup[i] : {"name": "", "position": ""};


                const row =
                    <tr key={i}>
                        <td class="text-left">{home_player.nickname} ({home_player.position})</td>
                        <td class="text-right">({away_player.position}) {away_player.nickname}</td>
                    </tr>;

                lineup_rows.push(row);
            }

            return (
                <table class="table table-bordered table-striped table-sm">
                    <thead>
                    <tr>
                        <th class="text-left">{home_team.name}</th>
                        <th class="text-right">{away_team.name}</th>
                    </tr>
                    </thead>
                    <tbody>
                    {lineup_rows}
                    </tbody>
                </table>
            );
        }

        return "";
    };

    getPlayerStatRows = (player) => {
        var player_stats = [];
        [
            'minutes_played',
            'goals_scored',
            'assists',
            'shots_total',
            'shots_on_goal',
            'fouls_committed',
            'fouls_drawn',
            'interceptions',
            'saves',
            'clearances',
            'tackles',
            'offsides',
            'blocks',
            'yellow_cards',
            'red_cards',
            'passes_total',
            'passes_accuracy',
            'crosses_total',
            'crosses_accuracy'
        ]
            .forEach(stat => {
                    player_stats.push(
                        <td class="text-center">{player[stat]}</td>
                    )
                }
            );
        return player_stats;
    };

    getLineupStats = (key_prefix, lineup) => {
        var stat_rows = [];
        for (var i = 0; i < lineup.length; i++) {
            const rowKey = key_prefix + i;
            const player = lineup[i];

            const row =
                <tr key={rowKey}>
                    <td class="text-left">{player.nickname}</td>
                    <td class="text-left">{player.position}</td>
                    {this.getPlayerStatRows(player)}
                </tr>;

            stat_rows.push(row);
        }

        return (<div>
            <table class="table table-bordered table-striped table-sm">
                <thead>
                <tr>
                    <th class="text-left">Player</th>
                    <th class="text-left">Pos.</th>
                    <th class="text-center">Min.</th>
                    <th class="text-center">G</th>
                    <th class="text-center">A</th>
                    <th class="text-center">S</th>
                    <th class="text-center">SoT</th>
                    <th class="text-center">FC</th>
                    <th class="text-center">FD</th>
                    <th class="text-center">I</th>
                    <th class="text-center">SV</th>
                    <th class="text-center">C</th>
                    <th class="text-center">T</th>
                    <th class="text-center">O</th>
                    <th class="text-center">B</th>
                    <th class="text-center">YC</th>
                    <th class="text-center">RC</th>
                    <th class="text-center">PTot</th>
                    <th class="text-center">PAcc%</th>
                    <th class="text-center">CTot</th>
                    <th class="text-center">CAcc</th>
                </tr>
                </thead>
                <tbody>
                {stat_rows}
                </tbody>
            </table>
            <p style={{"font-size": "10px"}}>
                G = Goals, A = Assists, S = Shots, SoT = Shots On Target, FC = Fouls Conceded, FD = Fouls Drawn, I =
                Interceptions, SV = Saves, C = Clearances, T = Tackles, O = Offsides, B = Blocks, YC = Yellow Cards, RC
                = Red Cards, PTot = Total Passes, PAcc% = Pass Accuracy, CTot = Total Crosses, CAcc = Accurate Crosses
            </p>
        </div>);
    };

    getPlayerStatsTab = () => {
        const {match} = this.props;
        const {home_lineup, away_lineup} = this.state;

        if (match && home_lineup.length > 0 && away_lineup.length > 0) {
            const home_team = find_club_by_id(match.home_team_id);
            const away_team = find_club_by_id(match.away_team_id);

            const home_stats = this.getLineupStats("home", home_lineup);
            const away_stats = this.getLineupStats("away", away_lineup);

            return (
                <div>
                    <Nav tabs>
                        <NavItem>
                            <NavLink active={this.state.playerTab === '1'} onClick={() => this.togglePlayerTab('1')}>
                                {home_team.name}
                            </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink active={this.state.playerTab === '2'} onClick={() => this.togglePlayerTab('2')}>
                                {away_team.name}
                            </NavLink>
                        </NavItem>
                    </Nav>
                    <TabContent activeTab={this.state.playerTab}>
                        <TabPane tabId='1'>
                            {home_stats}
                        </TabPane>
                        <TabPane tabId='2'>
                            {away_stats}
                        </TabPane>
                    </TabContent>
                </div>
            );
        }

        return "";
    };

    render() {
        const header = this.getHeaderText();
        const scoreHeader = this.getScoreHeader();

        const matchStatTable = this.getMatchStats();
        const lineupTable = this.getLineupTable();
        const playerStatsTab = this.getPlayerStatsTab();

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
                            {matchStatTable}
                        </TabPane>
                        <TabPane tabId='2'>
                            {lineupTable}
                        </TabPane>
                        <TabPane tabId='3'>
                            {playerStatsTab}
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

export default MatchStats;