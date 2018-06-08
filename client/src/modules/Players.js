import React, {Component} from "react";
import {
    Button,
    Col,
    Container,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Input,
    InputGroup,
    Row,
    Table,
    UncontrolledDropdown
} from "reactstrap";
import PlayerModal from "../components/PlayerModal";
import Client from "../Client";
import ToggleDisplay from "react-toggle-display";

const DEFAULT_POSITION = "Any Position";
const MATCHING_PLAYER_LIMIT = 25;

const POSITIONS = [DEFAULT_POSITION, "Defender", "Midfielder", "Attacker"];

class Players extends Component {

    handleTextChange = (event) => {
        this.setState({
            searchText: event.target.value
        });
    };
    handleSearch = () => {
        const player_name = this.state.searchText;
        const position = this.state.position;

        if (player_name === this.state.activeSearchText && position === this.state.activeSearchPosition) {
            return;
        }

        if (player_name.length > 3) {
            this.setState({
                displaySearchMessage: false,
                displayPlayers: true,
                isPlayerSearching: true
            });

            Client.player_search(player_name, position === DEFAULT_POSITION ? "" : position, players => {
                this.setState({
                    activeSearchText: player_name,
                    activeSearchPosition: position,
                    players: players.slice(0, MATCHING_PLAYER_LIMIT),
                    isPlayerSearching: false
                });
            });
        } else {
            this.setState({
                displaySearchMessage: true
            });
        }
    };
    _handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            this.handleSearch();
        }
    };
    setActivePlayer = (player) => {
        this.setState({
            activePlayer: player
        })
    };
    selectPosition = (event) => {
        this.setState({
            position: event.target.value
        });
    };

    constructor() {
        super();

        this.state = {
            activeSearchText: "",
            activeSearchPosition: "",
            displaySearchMessage: false,
            searchText: "",
            displayPlayers: false,
            players: [],
            isPlayerSearching: false,
            position: DEFAULT_POSITION,
        };
    }

    render() {
        const {players, activePlayer} = this.state;

        const playerRows = players.map((player, idx) => (
            <tr key={idx}>
                <td className="right aligned">{player.player_name}</td>
                <td className="right aligned">{player.player_nickname}</td>
                <td className="right aligned">{player.player_nationality}</td>
                <td className="right aligned">{player.position}</td>
                <td className="right aligned">{player.player_birthdate}</td>
                <td className="right aligned">{player.player_height}</td>
                <td className="right aligned">{player.player_weight}</td>
                <td>
                    <Button onClick={() => this.setActivePlayer(player)}>View Stats</Button>
                </td>
            </tr>
        ));

        const showNoResultMessage = playerRows.length === 0 && this.state.displayPlayers && !this.state.isPlayerSearching;
        const showSearchTable = this.state.displayPlayers && !showNoResultMessage;

        const dropdownItems = POSITIONS.map(pos =>
            (<DropdownItem onClick={this.selectPosition} value={pos}>{pos}</DropdownItem>)
        );

        return (
            <Container>
                <Row>
                    <Col>
                        <InputGroup>
                            <Input onKeyPress={this._handleKeyPress} onChange={this.handleTextChange}
                                   placeholder="Enter player name..."/>
                            <UncontrolledDropdown>
                                <DropdownToggle caret>
                                    {this.state.position}
                                </DropdownToggle>
                                <DropdownMenu>
                                    {dropdownItems}
                                </DropdownMenu>
                            </UncontrolledDropdown>
                            <Button onClick={this.handleSearch}>Search</Button>
                        </InputGroup>
                        <ToggleDisplay show={this.state.displaySearchMessage}>
                            Searches must be greater than 3 characters.
                        </ToggleDisplay>
                        <ToggleDisplay show={showNoResultMessage}>
                            <h4>No results found for "{this.state.activeSearchText}"
                                ({this.state.activeSearchPosition})</h4>
                        </ToggleDisplay>
                        <ToggleDisplay show={this.state.isPlayerSearching}>
                            <h5>Searching for "{this.state.searchText}"...</h5>
                        </ToggleDisplay>
                        <ToggleDisplay show={showSearchTable}>
                            <Table>
                                <thead>
                                <tr>
                                    <th>Full Name</th>
                                    <th>Short Name</th>
                                    <th>Nationality</th>
                                    <th>Position</th>
                                    <th>Birthdate</th>
                                    <th>Height (cm)</th>
                                    <th>Weight (kg)</th>
                                </tr>
                                </thead>
                                <tbody>
                                {playerRows}
                                </tbody>
                            </Table>
                        </ToggleDisplay>
                        <PlayerModal player={activePlayer} handler={() => this.setActivePlayer(null)}/>
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default Players;