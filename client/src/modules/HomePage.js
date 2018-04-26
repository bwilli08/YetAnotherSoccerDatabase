import React, {Component} from "react";
import Top10Tables from "../components/Top10Tables";
import {Col, Container, Row} from "reactstrap";
import ReactMarkdown from "react-markdown";
import OverallTable from "../components/OverallTable";

const introduction = `
### Introduction
Welcome to Yet Another Soccer Database, a website that provides access to soccer statistics from across the world.
Throughout the site, you can search for specific players, clubs, and matches. Unfortunately, match stats are only
available for the past two seasons, but don't worry, we're working on it!
`;

export default class HomePage extends Component {
    render() {
        return (
            <Container fluid>
                <Row>
                    <Col md="3">
                        <h4>All-Time Player Stats</h4>
                        <Top10Tables type="player"/>
                    </Col>
                    <Col>
                        <ReactMarkdown source={introduction}/>
                        <hr/>
                        <OverallTable/>
                    </Col>
                    <Col md="3">
                        <h4>2017/18 Club Stats</h4>
                        <Top10Tables type="club" year="2017/2018"/>
                    </Col>
                </Row>
            </Container>
        );
    }
}