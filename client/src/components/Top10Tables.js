import React, {Component} from "react";
import Client from "../Client";


export default class Top10Tables extends Component {

    getTable = (variable, isPlayer, dataName, header) => {
        const data = this.state[variable];
        const isLoading = this.state[variable.replace("data", "loading")];

        if (isLoading) {
            return (<h5>Loading table...</h5>);
        }

        const dataRows = data.map((data, idx) => (
            <tr key={idx}>
                <td className="right aligned">{isPlayer ? data.name : data.club}</td>
                <td className="right aligned">{isPlayer ? data.nationality : data.country}</td>
                <td className="right aligned">{data.total}</td>
            </tr>
        ));

        return (
            <div>
                <h5>{header}</h5>
                <table className="table table-striped table-bordered table-sm">
                    <thead>
                    <tr>
                        <th>Name</th>
                        <th>{isPlayer ? "Nationality" : "League"}</th>
                        <th>{dataName}</th>
                    </tr>
                    </thead>
                    <tbody>
                    {dataRows}
                    </tbody>
                </table>
            </div>
        );
    };

    constructor(props) {
        super(props);

        this.state = {
            loading1: true,
            data1: [],
            loading2: true,
            data2: [],
            loading3: true,
            data3: [],
            loading4: true,
            data4: []
        };
    }

    componentDidMount() {
        const {type, order, year} = this.props;

        if (type) {
            const isPlayer = type === "player";

            const stat1 = isPlayer ? "goals" : "goals_for_total";
            Client.overview_search(type, stat1, order, year, res => {
                this.setState({
                    loading1: false,
                    data1: res
                })
            });

            const stat2 = isPlayer ? "assists" : "goals_against_total";
            Client.overview_search(type, stat2, order, year, res => {
                this.setState({
                    loading2: false,
                    data2: res
                })
            });

            const stat3 = isPlayer ? "yellow_cards" : "clean_sheet_total";
            Client.overview_search(type, stat3, order, year, res => {
                this.setState({
                    loading3: false,
                    data3: res
                })
            });

            const stat4 = isPlayer ? "red_cards" : "failed_to_score_total";
            Client.overview_search(type, stat4, order, year, res => {
                this.setState({
                    loading4: false,
                    data4: res
                })
            });
        }
    }

    render() {
        const {type, order} = this.props;

        const isPlayer = type === "player";
        const statNames = isPlayer
            ? ["Goals", "Assists", "Yellow Cards", "Red Cards"]
            : ["Goals Scored", "Goals Conceded", "Clean Sheets", "Failed To Score"];
        const headerPrefix = order == null ? "Most" : "Least";
        const headers = isPlayer
            ? ["Goals", "Assists", "Yellow Cards", "Red Cards"]
            : ["Goals Scored", "Goals Conceded", "Clean Sheets", "Failed To Score"];

        const table1 = this.getTable("data1", isPlayer, statNames[0], headerPrefix + " " + headers[0]);
        const table2 = this.getTable("data2", isPlayer, statNames[1], headerPrefix + " " + headers[1]);
        const table3 = this.getTable("data3", isPlayer, statNames[2], headerPrefix + " " + headers[2]);
        const table4 = this.getTable("data4", isPlayer, statNames[3], headerPrefix + " " + headers[3]);

        return (
            <div>
                {table1}
                {table2}
                {table3}
                {table4}
            </div>
        );
    }
}