import React from "react";
import { connect } from "react-redux";

// Simple bar
import SimpleBar from "simplebar-react";

import SidebarContent from "./SidebarContent";
import withRouter from "../Common/withRouter";

const Sidebar = (props) => {
    return (
        <div className="vertical-menu">
            <div data-simplebar className="h-100">
                {props.type !== "condensed" ? (
                    <SimpleBar style={{ maxHeight: "100%" }}>
                        <SidebarContent />
                    </SimpleBar>
                ) : (
                    <SidebarContent />
                )}
            </div>
        </div>
    );
};

const mapStateToProps = (state) => ({
    layout: state.Layout
});

export default connect(mapStateToProps, {})(withRouter(Sidebar));
