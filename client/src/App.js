import React, { Component } from "react";
import PlayerSearch from "./PlayerSearch";

class App extends Component {
    render() {
        return (
            <div className="App">
                <div className="ui text container">
                    <PlayerSearch/>
                </div>
            </div>
        );
    }
}

export default App;