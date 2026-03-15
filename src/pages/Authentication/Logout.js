import React, { Component } from 'react';
// import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import { logoutUser } from '../../store/actions';
import withRouter from '../../components/Common/withRouter';

class Logout extends Component {

    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {

        // Fire Action for Remove all Item from localstorage and redirect to login page
        setTimeout(() => {
            this.props.logoutUser(this.props.router.navigate);
        }, [100]);
    }

    render() {
        return (
            <React.Fragment>
                <h1>&nbsp;</h1>
            </React.Fragment>
        );
    }
}

export default withRouter(connect(null, { logoutUser })(Logout));

