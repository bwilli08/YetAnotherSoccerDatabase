import React, {Component} from "react";
import Client from "../Client";
import {withRouter} from "react-router-dom";
import {Table} from "reactstrap";

class Players extends Component {

    constructor(params) {
        super(params);

        this.state = {
            player_id: "",
            displayStats: false,
            player_name: "",
            displayPlayers: false,
            template: ""
        };

        this.componentWillMount = this.componentWillMount.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.getTemplate = this.getTemplate.bind(this);
    }

    componentWillMount = () => {
        this.getTemplate((newState) => this.setState(newState));
    };

    componentDidMount = () => {
        this.getTemplate((newState) => this.setState(newState));
    };

    getTemplate = (callback) => {
        var newState = {
            player_id: "",
            displayStats: false,
            player_name: "",
            displayPlayers: false,
            template: ""
        };

        if (this.props.location.search) {
            console.log(this.props.location.search);

            const searchParams = this.props.location.search.slice(1).split("&").map((string) => string.split("="));

            console.log(searchParams);

            for (var i = 0; i < searchParams.length; i++) {
                const param = searchParams[i];
                console.log(param);

                if (param[0] === "id") {
                    newState["player_id"] = param[1];
                    newState["displayStats"] = true;
                } else if (param[0] === "name") {
                    newState["player_name"] = param[1];
                    newState["displayPlayers"] = true;

                }
            }
        }

        if (newState.displayStats) {
            this.setStatTemplate(newState, (template) => newState["template"] = template);
        } else if (newState.displayPlayers) {
            this.setSearchTemplate(newState, (template) => newState["template"] = template);
        }

        console.log(newState);

        callback(newState);
    };

    setStatTemplate = (newState, callback) => {
        const player_id = newState.player_id;

        if (player_id < 1) {
            callback((
                <h3>No Template</h3>
            ));
        } else {
            Client.stat_search(player_id, stats => {
                const stat_rows = stats.slice(0).map((stat, idx) => (
                    <tr key={idx}>
                        <td className="right aligned">{stat.goals}</td>
                    </tr>
                ));

                callback((
                    <Table>
                        <thead>
                        <tr>
                            <th>Club</th>
                            <th>Season</th>
                        </tr>
                        </thead>
                        <tbody>
                        {stat_rows}
                        </tbody>
                    </Table>
                ));
            });
        }
    };

    setSearchTemplate = (newState, callback) => {
        const search_name = newState.player_name;

        if (search_name === "" || search_name.length < 3) {
            callback((
                <h3>No Template</h3>
            ));
        } else {
            Client.player_search(search_name, players => {
                const player_rows = players.slice(0, 25).map((player, idx) => (
                    <tr key={idx}>
                        <td className="right aligned">{player.name}</td>
                        <td className="right aligned">{player.date_of_birth}</td>
                        <td className="right aligned">{player.position}</td>
                        <td className="right aligned">{player.height}</td>
                    </tr>
                ));

                console.log(player_rows);

                callback((<Table>
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Username</th>
                        </tr>
                        </thead>
                        <tbody>
                        {player_rows}
                        </tbody>
                    </Table>
                ));
            });
        }
    };

    render() {
        const template = this.state["template"];

        console.log("RENDER TEMPLATE: " + template);

        return (
            <div>
                {template}
            </div>
        );
    }
}

export default withRouter(Players);