import React, { useEffect, useState } from "react";
import { connect } from "react-redux";

import {
  changeLayout,
  changeTopbarTheme,
  changeLayoutTheme,
  toggleRightSidebar,
  changeLayoutWidth,
} from "../../store/actions";

import Navbar from "./Navbar";
import Header from "./Header";
import Footer from "./Footer";
import Rightbar from "../CommonForBoth/Rightbar";
import withRouter from "../Common/withRouter";

const Layout = (props) => {
  const [isMenuOpened, setIsMenuOpened] = useState(false);

  const openMenu = () => {
    setIsMenuOpened((prev) => !prev);
  };

  const toggleRightSidebarHandler = () => {
    props.toggleRightSidebar();
  };

  useEffect(() => {
    // Scroll to top
    window.scrollTo(0, 0);

    let title = props.router.location.pathname;
    let currentage = title.charAt(1).toUpperCase() + title.slice(2);
    currentage = currentage.replaceAll("-", " ");

    document.title =
      currentage + " | Nazox - Responsive Bootstrap 5 Admin Dashboard";

    props.changeLayout("horizontal");

    if (props.topbarTheme) {
      props.changeTopbarTheme(props.topbarTheme);
    }
    if (props.theme) {
      props.changeLayoutTheme(props.theme);
    }
    if (props.layoutWidth) {
      props.changeLayoutWidth(props.layoutWidth);
    }
    if (props.showRightSidebar) {
      toggleRightSidebarHandler();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (props.isPreloader) {
      document.getElementById("preloader").style.display = "block";
      document.getElementById("status").style.display = "block";

      setTimeout(() => {
        document.getElementById("preloader").style.display = "none";
        document.getElementById("status").style.display = "none";
      }, 2500);
    } else {
      document.getElementById("preloader").style.display = "none";
      document.getElementById("status").style.display = "none";
    }
  }, [props]);

  return (
    <React.Fragment>
      {/* <div id="preloader">
        <div id="status">
          <div className="spinner">
            <i className="ri-loader-line spin-icon"></i>
          </div>
        </div>
      </div> */}

      <div id="layout-wrapper">
        <Header
          theme={props.topbarTheme}
          isMenuOpened={isMenuOpened}
          toggleRightSidebar={toggleRightSidebarHandler}
          openLeftMenuCallBack={openMenu}
        />
        <Navbar menuOpen={isMenuOpened} />
        <div className="main-content">
          {props.children}
          <Footer />
        </div>
      </div>
      <Rightbar />
    </React.Fragment>
  );
};

const mapStateToProps = (state) => ({
  ...state.Layout,
});

export default connect(mapStateToProps, {
  changeTopbarTheme,
  changeLayoutTheme,
  toggleRightSidebar,
  changeLayout,
  changeLayoutWidth,
})(withRouter(Layout));
