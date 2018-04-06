import React, {Component} from "react";
import Client from "../Client";
import {Container, Row, Col} from "reactstrap";
import {BootstrapTable, TableHeaderColumn} from "react-bootstrap-table";

export default class HomePage extends Component {

    constructor() {
        super();

        this.state = {
            topScorers: [],
            topAssisters: [],
            topYellowCards: [],
            topRedCards: []
        };
    }

    componentDidMount() {
        Client.overview_search("goals", res => {
            this.setState({
                topScorers: res
            })
        });
        Client.overview_search("assists", res => {
            this.setState({
                topAssisters: res
            })
        });
        Client.overview_search("yellow_cards", res => {
            this.setState({
                topYellowCards: res
            })
        });
        Client.overview_search("red_cards", res => {
            this.setState({
                topRedCards: res
            })
        });
    }

    getTable = (variable, dataName) => {
        const data = this.state[variable];

        const options = {
            noDataText: "Searching for data..."
        };

        return (
            <BootstrapTable data={data} options={options} striped condensed>
                <TableHeaderColumn isKey dataField="playerId" hidden>Player ID</TableHeaderColumn>
                <TableHeaderColumn dataField="nickname">Name</TableHeaderColumn>
                <TableHeaderColumn dataField="nationality">Country</TableHeaderColumn>
                <TableHeaderColumn dataField="total">{dataName}</TableHeaderColumn>
            </BootstrapTable>
        )
    };

    render() {
        const topScorerTable = this.getTable("topScorers", "Goals");
        const topAssistersTable = this.getTable("topAssisters", "Assists");
        const topYellowCardsTable = this.getTable("topYellowCards", "Yellow Cards");
        const topRedCardsTable = this.getTable("topRedCards", "Red Cards");

        return (
            <div>
                <Row>
                    <div class="col-md-4 col-sm-4">
                        {topScorerTable}
                        {topAssistersTable}
                        {topYellowCardsTable}
                        {topRedCardsTable}
                    </div>
                    <div class="col-md-4 col-sm-4">
                        Introduction Write Up
                    </div>
                    <div class="col-md-4 col-sm-4">
                        Country Stuff
                    </div>
                </Row>
            </div>
        );
    }

}