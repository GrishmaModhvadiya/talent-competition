import React from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';
import Cookies from 'js-cookie';
import LoggedInBanner from '../../Layout/Banner/LoggedInBanner.jsx';
import { LoggedInNavigation } from '../../Layout/LoggedInNavigation.jsx';
import { JobSummaryCard } from './JobSummaryCard.jsx';
import { BodyWrapper, loaderData } from '../../Layout/BodyWrapper.jsx';

import { Header, Pagination, Icon, Dropdown, Checkbox, Accordion, Form, Card, Label, Button, Grid, Divider } from 'semantic-ui-react';

export default class ManageJob extends React.Component {
    constructor(props) {
        super(props);

        let loader = loaderData
        loader.allowedUsers.push("Employer");
        loader.allowedUsers.push("Recruiter");
        //console.log(loader)
        this.state = {
            loadJobs: [],
            loaderData: loader,
            activePage: 1,
            sortBy: {
                date: "desc"
            },
            filter: {
                showActive: true,
                showClosed: false,
                showDraft: true,
                showExpired: true,
                showUnexpired: true
            },
            totalPages: 1,
            activeIndex: "",
            filterOptions: [
               {

                    text: 'Active',
                    value: 'Active',
                },
                {
                    text: 'Closed',
                    value: 'Closed',
                },
                {
                    text: 'Draft',
                    value: 'Draft',
                },
                {
                    text: 'Expired',
                    value: 'Expired',
                },
                {
                    text: 'Unexpired',
                    value: 'Unexpired',
                }
            ],
            dateSection: [
                {
                    text: 'Newest first',
                    value: 'desc',
                },
                {
                    text: 'Oldest first',
                    value: 'asc',
                }
            ]
        }
        this.loadData = this.loadData.bind(this);
        this.init = this.init.bind(this);
        this.loadNewData = this.loadNewData.bind(this);
        this.showExpiredJob = this.showExpiredJob.bind(this);
        this.filterOnChangeData = this.filterOnChangeData.bind(this);
        this.handleSortDate = this.handleSortDate.bind(this);
        this.handleActivePage = this.handleActivePage.bind(this);
        //your functions go here
    };

    init() {
        let loaderData = TalentUtil.deepCopy(this.state.loaderData)
        loaderData.isLoading = false;
        this.setState({ loaderData });//comment this

        //set loaderData.isLoading to false after getting data
        this.loadData(() =>
            this.setState({ loaderData })
        )

        //console.log(this.state.loaderData)
    }

    componentDidMount() {
        this.init();
    };

    loadData() {
        var link = 'http://localhost:51689/listing/listing/getSortedEmployerJobs';
        var cookies = Cookies.get('talentAuthToken');
        // your ajax call and other logic goes here
        $.ajax({
            url: link,
            headers: {
                'Authorization': 'Bearer ' + cookies,
                'Content-Type': 'application/json'
            },
            type: "GET",
            contentType: "application/json",
            dataType: "json",
            data: {
               
                showActive: this.state.filter.showActive,
                showClosed: this.state.filter.showClosed,
                showDraft: this.state.filter.showDraft,
                showExpired: this.state.filter.showExpired,
                showUnexpired: this.state.filter.showUnexpired,
                sortbyDate: this.state.sortBy.date,
                activePage: this.state.activePage
            },

            success: function (res) {
                let filterData = null;
                if (res.myJobs) {
                    filterData = res.myJobs
                    var totalPages = Math.ceil(res.totalCount / 6);
                    this.setState({ totalPages });

                }
                this.loadNewData(filterData)
            }.bind(this),
            error: function (res) {
                console.log(res.status)
            }
        })


    }

    loadNewData(data) {
        this.setState({
            loadJobs: data
        })
    }

    filterOnChangeData(e, item) {
        let filter = TalentUtil.deepCopy(this.state.filter);
        filter.showActive = false;
        filter.showClosed = false;
        filter.showDraft = false;
        filter.showExpired = false;
        filter.showUnexpired = false;

        if (item.value.length === 0) {
            filter.showActive = true;
            filter.showClosed = true;
            filter.showDraft = true;
            filter.showExpired = true;
            filter.showUnexpired = true;
        }
        if (item.value.includes('Active') ) {
            filter.showActive = true;
        }
        if (item.value.includes('Closed')) {
            filter.showClosed = true;
        }
         if (item.value.includes('Draft')) {
            filter.showDraft = true;
        }
         if(item.value.includes('Expired')) {
            filter.showExpired = true;
        }
         if (item.value.includes('Unexpired')){
            filter.showUnexpired = true;
        }
        var activePage = 1;
        this.setState({ filter: filter, activePage: activePage }, () => {
            this.loadData()
        });
    }

    showExpiredJob(j) {
        var date = new Date();
        var now_utc = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),
            date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
        var n = new Date(now_utc);
        if (moment(j.expiryDate) < n) {
            return true;

        }
        return false;
    }

    handleSortDate(s,item) {
        let sortBy = TalentUtil.deepCopy(this.state.sortBy);
        sortBy.date = item.value;

        this.setState({ sortBy }, () => {
            this.loadData()
        });
    }

    handleActivePage(e, { activePage }) {
        this.setState({ activePage }, () => {
            this.loadData()

        });
        
    }

    

    render() {

        return (
            <BodyWrapper reload={this.init} loaderData={this.state.loaderData}>
                <section className="page-body">
                    <div className="ui container">
                        <div className="ui container">
                            <Header
                                as='h1'
                                content='List of Jobs' />


                            <Icon name='filter' />Filter:
                            <Dropdown inline multiple options={this.state.filterOptions} onChange={this.filterOnChangeData} placeholder="Choose filter">

                            </Dropdown>
                            <Icon name='calendar' />Sort By Date:
                             <Dropdown inline options={this.state.dateSection} defaultValue={this.state.dateSection[0].value} onChange={this.handleSortDate}>

                            </Dropdown>
                        </div>
                        <div className="ui-container">
                            <Grid columns={2}>
                           
                                {
                                    this.state.loadJobs.map((job, i) => {
                                        return (
                                            <Grid.Column key={job.id}>
                                            <Card fluid >
                                                
                                                <Card.Content>
                                                    <Card.Header>{job.title}</Card.Header>
                                                    <Label as='a' color='black' ribbon='right'>
                                                        <Icon name='user' />{job.noOfSuggestions}
                                                    </Label>
                                                    <Card.Meta>{job.location.country},{job.location.city}</Card.Meta>
                                                    <Card.Description>{job.summary}</Card.Description>
                                                </Card.Content>
                                                    <Card.Content extra>
                                                        <Button color='red' style={{ visibility: this.showExpiredJob(job) ? 'visible' : 'hidden' }} > Expired</Button>

                                                        <Button.Group floated='right'>
                                                            <Button basic color='blue'><Icon name='ban' />Close</Button>
                                                            <Button basic color='blue'><Icon name='edit outline' />Edit</Button>
                                                            <Button basic color='blue'><Icon name='copy outline' />Copy</Button>
                                                    </Button.Group>
                                                    
                                                    </Card.Content>
                                                
                                                </Card>
                                            </Grid.Column>
                                            

                                        )

                                    })
                                }
                            </Grid>
                        </div>
                        <Divider hidden/>
                        
                        <div className="ui container center aligned ">
                            <Pagination activePage={this.state.activePage} totalPages={this.state.totalPages} onPageChange={this.handleActivePage} />
                        </div>
                    </div>
                </section>
            </BodyWrapper>
        )
    }
}