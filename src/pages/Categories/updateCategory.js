// UpdateCategory.js
import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  Col,
  Container,
  Input,
  Label,
  Row,
  Form,
  Alert,
  Spinner,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter
} from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { updateCategory } from "../../store/actions";

const getUserData = () => JSON.parse(localStorage.getItem("user"));

const refreshAccessToken = async () => {
  const userData = getUserData();
  const response = await fetch(`${process.env.REACT_APP_API_URL}/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh: userData?.refresh }),
  });

  if (!response.ok) throw new Error("Session expired. Please login again.");

  const newTokens = await response.json();
  const updatedUser = {
    ...userData,
    access: newTokens?.data?.access,
    refresh: newTokens?.data?.refresh,
  };
  localStorage.setItem("user", JSON.stringify(updatedUser));
  return updatedUser.access;
};

const fetchWithAuth = async (url, options = {}, retry = true) => {
  let userData = getUserData();
  let accessToken = userData?.access;

  let response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.status === 401 && retry) {
    accessToken = await refreshAccessToken();
    return fetchWithAuth(url, options, false);
  }

  return response;
};

const UpdateCategory = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error } = useSelector((state) => ({
    loading: state.Categories.loading,
    error: state.Categories.error,
  }));

  const [formData, setFormData] = useState({ name: "" });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [successModal, setSuccessModal] = useState(false);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await fetchWithAuth(
          `${process.env.REACT_APP_API_URL}/categories/${id}/`
        );

        if (!response.ok)
          throw new Error(`HTTP error! Status: ${response.status}`);

        const result = await response.json();
        setFormData({ name: result?.data?.name || "" });
        setExistingImage(result?.data?.image || null);
      } catch (error) {
        console.error("Fetch Error:", error.message);
        alert("Failed to load category details.");
      }
    };

    fetchCategory();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      const previewURL = URL.createObjectURL(file);
      setImagePreview(previewURL);
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const plainData = {
      name: formData.name,
      image: image
    };

    dispatch(updateCategory(id, plainData, navigate, () => setSuccessModal(true)));
  };

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs
          title="Update Category"
          breadcrumbItems={[
            { title: "Category", link: "#" },
            { title: "Update Category", link: "#" },
          ]}
        />
        <Row>
          <Col lg={12}>
            <Card>
              <CardBody>
                {error && <Alert color="danger">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={12}>
                      <div className="mb-3">
                        <Label htmlFor="name">Category Name</Label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          value={formData.name}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="mb-3">
                        <Label htmlFor="image">Update Image</Label>
                        <Input
                          id="image"
                          name="image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </div>

                      {imagePreview ? (
                        <div className="mb-3">
                          <Label>New Image Preview:</Label>
                          <div>
                            <img
                              src={imagePreview}
                              alt="New Preview"
                              style={{ height: "100px", borderRadius: "8px" }}
                            />
                          </div>
                        </div>
                      ) : existingImage ? (
                        <div className="mb-3">
                          <Label>Current Image:</Label>
                          <div>
                            <img
                              src={existingImage}
                              alt="Current"
                              style={{ height: "100px", borderRadius: "8px" }}
                            />
                          </div>
                        </div>
                      ) : null}
                    </Col>
                  </Row>
                  <div className="text-center mt-4">
                    <Button type="submit" color="primary" className="me-1" disabled={loading}>
                      {loading ? <Spinner size="sm" color="light" className="me-2" /> : null}
                      Update
                    </Button>
                  </div>
                </Form>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
      <Modal isOpen={successModal} centered>
        <ModalHeader>Category Updated</ModalHeader>
        <ModalBody>Category updated successfully.</ModalBody>
        <ModalFooter>
          <Button color="success" onClick={() => navigate("/list-category")}>
            Continue
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default UpdateCategory;
