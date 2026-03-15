import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  CardBody,
  CardTitle,
  Col,
  Container,
  Input,
  Label,
  Row,
  Form,
} from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

const AddEmployee = () => {
  const breadcrumbItems = [
    { title: "Employee", link: "#" },
    { title: "Add Employee", link: "#" },
  ];

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    password: "",
    address: "",
    permissions: {
      products: [],
      categories: [],
      orders: [],
      subcategories: [],
      payments: [],
      endusers: []
    },
  });

  const [showPassword, setShowPassword] = useState(false);

  const [hasRefreshToken, setHasRefreshToken] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.refresh) {
      setHasRefreshToken(true);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "mobile" && value && !/^\d*$/.test(value)) return;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePermissionChange = (module, action) => {
    setFormData((prev) => {
      const updated = [...prev.permissions[module]];
      const index = updated.indexOf(action);
      if (index >= 0) updated.splice(index, 1);
      else updated.push(action);
      return {
        ...prev,
        permissions: { ...prev.permissions, [module]: updated },
      };
    });
  };

  const mapPermissions = (module, actions) => {
    return actions.reduce((acc, action) => {
      const key = `can_${action.replace(/\s+/g, "_")}_${module}`;
      acc[key] = formData.permissions[module].includes(action);
      return acc;
    }, {});
  };

  const getUpdatedTokens = async (refreshToken) => {
    const response = await fetch("https://admin.veggafresh.com/be/api/v1/token/refresh/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) throw new Error("Session expired. Please login again.");
    const data = await response.json();
    return data?.data;
  };

  const sendRequest = (accessToken, requestBody) => {
    return fetch("https://admin.veggafresh.com/be/api/v1/employees/create/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userData = JSON.parse(localStorage.getItem("user"));
    const accessToken = userData?.access;

    if (!accessToken) {
      alert("Access token missing. Please log in.");
      return;
    }

    const requestBody = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      mobile: formData.mobile,
      password: formData.password,
      address: formData.address,
      permissions: {
        can_add_product: formData?.permissions?.products?.includes("add") ? true : false,
        can_edit_product: formData?.permissions?.products?.includes("update") ? true : false,
        can_view_product: formData?.permissions?.products?.includes("view") ? true : false,
        can_delete_product: formData?.permissions?.products?.includes("delete") ? true : false,
        can_add_category: formData?.permissions?.categories?.includes("add") ? true : false,
        can_edit_category: formData?.permissions?.categories?.includes("update") ? true : false,
        can_view_category: formData?.permissions?.categories?.includes("view") ? true : false,
        can_delete_category: formData?.permissions?.categories?.includes("delete") ? true : false,
        can_add_subcategory: formData?.permissions?.subcategories?.includes("add") ? true : false,
        can_edit_subcategory: formData?.permissions?.subcategories?.includes("update") ? true : false,
        can_view_subcategory: formData?.permissions?.subcategories?.includes("view") ? true : false,
        can_delete_subcategory: formData?.permissions?.subcategories?.includes("delete") ? true : false,
        can_manage_orders: formData?.permissions?.orders?.includes("manage orders") ? true : false,
        can_manage_delivery_status: formData?.permissions?.orders?.includes("manage delivery status") ? true : false,
        can_view_payment: formData?.permissions?.payments?.includes("view") ? true : false,
        can_view_users: formData?.permissions?.endusers?.includes("view") ? true : false,
      },
    };

    try {
      const response = await sendRequest(accessToken, requestBody)
      if (response.status === 401) {
        const newTokens = await getUpdatedTokens(userData?.refresh);
        userData.access = newTokens.access;
        userData.refresh = newTokens.refresh;
        localStorage.setItem("user", JSON.stringify(userData));
        response = await sendRequest(newTokens.refresh, requestBody)
      }

      if (response.ok) {
        navigate("/list-employees")
      } else {
        const errorData = await response.json();
        console.error("Error:", errorData);
        alert("Failed to add employee.");
      }
    } catch (error) {
      console.error("Request failed:", error);
      alert("Something went wrong.");
    }
  };

  const renderPermissionCheckbox = (module, actions) =>
    actions.map((action) => (
      <div className="form-check form-check-inline" key={`${module}-${action}`}>
        <Input
          className="form-check-input"
          type="checkbox"
          id={`${module}-${action}`}
          checked={formData.permissions[module].includes(action)}
          onChange={() => handlePermissionChange(module, action)}
        />
        <Label className="form-check-label" htmlFor={`${module}-${action}`}>
          {action.charAt(0).toUpperCase() + action.slice(1)}
        </Label>
      </div>
    ));

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Add Employee" breadcrumbItems={breadcrumbItems} />

          {!hasRefreshToken && (
            <div className="alert alert-warning" role="alert">
              Refresh token not found. Please log in again.
            </div>
          )}

          <Row>
            <Col lg={12}>
              <Card>
                <CardBody>
                  <Form onSubmit={handleSubmit}>
                    <Row>
                      <Col md={6}>
                        <div className="mb-3">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            name="firstName"
                            type="text"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="mb-3">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            name="lastName"
                            type="text"
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <div className="mb-3">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            pattern="^[\w.%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$"
                            required
                          />
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="mb-3">
                          <Label htmlFor="mobile">Mobile</Label>
                          <Input
                            id="mobile"
                            name="mobile"
                            type="text"
                            value={formData.mobile}
                            onChange={handleChange}
                            maxLength="10"
                            required
                          />
                        </div>
                      </Col>
                    </Row>

                    <div className="mb-3">
                      <Label htmlFor="password">Password</Label>
                      {/* <Input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                      /> */}
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                      <FontAwesomeIcon
                        icon={showPassword ? faEyeSlash : faEye}
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: "absolute",
                          top: "50%",
                          right: "15px",
                          transform: "translateY(-50%)",
                          cursor: "pointer",
                          color: "#888"
                        }}
                      />
                    </div>

                    <div className="mb-3">
                      <Label htmlFor="address">Address</Label>
                      <textarea
                        id="address"
                        name="address"
                        className="form-control"
                        rows="5"
                        value={formData.address}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="mt-4">
                      <h5 className="mb-3">Permissions</h5>

                      <div className="mb-3 d-flex align-items-center flex-wrap gap-3">
                        <Label className="fw-bold mb-0 me-2" style={{ width: "120px" }}>
                          Products:
                        </Label>
                        {renderPermissionCheckbox("products", ["add", "update", "view", "delete"])}
                      </div>

                      <div className="mb-3 d-flex align-items-center flex-wrap gap-3">
                        <Label className="fw-bold mb-0 me-2" style={{ width: "120px" }}>
                          Categories:
                        </Label>
                        {renderPermissionCheckbox("categories", ["add", "update", "view", "delete"])}
                      </div>

                      <div className="mb-3 d-flex align-items-center flex-wrap gap-3">
                        <Label className="fw-bold mb-0 me-2" style={{ width: "120px" }}>
                          Sub Categories:
                        </Label>
                        {renderPermissionCheckbox("subcategories", ["add", "update", "view", "delete"])}
                      </div>

                      <div className="mb-3 d-flex align-items-center flex-wrap gap-3">
                        <Label className="fw-bold mb-0 me-2" style={{ width: "120px" }}>
                          Payments:
                        </Label>
                        {renderPermissionCheckbox("payments", ["view"])}
                      </div>

                      <div className="mb-3 d-flex align-items-center flex-wrap gap-3">
                        <Label className="fw-bold mb-0 me-2" style={{ width: "120px" }}>
                          End Users:
                        </Label>
                        {renderPermissionCheckbox("endusers", ["view"])}
                      </div>

                      <div className="mb-3 d-flex align-items-center flex-wrap gap-3">
                        <Label className="fw-bold mb-0 me-2" style={{ width: "120px" }}>
                          Orders:
                        </Label>
                        {renderPermissionCheckbox("orders", [
                          "manage orders",
                          "manage delivery status",
                        ])}
                      </div>
                    </div>

                    <div className="text-center mt-4">
                      <Button type="submit" color="primary" className="me-1">
                        Save
                      </Button>
                    </div>
                  </Form>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default AddEmployee;
