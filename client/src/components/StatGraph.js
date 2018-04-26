import React, {Component} from "react";
import Client from "../Client";
import {ScatterChart, XAxis, YAxis, ZAxis, Label, Legend, Scatter, CartesianGrid, Tooltip} from "recharts";

const PLAYER_STATS = [
    ['Goals', 'goals'],
    ['Assists', 'assists'],
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

class CustomTooltip extends Component {
    render() {
        console.log(this.props);

        return null;
    }
}

export default class StatGraph extends Component {

    constructor(props) {
        super(props);

        this.state = {
            playerStats: [],
            stat: PLAYER_STATS[0],
            year: "2017/2018"
        }
    }

    componentDidMount() {
        this.updateStats();
    }

    updateStats = () => {
        const {stat, year} = this.state;

        Client.player_graph_data(stat, year, res => {
            this.setState({
                playerStats: res
            })
        })
    };

    renderTooltip = () => {

    };

    render() {
        const {playerStats} = this.state;

        const data = playerStats.map(stat => {
            return {
                games: stat.games,
                total: stat.total,
                name: stat.name
            }
        });

        return (
            <div>
                <ScatterChart width={500} height={400} margin={{top: 20, right: 20, bottom: 10, left: 10}}>
                    <XAxis type="number" dataKey="games" name="Games">
                        <Label value="Games" offset={0} position="insideBottom" />
                    </XAxis>
                    <YAxis type="number" dataKey="total" name="Goals">
                        <Label value="Goals" offset={0} position="insideLeft" />
                    </YAxis>
                    <CartesianGrid />
                    <Scatter data={data} fill="#8884d8"/>
                </ScatterChart>
            </div>
        );
    };
}