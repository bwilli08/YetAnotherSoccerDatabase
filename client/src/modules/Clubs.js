import React, {Component} from "react";
import {withRouter} from "react-router-dom";

class Clubs extends Component {

    constructor(props) {
        super(props);

        this.setState({
            name: "",
            displayInfo: false
        });
    }

    render() {
        return (
            <div>
                <h1>Clubs</h1>
                This is the clubs section.
            </div>
        );
    }
}

export default withRouter(Clubs);