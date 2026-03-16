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
import { useNavigate, useParams } from "react-router-dom";

const UpdateEmployee = () => {
  const { id } = useParams(); // get employee ID from route
  const navigate = useNavigate();

  const breadcrumbItems = [
    { title: "Employee", link: "#" },
    { title: "Update Employee", link: "#" },
  ];

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
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

  const [hasRefreshToken, setHasRefreshToken] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.refresh) setHasRefreshToken(true);
    if (id) fetchEmployeeDetails(id);
  }, [id]);

  console.log("form", formData)
  const fetchEmployeeDetails = async (employeeId) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const response = await fetch(`${process.env.REACT_APP_API_URL}/employees/${employeeId}/`, {
        headers: {
          Authorization: `Bearer ${user?.access}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch employee data");
      const data = await response.json();
      console.log("data", data)
      setFormData({
        firstName: data?.data?.first_name || "",
        lastName: data?.data?.last_name || "",
        email: data?.data?.email || "",
        mobile: data?.data?.mobile || "",
        address: data?.data?.address || "",
        permissions: {
          products: [
            data?.data?.permissions?.can_add_product && "add",
            data?.data?.permissions?.can_edit_product && "update",
            data?.data?.permissions?.can_delete_product && "delete",
            data?.data?.permissions?.can_view_product && "view",
          ].filter(Boolean),
          categories: [
            data?.data?.permissions?.can_add_category && "add",
            data?.data?.permissions?.can_edit_category && "update",
            data?.data?.permissions?.can_view_category && "view",
            data?.data?.permissions?.can_delete_category && "delete",
          ].filter(Boolean),
          subcategories: [
            data?.data?.permissions?.can_add_subcategory && "add",
            data?.data?.permissions?.can_edit_subcategory && "update",
            data?.data?.permissions?.can_view_subcategory && "view",
            data?.data?.permissions?.can_delete_subcategory && "delete",
          ].filter(Boolean),
          orders: [
            data?.data?.permissions?.can_manage_orders && "manage orders",
            data?.data?.permissions?.can_manage_delivery_status && "manage delivery status",
          ].filter(Boolean),
          payments: [
            data?.data?.permissions?.can_view_payment && "view",
          ].filter(Boolean),
          endusers: [
            data?.data?.permissions?.can_view_users && "view",
          ].filter(Boolean),
        },
      });

    } catch (error) {
      console.error("Error fetching employee:", error);
    }
  };

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

  const getUpdatedTokens = async (refreshToken) => {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) throw new Error("Session expired. Please login again.");
    const data = await response.json();
    return data?.data;
  };

  const sendUpdateRequest = (accessToken, requestBody) => {
    console.log("requestBody", requestBody)
    return fetch(`${process.env.REACT_APP_API_URL}/employees/${id}/`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userData = JSON.parse(localStorage.getItem("user"));
    let accessToken = userData?.access;

    const requestBody = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      mobile: formData.mobile,
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
      let response = await sendUpdateRequest(accessToken, requestBody);

      if (response.status === 401) {
        const newTokens = await getUpdatedTokens(userData.refresh);
        userData.access = newTokens.access;
        userData.refresh = newTokens.refresh;
        localStorage.setItem("user", JSON.stringify(userData));
        accessToken = newTokens.access;
        response = await sendUpdateRequest(accessToken, requestBody);
      }

      if (response.ok) {
        navigate("/list-employees");
      } else {
        const errorData = await response.json();
        console.error("Error:", errorData);
        alert("Failed to update employee.");
      }
    } catch (error) {
      console.error("Update failed:", error);
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
          checked={formData?.permissions[module]?.includes(action)}
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
          <Breadcrumbs title="Update Employee" breadcrumbItems={breadcrumbItems} />

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
                          <Label>First Name</Label>
                          <Input
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
                          <Label>Last Name</Label>
                          <Input
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
                          <Label>Email</Label>
                          <Input
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="mb-3">
                          <Label>Mobile</Label>
                          <Input
                            name="mobile"
                            type="text"
                            maxLength="10"
                            value={formData.mobile}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </Col>
                    </Row>

                    <div className="mb-3">
                      <Label>Address</Label>
                      <textarea
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
                          Orders:
                        </Label>
                        {renderPermissionCheckbox("orders", [
                          "manage orders",
                          "manage delivery status",
                        ])}
                      </div>
                      <div className="mb-3 d-flex align-items-center flex-wrap gap-3">
                        <Label className="fw-bold mb-0 me-2" style={{ width: "120px" }}>
                          Payments:
                        </Label>
                        {renderPermissionCheckbox("payments", ["view"])}
                      </div>
                      <div className="mb-3 d-flex align-items-center flex-wrap gap-3">
                        <Label className="fw-bold mb-0 me-2" style={{ width: "120px" }}>
                          End users:
                        </Label>
                        {renderPermissionCheckbox("endusers", ["view"])}
                      </div>
                    </div>

                    <div className="text-center mt-4">
                      <Button type="submit" color="primary" className="me-1">
                        Update
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

export default UpdateEmployee;
