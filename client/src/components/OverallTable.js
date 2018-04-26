import React, {Component} from "react";
import Client from "../Client";
import {DropdownItem, DropdownMenu, DropdownToggle, Container, Row, Col, UncontrolledDropdown} from "reactstrap";
import {BootstrapTable, TableHeaderColumn} from "react-bootstrap-table";
import "../../node_modules/react-bootstrap-table/dist/react-bootstrap-table-all.min.css";

const STATS = [
    'goals',
    'assists',
    'shots_on_goal',
    'shots_total',
    'fouls_committed',
    'fouls_drawn',
    'interceptions',
    'saves',
    'clearances',
    'tackles',
    'offsides',
    'blocks',
    'yellow_cards',
    'red_cards',
    'passes',
    'crosses'
];

const YEARS = [
    '2017/2018',
    '2016/2017',
    '2015/2016',
    '2014/2015',
    '2013/2014',
    '2012/2013',
    '2011/2012',
    '2010/2011',
    '2009/2010',
    '2008/2009',
    '2007/2008',
    '2006/2007',
    '2005/2006'
];

export default class OverallTable extends Component {

    constructor(props) {
        super(props);

        this.state = {
            stat: STATS[0],
            year: YEARS[0],
            playerStats: []
        }
    }

    componentDidMount() {
        this.updateStats();
    }

    updateStats = () => {
        const {stat, year} = this.state;

        this.setState({
            playerStats: [],
        }, () => Client.player_graph_data(stat, year, res => {
            this.setState({
                playerStats: res
            })
        }))
    };

    selectStat = (stat) => {
        this.setState({stat}, this.updateStats)
    };

    selectYear = (year) => {
        this.setState({year}, this.updateStats)
    };

    render() {
        const {stat, year, playerStats} = this.state;

        const statItems = STATS.map(stat =>
            (<DropdownItem onClick={() => this.selectStat(stat)} value={stat}>{stat}</DropdownItem>)
        );

        const yearItems = YEARS.map(year =>
            (<DropdownItem onClick={() => this.selectYear(year)} value={year}>{year}</DropdownItem>)
        );

        const options = {
            noDataText: "Loading player data..."
        };

        return (
            <Container fluid>
                <Row style={{paddingBottom: "1rem"}}>
                    <Col>
                        <UncontrolledDropdown>
                            <DropdownToggle caret>
                                Player Stat: {stat}
                            </DropdownToggle>
                            <DropdownMenu>
                                {statItems}
                            </DropdownMenu>
                        </UncontrolledDropdown>
                    </Col>
                    <Col>
                        <UncontrolledDropdown>
                            <DropdownToggle caret>
                                Season: {year}
                            </DropdownToggle>
                            <DropdownMenu>
                                {yearItems}
                            </DropdownMenu>
                        </UncontrolledDropdown>
                    </Col>
                </Row>
                <BootstrapTable data={playerStats} options={options} search striped pagination>
                    <TableHeaderColumn isKey dataField='player_id' hidden>Player ID</TableHeaderColumn>
                    <TableHeaderColumn dataField='name'>Player Name</TableHeaderColumn>
                    <TableHeaderColumn dataField='total'>{stat}</TableHeaderColumn>
                </BootstrapTable>
            </Container>
        );
    };
}