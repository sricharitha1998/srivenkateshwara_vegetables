import React, { useEffect, useState } from "react";
import MetisMenu from "metismenujs";
import { Link, useLocation } from "react-router-dom";
import { withTranslation } from "react-i18next";
import { connect } from "react-redux";

const SidebarContent = ({ t }) => {
  const location = useLocation();
  const [pathName, setPathName] = useState(location.pathname);
  const user = JSON.parse(localStorage.getItem("user"))?.user;
  useEffect(() => {
    setPathName(location.pathname);
    initMenu();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  const initMenu = () => {
    new MetisMenu("#side-menu");

    const ul = document.getElementById("side-menu");
    const items = ul.getElementsByTagName("a");

    for (let i = 0; i < items.length; ++i) {
      if (pathName === items[i].pathname) {
        activateParentDropdown(items[i]);
        break;
      }
    }
  };

  const activateParentDropdown = (item) => {
    item.classList.add("active");
    const parent = item.parentElement;

    if (parent) {
      parent.classList.add("mm-active");
      const parent2 = parent.parentElement;

      if (parent2) {
        parent2.classList.add("mm-show");

        const parent3 = parent2.parentElement;

        if (parent3) {
          parent3.classList.add("mm-active");
          if (parent3.childNodes[0])
            parent3.childNodes[0].classList.add("mm-active");

          const parent4 = parent3.parentElement;
          if (parent4) parent4.classList.add("mm-active");
        }
      }
    }
  };

  return (
    <React.Fragment>
      <div id="sidebar-menu">
        <ul className="metismenu list-unstyled" id="side-menu">
          <li className="menu-title">{t("Menu")}</li>

          <li>
            <Link to="/dashboard" className="waves-effect">
              <i className="ri-dashboard-line"></i>
              <span className="ms-1">{t("Dashboard")}</span>
            </Link>
          </li>

          {(user?.is_superadmin ||
            user?.permissions?.can_view_product) && (
            <li>
              <Link to="/#" className="has-arrow waves-effect">
                <i className="ri-folder-3-line"></i>
                <span className="ms-1">Category</span>
              </Link>
              <ul className="sub-menu">
                {(user?.is_superadmin ||
                  user?.permissions?.can_add_product) && (
                  <li>
                    <Link to="/add-category">Add</Link>
                  </li>
                )}
                  <li>
                    <Link to="/list-category">List</Link>
                  </li>
              </ul>
            </li>
          )}

          {(user?.is_superadmin ||
            user?.permissions?.can_view_subcategory) && (
            <li>
              <Link to="/#" className="has-arrow waves-effect">
                <i className="ri-folders-line"></i>
                <span className="ms-1">Sub Category</span>
              </Link>
              <ul className="sub-menu">
                {(user?.is_superadmin ||
                  user?.permissions?.can_add_subcategory) && (
                  <li>
                    <Link to="/add-sub-category">Add</Link>
                  </li>
                )}
                  <li>
                    <Link to="/list-sub-category">List</Link>
                  </li>
              </ul>
            </li>
          )}

          {user?.is_superadmin && (
            <li>
              <Link to="/#" className="has-arrow waves-effect">
                <i className="ri-user-settings-line"></i>
                <span className="ms-1">Employee</span>
              </Link>
              <ul className="sub-menu">
                <li>
                  <Link to="/add-employee">Add</Link>
                </li>
                <li>
                  <Link to="/list-employees">List</Link>
                </li>
              </ul>
            </li>
          )}

          {(user?.is_superadmin ||
            user?.permissions?.can_view_product) && (
            <li>
              <Link to="/#" className="has-arrow waves-effect">
                <i className="ri-shopping-bag-3-line"></i>
                <span className="ms-1">Product</span>
              </Link>
              <ul className="sub-menu">
                {(user?.is_superadmin ||
                  user?.permissions?.can_add_product) && (
                  <li>
                    <Link to="/add-products">Add</Link>
                  </li>
                )}
                  <li>
                    <Link to="/list-products">List</Link>
                  </li>
              </ul>
            </li>
          )}
          {(user?.is_superadmin ||
            user?.permissions?.can_manage_orders ||
            user?.permissions?.can_manage_delivery_status) && (
            <li>
              <Link to="/list-orders" className="waves-effect">
                <i className="ri-file-list-3-line"></i>
                <span className="ms-1">Orders</span>
              </Link>
            </li>
          )}

          {(user?.is_superadmin || user?.permissions?.can_view_users) && (
            <li>
              <Link to="/list-users" className="waves-effect">
                <i className="ri-team-line"></i>
                <span className="ms-1">Users</span>
              </Link>
            </li>
          )}
          <li>
            <Link to="/payments" className="waves-effect">
              <i className="ri-wallet-line"></i>
              <span className="ms-1">{t("Payments")}</span>
            </Link>
          </li>
        </ul>
      </div>
    </React.Fragment>
  );
};

export default connect()(withTranslation()(SidebarContent));
