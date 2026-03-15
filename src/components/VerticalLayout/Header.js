import React, { useState, useCallback,useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Row,
  Col,
  Form,
  FormGroup,
  InputGroup,
  Input,
  Button,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
} from "reactstrap";

import { Link } from "react-router-dom";
import { withTranslation } from "react-i18next";

// Import components
import LanguageDropdown from "../CommonForBoth/TopbarDropdown/LanguageDropdown";
import NotificationDropdown from "../CommonForBoth/TopbarDropdown/NotificationDropdown";
import ProfileMenu from "../CommonForBoth/TopbarDropdown/ProfileMenu";
import MegaMenu from "./MegaMenu";

// Redux actions
import { toggleRightSidebar } from "../../store/actions";

// Import images
import logosmdark from "../../assets/images/logo-sm-dark.png";
import logodark from "../../assets/images/logo-dark.png";
import logosmlight from "../../assets/images/logo-sm-light.png";
import logolight from "../../assets/images/logo-light.png";

import github from "../../assets/images/brands/github.png";
import bitbucket from "../../assets/images/brands/bitbucket.png";
import dribbble from "../../assets/images/brands/dribbble.png";
import dropbox from "../../assets/images/brands/dropbox.png";
import mail_chimp from "../../assets/images/brands/mail_chimp.png";
import slack from "../../assets/images/brands/slack.png";

const Header = ({ t, toggleMenuCallback }) => {
  const dispatch = useDispatch();
  const layoutType = useSelector(state => state.Layout.layoutType);
  const navigate = useNavigate();

  const [isSearch, setIsSearch] = useState(false);
  const [isSocialPf, setIsSocialPf] = useState(false);

  const toggleMenu = useCallback(() => {
    toggleMenuCallback();
  }, [toggleMenuCallback]);

  const toggleRightbar = useCallback(() => {
    dispatch(toggleRightSidebar());
  }, [dispatch]);

  const toggleFullscreen = () => {
    if (
      !document.fullscreenElement &&
      !document.mozFullScreenElement &&
      !document.webkitFullscreenElement
    ) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      } else if (document.documentElement.mozRequestFullScreen) {
        document.documentElement.mozRequestFullScreen();
      } else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
      }
    } else {
      if (document.cancelFullScreen) {
        document.cancelFullScreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen();
      }
    }
  };

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      navigate("/"); // or your actual login route
    }
  }, []);

  return (
    <React.Fragment>
      <header id="page-topbar">
        <div className="navbar-header">
          <div className="d-flex">
            <div className="navbar-brand-box">
              <Link to="#" className="logo logo-dark">
                <span className="logo-sm" style={{"color": "white"}}>
                  E
                </span>
                <span className="logo-lg" style={{"color": "white"}}>
                Ecommerce
                </span>
              </Link>

              <Link to="#" className="logo logo-light">
                <span className="logo-sm" style={{"color": "white"}}>
                E
                </span>
                <span className="logo-lg" style={{"color": "white"}}>
                Ecommerce
                </span>
              </Link>
            </div>

            <Button size="sm" color="none" type="button" onClick={toggleMenu} className="px-3 font-size-24 header-item waves-effect" id="vertical-menu-btn">
              <i className="ri-menu-2-line align-middle"></i>
            </Button>

            <Form className="app-search d-none d-lg-block">
              <div className="position-relative">
                <Input type="text" className="form-control" placeholder={t("Search")} />
                <span className="ri-search-line"></span>
              </div>
            </Form>

            <MegaMenu />
          </div>

          <div className="d-flex">
          
            
            <ProfileMenu />

          </div>
        </div>
      </header>
    </React.Fragment>
  );
};

export default withTranslation()(Header);
