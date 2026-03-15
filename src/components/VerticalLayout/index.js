import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";

import {
  changeLayout,
  changeSidebarTheme,
  changeSidebarType,
  toggleRightSidebar,
  changeTopbarTheme,
  changeLayoutTheme,
  changeLayoutWidth
} from "../../store/actions";

// Layout Related Components
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import Rightbar from "../CommonForBoth/Rightbar";
import withRouter from "../Common/withRouter";

function Layout({ children, router }) {
  const dispatch = useDispatch();
  const {
    leftSideBarTheme,
    leftSideBarType,
    layoutWidth,
    topbarTheme,
    theme,
    isPreloader,
    showRightSidebar
  } = useSelector((state) => state.Layout);

  const [isMobile] = useState(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));

  const toggleRightSidebarHandler = useCallback(() => {
    dispatch(toggleRightSidebar());
  }, [dispatch]);

  const toggleMenuCallback = useCallback(() => {
    if (leftSideBarType === "default") {
      dispatch(changeSidebarType("condensed", isMobile));
    } else if (leftSideBarType === "condensed") {
      dispatch(changeSidebarType("default", isMobile));
    }
  }, [dispatch, leftSideBarType, isMobile]);

  const capitalizeFirstLetter = (string) => {
    return string.charAt(1).toUpperCase() + string.slice(2);
  };

  useEffect(() => {
    if (isPreloader) {
      document.getElementById("preloader")?.style.setProperty("display", "block");
      document.getElementById("status")?.style.setProperty("display", "block");

      setTimeout(() => {
        document.getElementById("preloader")?.style.setProperty("display", "none");
        document.getElementById("status")?.style.setProperty("display", "none");
      }, 2500);
    } else {
      document.getElementById("preloader")?.style.setProperty("display", "none");
      document.getElementById("status")?.style.setProperty("display", "none");
    }
  }, [isPreloader]);

  useEffect(() => {
    window.scrollTo(0, 0);
    let currentage = capitalizeFirstLetter(router.location.pathname);
    currentage = currentage.replaceAll("-", " ");
    document.title = `${currentage} | Nazox - Responsive Bootstrap 5 Admin Dashboard`;

    if (leftSideBarTheme) dispatch(changeSidebarTheme(leftSideBarTheme));
    if (layoutWidth) dispatch(changeLayoutWidth(layoutWidth));
    if (leftSideBarType) dispatch(changeSidebarType(leftSideBarType));
    if (topbarTheme) dispatch(changeTopbarTheme(topbarTheme));
    if (theme) dispatch(changeLayoutTheme(theme));
    if (showRightSidebar) toggleRightSidebarHandler();
  }, [
    router.location.pathname,
    leftSideBarTheme,
    layoutWidth,
    leftSideBarType,
    topbarTheme,
    theme,
    showRightSidebar,
    dispatch,
    toggleRightSidebarHandler
  ]);

  return (
    <React.Fragment>
      {/* 
      <div id="preloader">
        <div id="status">
          <div className="spinner">
            <i className="ri-loader-line spin-icon"></i>
          </div>
        </div>
      </div> 
      */}
      <div id="layout-wrapper">
        <Header toggleMenuCallback={toggleMenuCallback} toggleRightSidebar={toggleRightSidebarHandler} />
        <Sidebar theme={leftSideBarTheme} type={leftSideBarType} isMobile={isMobile} />
        <div className="main-content">
          {children}
          <Footer />
        </div>
      </div>
      <Rightbar />
    </React.Fragment>
  );
}

export default withRouter(Layout);
