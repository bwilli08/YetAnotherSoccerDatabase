import React from "react";
import Client from "./Client";

const MATCHING_PLAYER_LIMIT = 25;

class PlayerSearch extends React.Component {
    state = {
        players: [],
        showRemoveIcon: false,
        searchValue: ""
    };

    handleSearchChange = e => {
        const value = e.target.value;

        this.setState({
            searchValue: value
        });

        if (value === "" || value.length < 3) {
            this.setState({
                players: [],
                showRemoveIcon: false
            });
        } else {
            this.setState({
                showRemoveIcon: true
            });

            Client.player_search(value, players => {
                this.setState({
                    players: players.slice(0, MATCHING_PLAYER_LIMIT)
                });
            });
        }
    };

    handleSearchCancel = () => {
        this.setState({
            players: [],
            showRemoveIcon: false,
            searchValue: ""
        });
    };

    render() {
        const {showRemoveIcon, players} = this.state;
        const removeIconStyle = showRemoveIcon ? {} : {visibility: "hidden"};

        const playerRows = players.map((player, idx) => (
            <tr key={idx}>
                <td className="right aligned">{player.name}</td>
                <td className="right aligned">{player.date_of_birth}</td>
                <td className="right aligned">{player.position}</td>
                <td className="right aligned">{player.height}</td>
            </tr>
        ));

        return (
            <div id="player-search">
                <table className="ui selectable structured large table">
                    <thead>
                    <tr>
                        <th colSpan="5">
                            <div className="ui fluid search">
                                <div className="ui icon input">
                                    <input
                                        className="prompt"
                                        type="text"
                                        placeholder="Search players..."
                                        value={this.state.searchValue}
                                        onChange={this.handleSearchChange}
                                    />
                                    <i className="search icon"/>
                                </div>
                                <i
                                    className="remove icon"
                                    onClick={this.handleSearchCancel}
                                    style={removeIconStyle}
                                />
                            </div>
                        </th>
                    </tr>
                    <tr>
                        <th>Name</th>
                        <th>Date of Birth</th>
                        <th>Position</th>
                        <th>Height (cm)</th>
                    </tr>
                    </thead>
                    <tbody>
                    {playerRows}
                    </tbody>
                </table>
            </div>
        );
    }
}

export default PlayerSearch;