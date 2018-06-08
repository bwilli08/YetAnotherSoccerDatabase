import React, {Component} from "react";
import {Alert, Button, Container, DropdownItem} from "reactstrap";
import Select from "react-virtualized-select";
import Client from "../Client";

const MIN = "MIN";
const MAX = "MAX";

const REQUIRED_PLAYERS = 11;

const POSITION_LIMITS = {
    "Goalkeeper": {
        MIN: 1,
        MAX: 1
    },
    "Defender": {
        MIN: 3,
        MAX: 5
    },
    "Midfielder": {
        MIN: 2,
        MAX: 6
    },
    "Attacker": {
        MIN: 1,
        MAX: 3
    }
};

export default class LineupPicker extends Component {
    updateState = (newState) => {
        this.setState(newState, () => {
            const {selectedPlayers} = this.state;

            let isValidLineup = false;
            if (selectedPlayers.length === REQUIRED_PLAYERS) {
                isValidLineup = true;

                Object.keys(POSITION_LIMITS).forEach((key) => {
                    const minimum = POSITION_LIMITS[key][MIN];

                    isValidLineup &= (selectedPlayers.filter(player => player.position === key).length >= minimum);
                });
            }

            this.setState({
                isValidLineup: isValidLineup
            }, () => {
                const {callback} = this.props;
                const {isValidLineup, selectedClub, selectedPlayers} = this.state;

                const club_id = selectedClub === null ? null : selectedClub.id;
                const player_ids = selectedPlayers.map(player => player.id);

                callback(isValidLineup, club_id, player_ids);
            })
        })
    };
    selectOption = (selectedOption, selectFunc) => {
        const {activeSeason} = this.props;

        this.updateState({
            selectedClub: selectedOption,
            selectedPlayers: []
        });

        if (selectedOption !== null) {
            Client.season_lineup(activeSeason.id, selectedOption.id, (result) => this.setState({
                availablePlayers: result
            }));

            selectFunc(selectedOption);
        }
    };
    filterOption = (option, inputString) => {
        return option.name.toLowerCase().includes(inputString.toLowerCase());
    };
    renderOption = ({key, style, option, selectValue}) => {
        const {name} = option;

        return (
            <DropdownItem toggle={false} key={key} style={style} onClick={() => this.selectOption(option, selectValue)}>
                {name}
            </DropdownItem>
        );
    };
    togglePlayer = (player) => {
        const {selectedPlayers} = this.state;
        const isSelectedPlayer = selectedPlayers.includes(player);

        let newSelectedPlayers;
        if (isSelectedPlayer) {
            newSelectedPlayers = selectedPlayers.filter(item => item !== player);
        } else {
            newSelectedPlayers = selectedPlayers.concat([player]);
        }

        this.updateState({
            selectedPlayers: newSelectedPlayers
        });
    };
    getButtonForPlayer = (player) => {
        const {selectedPlayers} = this.state;

        const isSelectedPlayer = selectedPlayers.includes(player);
        const buttonColor = isSelectedPlayer ? "danger" : "success";
        const buttonText = isSelectedPlayer ? "Unselect" : "Select";

        let disabled = false;
        if (selectedPlayers.length >= REQUIRED_PLAYERS) {
            disabled = !isSelectedPlayer;
        } else if (selectedPlayers.filter(item => item.position === player.position).length >= POSITION_LIMITS[player.position][MAX]) {
            disabled = !isSelectedPlayer;
        }

        return (
            <Button color={buttonColor}
                    disabled={disabled}
                    onClick={() => this.togglePlayer(player)}
                    size="sm">
                {buttonText}
            </Button>
        );
    };
    playerItem = (player, idx) => {
        return (
            <tr key={idx}>
                <td className="right aligned">{player.nickname}</td>
                <td className="right aligned">{player.nationality}</td>
                <td className="right aligned">{player.position}</td>
                <td>
                    {this.getButtonForPlayer(player)}
                </td>
            </tr>
        );
    };
    isValidLineupMessage = () => {
        const {selectedPlayers} = this.state;

        if (selectedPlayers.length === REQUIRED_PLAYERS) {
            const invalid_positions = [];

            Object.keys(POSITION_LIMITS).forEach((key) => {
                const minimum = POSITION_LIMITS[key][MIN];

                if (selectedPlayers.filter(player => player.position === key).length < minimum) {
                    invalid_positions.push([key, minimum]);
                }
            });

            return invalid_positions.map(entry => (
                <Alert color="warning">
                    You must include at least {entry[1]} {entry[0]}(s).
                </Alert>
            ));
        }

        return [];
    };

    constructor(props) {
        super(props);

        this.state = {
            selectedClub: null,
            availablePlayers: [],
            selectedPlayers: [],
            isValidLineup: false
        };
    }

    componentWillReceiveProps(nextProps) {
        const {clubs} = nextProps;

        if (clubs !== this.props.clubs) {
            this.updateState({
                selectedClub: null,
                availablePlayers: [],
                selectedPlayers: []
            });
        }
    }

    render() {
        const {placeholder, clubs} = this.props;
        const {selectedClub, availablePlayers, selectedPlayers} = this.state;

        if (selectedClub === null) {
            return (
                <Select
                    placeholder={placeholder}
                    optionRenderer={this.renderOption}
                    filterOption={this.filterOption}
                    options={clubs}
                />
            );
        }

        const player_rows = availablePlayers.map((player, idx) => this.playerItem(player, idx));
        const isValidLineupMessage = this.isValidLineupMessage();
        const style = selectedPlayers.length === REQUIRED_PLAYERS && isValidLineupMessage.length === 0
            ? {backgroundColor: "#b3ffcb"}
            : {};

        return (
            <Container fluid>
                <Container fluid>
                    <Select
                        placeholder="Pick a different team."
                        optionRenderer={this.renderOption}
                        filterOption={this.filterOption}
                        options={clubs}
                    />
                    <strong>{selectedClub.name}</strong>
                </Container>
                <Container fluid style={style}>
                    Selected Players: {selectedPlayers.length}/11
                    <br/>
                    <small>Requirements: 1 GK, 3-5 DEF, 2-6 MID, 1-3 ATT.</small>
                    {isValidLineupMessage}
                    <table className="table table-bordered table-striped table-sm" style={{backgroundColor: "#FFFFFF"}}>
                        <thead>
                        <tr>
                            <th>Name</th>
                            <th>Nation</th>
                            <th>Position</th>
                            <th>Select</th>
                        </tr>
                        </thead>
                        <tbody>
                        {player_rows}
                        </tbody>
                    </table>
                    <Button color="danger" size="sm" onClick={() => this.setState({selectedPlayers: []})}>
                        Reset Lineup
                    </Button>
                </Container>
            </Container>
        );
    }
}
