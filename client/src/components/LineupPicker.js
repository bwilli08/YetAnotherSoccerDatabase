import React, {Component} from "react";
import {DropdownItem} from "reactstrap";
import Select from "react-virtualized-select";
import {clubs} from "../util/ClubFunctions";
import Client from "../Client";

export default class LineupPicker extends Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedClub: null,
            availablePlayers: [],
            selectedLineup: []
        };
    }

    selectOption = (selectedOption, selectFunc) => {
        this.setState({
            selectedClub: selectedOption,
            selectedLineup: []
        }, () => Client.season_lineup(13, selectedOption.id, (result) => this.setState({
            availablePlayers: result
        }, () => selectFunc(selectedOption))));
    };

    filterOption = (option, inputString) => {
        return option.name.toLowerCase().includes(inputString.toLowerCase());
    };

    renderOption = ({key, style, option, selectValue}) => {
        const {name} = option;

        return (
            <DropdownItem id={key} style={style} onClick={() => this.selectOption(option, selectValue)}>
                {name}
            </DropdownItem>
        );
    };

    render() {
        const {placeholder} = this.props;
        const {selectedClub} = this.state;

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

        return (
            <Container>

            </Container>
        );
    }
}
