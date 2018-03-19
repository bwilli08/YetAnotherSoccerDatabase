import React, {Component} from "react";
import {Container} from "reactstrap";
import Client from "../Client";
import ReactMarkdown from "react-markdown";

export default class About extends Component {

    constructor() {
        super();

        this.state = {
            markdown: ""
        };
    }

    componentDidMount() {
        Client.get_readme(res => {
            this.setState({
                markdown: <ReactMarkdown source={res}/>
            });
        });
    }

    render() {
        return (
            <Container>
                {this.state.markdown}
            </Container>
        );
    }
}