import React, {Component} from "react";
import {find_club_by_id} from "../util/ClubFunctions";

const TEAM_STATS = [
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
];

export default class MatchStatTable extends Component {
    render() {
        const {match, matchStats} = this.props;

        if (match && matchStats.length > 0) {
            const home_team = find_club_by_id(match.home_team_id);
            const away_team = find_club_by_id(match.away_team_id);

            const home_stats = matchStats.filter(stat => stat.club_id === home_team.id)[0];
            const away_stats = matchStats.filter(stat => stat.club_id === away_team.id)[0];

            let statRows = [];

            TEAM_STATS.forEach(stat => {
                    const key = "match-" + stat[0];
                    statRows.push(
                        <tr key={key}>
                            <td className="text-left">{home_stats[stat[1]]}</td>
                            <td className="text-center">{stat[0]}</td>
                            <td className="text-right">{away_stats[stat[1]]}</td>
                        </tr>
                    )
                }
            );

            return (
                <table className="table table-bordered table-striped table-sm" width="100%">
                    <thead>
                    <tr>
                        <th width="33.33%" className="text-left">{home_team.name}</th>
                        <th width="33.33%" className="text-center">Stat</th>
                        <th width="33.33%" className="text-right">{away_team.name}</th>
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
}