import React, {Component} from "react";
import {withRouter} from "react-router-dom";

class About extends Component {
    render() {
        return (
            <div>
                <h1>About</h1>
                This is the about section.
            </div>
        );
    }
}

export default withRouter(About);