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

    getSearchName = () => {
            if (this.props.location.state) {
                const name = this.props.location.state.name;

                if (name && !this.state.name) {
                    this.setState({
                        name: name,
                        displayInfo: true
                    });
                }
            }

            if (!this.state || this.state.name || this.state.displayInfo) {
                this.setState({
                    name: "",
                    displayInfo: false
                });
            }

            this.shouldUpdate = false;

        return this.state.name;
    };

    render() {

        const name = this.getSearchName();

        return (
            <div>
                <h1>Clubs</h1>
                <h2>{name}</h2>
                This is the clubs section.
            </div>
        );
    }
}

export default withRouter(Clubs);