import React, {Component} from "react";
import Top10Tables from "../components/Top10Tables";
import {Col, Container, Row} from "reactstrap";
import ReactMarkdown from "react-markdown";
import Plot from 'react-plotly.js';


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
                        <Plot
                            data={[
                                {
                                    x: [1, 2, 3],
                                    y: [2, 6, 3],
                                    type: 'scatter',
                                    mode: 'lines+points',
                                    marker: {color: 'red'},
                                },
                                {type: 'bar', x: [1, 2, 3], y: [2, 5, 3]},
                            ]}
                            layout={ {width: 320, height: 240, title: 'A Fancy Plot'} }
                        />
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