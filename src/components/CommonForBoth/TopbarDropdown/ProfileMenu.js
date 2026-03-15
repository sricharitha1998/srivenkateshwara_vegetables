import React, { useState } from 'react';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';

// i18n
import { withTranslation } from "react-i18next";

// users
import avatar2 from '../../../assets/images/users/avatar-2.jpg';
import { useNavigate } from 'react-router-dom';

const ProfileMenu = ({ t }) => {
  const [menu, setMenu] = useState(false);
const navigate = useNavigate();
  const toggle = () => setMenu(prev => !prev);

  let username = "Admin";
  const authUser = localStorage.getItem("authUser");

  if (authUser) {
    const obj = JSON.parse(authUser);
    const uNm = obj.email.split("@")[0];
    username = uNm.charAt(0).toUpperCase() + uNm.slice(1);
  }

  return (
    <Dropdown isOpen={menu} toggle={toggle} className="d-inline-block user-dropdown">
      <DropdownToggle tag="button" className="btn header-item waves-effect" id="page-header-user-dropdown">
        <img className="rounded-circle header-profile-user me-1" src={avatar2} alt="Header Avatar" />
        <span className="d-none d-xl-inline-block ms-1 text-transform">{username}</span>
        <i className="mdi mdi-chevron-down d-none ms-1 d-xl-inline-block"></i>
      </DropdownToggle>
      <DropdownMenu className="dropdown-menu-end">
        
        <DropdownItem className="text-danger" onClick={() => {
            localStorage.removeItem("user");
            navigate("/")
        }}>
          <i className="ri-shut-down-line align-middle me-1 text-danger"></i> {t('Logout')}
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

export default withTranslation()(ProfileMenu);
