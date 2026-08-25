import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardBody,
  Container,
  Button,
  Input,
  FormGroup,
  Label,
  Row,
  Col,
  Alert,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";

const AddDeliveryBoy = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [successModal, setSuccessModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const getAuthHeaders = () => {
    const userData = JSON.parse(localStorage.getItem("user"));
    return {
      Authorization: `Bearer ${userData?.access}`,
      "Content-Type": "application/json",
    };
  };

  const getUpdatedTokens = async (refreshToken) => {
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/token/refresh/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: refreshToken }),
      }
    );

    if (!response.ok) throw new Error("Session expired. Please login again.");
    const data = await response.json();
    return data?.data;
  };

  const fetchWithAuth = async (url, options = {}) => {
    const userData = JSON.parse(localStorage.getItem("user"));
    let accessToken = userData?.access;

    let response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.status === 401) {
      const newTokens = await getUpdatedTokens(userData?.refresh);
      userData.access = newTokens.access;
      userData.refresh = newTokens.refresh;
      localStorage.setItem("user", JSON.stringify(userData));

      response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${newTokens.access}`,
        },
      });
    }

    return response;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (!formData.name.trim() || !formData.mobile.trim() ) {
        setError("Name and Mobile are required fields");
        setLoading(false);
        return;
      }

      // Basic email validation
    

      const response = await fetchWithAuth(
        `${process.env.REACT_APP_API_URL}/admin/delivery-persons/`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        const errorMsg = errorData?.message || errorData?.error || `Error: ${response.status} ${response.statusText}`;
        throw new Error(errorMsg);
      }

      const result = await response.json();
      console.log("Delivery boy created:", result);
      setSuccessModal(true);
      setFormData({ name: "", mobile: "" });
    } catch (err) {
      const errorMsg = err?.message || "Failed to add delivery boy";
      setError(errorMsg);
      console.error("Error adding delivery boy:", err);
    } finally {
      setLoading(false);
    }
  };

  const breadcrumbItems = [
    { title: "Dashboard", link: "/" },
    { title: "Delivery Boys", link: "#" },
    { title: "Add", link: "#" },
  ];

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Add Delivery Boy" breadcrumbItems={breadcrumbItems} />

          {error && <Alert color="danger">{error}</Alert>}
          {success && <Alert color="success">{success}</Alert>}

          <Card>
            <CardBody>
              <form onSubmit={handleSubmit}>
                <Row className="mb-3">
                  <Col md={6}>
                    <FormGroup>
                      <Label for="name">Full Name *</Label>
                      <Input
                        type="text"
                        name="name"
                        id="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter delivery boy name"
                        required
                      />
                    </FormGroup>
                  </Col>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="mobile">Mobile Number *</Label>
                      <Input
                        type="tel"
                        name="mobile"
                        id="mobile"
                        value={formData.mobile}
                        onChange={handleInputChange}
                        placeholder="Enter mobile number"
                        required
                      />
                    </FormGroup>
                  </Col>
                </Row>

                

                <Row>
                  <Col>
                    <FormGroup>
                      <Button
                        color="primary"
                        type="submit"
                        disabled={loading}
                      >
                        {loading ? "Adding..." : "Add Delivery Boy"}
                      </Button>
                      <Button
                        color="secondary"
                        type="button"
                        className="ms-2"
                        onClick={() => navigate("/list-delivery-boys")}
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                    </FormGroup>
                  </Col>
                </Row>
              </form>
            </CardBody>
          </Card>
        </Container>
      </div>
      <Modal isOpen={successModal} centered>
        <ModalHeader>Delivery Boy Added</ModalHeader>
        <ModalBody>Delivery boy added successfully.</ModalBody>
        <ModalFooter>
          <Button color="success" onClick={() => navigate("/list-delivery-boys")}>
            Continue
          </Button>
        </ModalFooter>
      </Modal>
    </React.Fragment>
  );
};

export default AddDeliveryBoy;
