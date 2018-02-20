import React, {Component} from "react";
import PlayerSearch from "../PlayerSearch";

class Players extends Component {
    state = {
        player: ""
    };

    render() {
        return (
            <div>
                <PlayerSearch/>
            </div>
        );
    }
}

export default Players;