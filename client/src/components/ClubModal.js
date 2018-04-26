import React, {Component} from "react";
import Client from "../Client";
import {
    TabContent,
    TabPane,
    NavLink,
    Nav,
    NavItem,
    Button,
    Modal,
    ModalBody,
    ModalHeader,
    ModalFooter,
    Table
} from "reactstrap";
import "react-select/dist/react-select.css";

export default class ClubModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isOpen: false,
            seasons: []
        };
    }

    componentWillReceiveProps(nextProps) {
        const {club} = nextProps;

        if (club) {
            Client.club_seasons(club.club_id, seasons => {
                this.setState({
                    isOpen: true,
                    seasons: seasons
                });
            });
        }
    }

    closeModal = () => {
        this.setState({
            isOpen: false,
            seasons: []
        });
        this.props.handler(false);
    };

    getHeaderText = () => {
        const {club} = this.props;

        if (club) {
            return `${club.club_name} (${club.country_name})`;
        }
        return "";
    };

    render() {
        const {club} = this.props;
        const {seasons} = this.state;

        if (!club) {
            return "";
        }

        const header = this.getHeaderText();

        const seasonRows = seasons.map((season, idx) => (
            <tr key={idx}>
                <td>{season.name}</td>
                <td>{season.year}</td>
                <td>{season.win_total}-{season.draw_total}-{season.lost_total}</td>
                <td>{season.win_home}-{season.draw_home}-{season.lost_home}</td>
                <td>{season.win_away}-{season.draw_away}-{season.lost_away}</td>
                <td>{season.goals_for_total}-{season.goals_against_total}</td>
                <td>{season.goals_for_home}-{season.goals_against_home}</td>
                <td>{season.goals_for_away}-{season.goals_against_away}</td>
            </tr>
        ));

        return (
            <Modal isOpen={this.state.isOpen} toggle={this.closeModal} size="lg">
                <ModalHeader toggle={this.closeModal}>{header}</ModalHeader>
                <ModalBody>
                    <table className="table table-bordered table-striped table-sm">
                        <thead>
                        <tr>
                            <th>Comp</th>
                            <th>Season</th>
                            <th>Record</th>
                            <th>H. Record</th>
                            <th>A. Record</th>
                            <th>GD</th>
                            <th>H. GD</th>
                            <th>A. GD</th>
                        </tr>
                        </thead>
                        <tbody>
                        {seasonRows}
                        </tbody>
                    </table>
                </ModalBody>
                <ModalFooter>
                    <Button color="danger" onClick={this.closeModal}>Close</Button>
                </ModalFooter>
            </Modal>
        );
    }
}
