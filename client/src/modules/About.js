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
                <p>
                    Source code viewable via <a href="https://github.com/bwilli08/YetAnotherSoccerDatabase">Github
                    Repository</a>.
                    <br/>
                    The below is a rendering of the README markdown file using <a
                    href="https://github.com/rexxars/react-markdown">React Markdown</a>, and some links might not be
                    functioning correctly as a result.
                </p>
                {this.state.markdown}
            </Container>
        );
    }
}