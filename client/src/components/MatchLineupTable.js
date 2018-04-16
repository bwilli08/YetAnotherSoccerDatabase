import React, {Component} from "react";
import {find_club_by_id} from "../util/ClubFunctions";

export default class MatchLineupTable extends Component {

    render() {
        const {match, home_lineup, away_lineup} = this.props;

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
                        <td className="text-left">{home_player.nickname} ({home_player.position})</td>
                        <td className="text-right">({away_player.position}) {away_player.nickname}</td>
                    </tr>;

                lineup_rows.push(row);
            }

            return (
                <table className="table table-bordered table-striped table-sm">
                    <thead>
                    <tr>
                        <th className="text-left">{home_team.name}</th>
                        <th className="text-right">{away_team.name}</th>
                    </tr>
                    </thead>
                    <tbody>
                    {lineup_rows}
                    </tbody>
                </table>
            );
        }

        return (<div></div>);
    }

}