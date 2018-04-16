import React, {Component} from "react";
import {TabContent, TabPane, NavLink, Nav, NavItem} from "reactstrap";
import {find_club_by_id} from "../util/ClubFunctions";

const PLAYER_STATS = [
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
];

export default class MatchPlayerStats extends Component {

    constructor(props) {
        super(props);

        this.state = {
            tab: '1'
        }
    }

    toggle = (tab) => {
        if (this.state.tab !== tab) {
            this.setState({
                tab: tab
            });
        }
    };

    getPlayerStatRows = (player) => {
        var player_stats = [];

        PLAYER_STATS.forEach(stat => {
                player_stats.push(
                    <td className="text-center">{player[stat]}</td>
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
                    <td className="text-left">{player.nickname}</td>
                    <td className="text-left">{player.position}</td>
                    {this.getPlayerStatRows(player)}
                </tr>;

            stat_rows.push(row);
        }

        return (<div>
            <table className="table table-bordered table-striped table-sm">
                <thead>
                <tr>
                    <th className="text-left">Player</th>
                    <th className="text-left">Pos.</th>
                    <th className="text-center">Min.</th>
                    <th className="text-center">G</th>
                    <th className="text-center">A</th>
                    <th className="text-center">S</th>
                    <th className="text-center">SoT</th>
                    <th className="text-center">FC</th>
                    <th className="text-center">FD</th>
                    <th className="text-center">I</th>
                    <th className="text-center">SV</th>
                    <th className="text-center">C</th>
                    <th className="text-center">T</th>
                    <th className="text-center">O</th>
                    <th className="text-center">B</th>
                    <th className="text-center">YC</th>
                    <th className="text-center">RC</th>
                    <th className="text-center">PTot</th>
                    <th className="text-center">PAcc%</th>
                    <th className="text-center">CTot</th>
                    <th className="text-center">CAcc</th>
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

    render() {
        const {tab} = this.state;
        const {match, home_lineup, away_lineup} = this.props;

        if (match && home_lineup.length > 0 && away_lineup.length > 0) {
            const home_team = find_club_by_id(match.home_team_id);
            const away_team = find_club_by_id(match.away_team_id);

            const home_stats = this.getLineupStats("home", home_lineup);
            const away_stats = this.getLineupStats("away", away_lineup);

            return (
                <div>
                    <Nav tabs>
                        <NavItem>
                            <NavLink active={tab === '1'} onClick={() => this.toggle('1')}>
                                {home_team.name}
                            </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink active={tab === '2'} onClick={() => this.toggle('2')}>
                                {away_team.name}
                            </NavLink>
                        </NavItem>
                    </Nav>
                    <TabContent activeTab={tab}>
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

        return (<div></div>);
    }
}