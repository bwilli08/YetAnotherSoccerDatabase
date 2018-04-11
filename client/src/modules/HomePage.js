import React, {Component} from "react";
import Client from "../Client";
import {Col, Container, Row} from "reactstrap";
import ReactMarkdown from "react-markdown";

const introduction = `
### Introduction
Welcome to Yet Another Soccer Database, a website that provides access to soccer statistics from across the world.
Throughout the site, you can search for specific players, clubs, and matches from the past two seasons. Don't worry,
we're working on getting information from more than the past two seasons!
`;

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

    getTable = (variable, dataName, header) => {
        const data = this.state[variable];

        const dataRows = data.map((data, idx) => (
            <tr key={idx}>
                <td className="right aligned">{data.nickname}</td>
                <td className="right aligned">{data.nationality}</td>
                <td className="right aligned">{data.total}</td>
            </tr>
        ));

        return (
            <div>
                <h4>{header}</h4>
                <table className="table table-striped table-bordered table-sm">
                    <thead>
                    <tr>
                        <th>Name</th>
                        <th>Nationality</th>
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

    getPlayerColumn = () => {
        const topScorerTable = this.getTable("topScorers", "Goals", "Top Scorers");
        const topAssistersTable = this.getTable("topAssisters", "Assists", "Top Assisters");
        const topYellowCardsTable = this.getTable("topYellowCards", "Yellow Cards", "Most Yellow Cards");
        const topRedCardsTable = this.getTable("topRedCards", "Red Cards", "Most Red Cards");

        return (
            <Col>
                {topScorerTable}
                {topAssistersTable}
                {topYellowCardsTable}
                {topRedCardsTable}
            </Col>
        );
    };

    render() {
        const playerColumn = this.getPlayerColumn();

        return (
            <Container fluid>
                <Row>
                    {playerColumn}
                    <Col>
                        <ReactMarkdown source={introduction}/>
                    </Col>
                    <Col>
                        Country Stuff
                    </Col>
                </Row>
            </Container>
        );
    }

}