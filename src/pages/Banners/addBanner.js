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
  Alert,
  Spinner
} from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { useNavigate, useParams } from "react-router-dom";
import Dropzone from "react-dropzone";

const AddBanner = () => {
  const { id } = useParams();
  const isEdit = !!id;

  const breadcrumbItems = [
    { title: "Banners", link: "#" },
    { title: isEdit ? "Edit Banner" : "Add Banner", link: "#" },
  ];

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    link_url: "",
    banner_type: "",
    position: 1,
    is_active: true,
    start_date: "",
    end_date: ""
  });

  const [imageFile, setImageFile] = useState(null); // base64 string
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState(null);


  const getUserTokens = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    return {
      access: user?.access,
      refresh: user?.refresh,
    };
  };

  const refreshToken = async (refresh) => {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });

    if (!response.ok) throw new Error("Session expired. Please login again.");

    const data = await response.json();
    const newTokens = {
      access: data?.data?.access,
      refresh: data?.data?.refresh,
    };

    localStorage.setItem("user", JSON.stringify(newTokens));
    return newTokens;
  };

  const apiCall = async (url, method = "GET", body = null) => {
    let { access, refresh } = getUserTokens();

    const makeRequest = (token) =>
      fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        ...(body && { body: JSON.stringify(body) }),
      });

    let response = await makeRequest(access);

    if (response.status === 401) {
      const newTokens = await refreshToken(refresh);
      response = await makeRequest(newTokens.access);
    }

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  };

  useEffect(() => {
    if (isEdit) {
      fetchBannerDetails();
    }
  }, [id, isEdit]);

  const fetchBannerDetails = async () => {
    try {
      const result = await apiCall(`${process.env.REACT_APP_API_URL}/banners/${id}/`);
      const item = result.data; 
      if (item) {
        setFormData({
          title: item.title || "",
          subtitle: item.subtitle || "",
          link_url: item.link_url || "",
          banner_type: item.banner_type || "",
          position: item.position !== undefined && item.position !== null ? item.position : 1,
          is_active: item.is_active !== undefined ? item.is_active : true,
          start_date: item.start_date ? item.start_date.substring(0, 16) : "",
          end_date: item.end_date ? item.end_date.substring(0, 16) : ""
        });

        if (item.image) {
          setImagePreview(item.image);
        }
      }
    } catch (err) {
      console.error("Failed to fetch banner details:", err);
      setError("Failed to fetch banner details.");
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleImageDrop = (files) => {
    const file = files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageFile(reader.result); // Base64
        setImagePreview(URL.createObjectURL(file));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      ...formData,
      start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
      end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null
    };

    if (imageFile) {
      payload.image = imageFile;
      payload.mobile_image = imageFile;
    }

    try {
      if (isEdit) {
        await apiCall(`${process.env.REACT_APP_API_URL}/banners/${id}/`, "PATCH", payload);
      } else {
        await apiCall(`${process.env.REACT_APP_API_URL}/banners/`, "POST", payload);
      }
      navigate("/list-banners");
    } catch (err) {
      console.error("Submit error:", err);
      setError("Failed to save banner.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title={isEdit ? "Edit Banner" : "Add Banner"} breadcrumbItems={breadcrumbItems} />

          <Row>
            <Col lg={12}>
              <Card>
                <CardBody>
                  {error && <Alert color="danger">{error}</Alert>}
                  {fetching ? (
                    <div className="text-center my-5">
                      <Spinner color="primary" />
                      <p className="mt-2">Loading banner details...</p>
                    </div>
                  ) : (
                  <Form onSubmit={handleSubmit}>
                    <Row>
                      <Col md={6}>
                        <div className="mb-3">
                          <Label htmlFor="title">Title <span className="text-danger">*</span></Label>
                          <Input
                            id="title"
                            name="title"
                            type="text"
                            value={formData.title}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="mb-3">
                          <Label htmlFor="subtitle">Subtitle</Label>
                          <Input
                            id="subtitle"
                            name="subtitle"
                            type="text"
                            value={formData.subtitle}
                            onChange={handleChange}
                          />
                        </div>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <div className="mb-3">
                          <Label htmlFor="link_url">Link URL</Label>
                          <Input
                            id="link_url"
                            name="link_url"
                            type="url"
                            value={formData.link_url}
                            onChange={handleChange}
                          />
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="mb-3">
                          <Label htmlFor="banner_type">Banner Type <span className="text-danger">*</span></Label>
                          <Input
                            id="banner_type"
                            name="banner_type"
                            type="text"
                            value={formData.banner_type}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <div className="mb-3">
                          <Label htmlFor="position">Position <span className="text-danger">*</span></Label>
                          <Input
                            id="position"
                            name="position"
                            type="number"
                            value={formData.position}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </Col>
                      <Col md={6} className="d-flex align-items-center">
                        <div className="form-check form-switch form-switch-md mb-3" dir="ltr">
                          <Input
                            type="checkbox"
                            className="form-check-input"
                            id="is_active"
                            name="is_active"
                            checked={formData.is_active}
                            onChange={handleChange}
                          />
                          <Label className="form-check-label" htmlFor="is_active">
                            Is Active
                          </Label>
                        </div>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <div className="mb-3">
                          <Label htmlFor="start_date">Start Date</Label>
                          <Input
                            id="start_date"
                            name="start_date"
                            type="datetime-local"
                            value={formData.start_date}
                            onChange={handleChange}
                          />
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="mb-3">
                          <Label htmlFor="end_date">End Date</Label>
                          <Input
                            id="end_date"
                            name="end_date"
                            type="datetime-local"
                            value={formData.end_date}
                            onChange={handleChange}
                          />
                        </div>
                      </Col>
                    </Row>

                    <CardTitle className="h5 mt-4">Banner Image</CardTitle>
                    <Dropzone onDrop={handleImageDrop} accept="image/*" multiple={false}>
                      {({ getRootProps, getInputProps }) => (
                        <div
                          {...getRootProps()}
                          className="dropzone"
                          style={{
                            border: "2px dashed #ced4da",
                            padding: "20px",
                            textAlign: "center",
                            cursor: "pointer",
                          }}
                        >
                          <input {...getInputProps()} />
                          <p>Drag 'n' drop an image here, or click to select</p>
                        </div>
                      )}
                    </Dropzone>

                    {imagePreview && (
                      <Row className="mt-3">
                        <Col md={4} className="position-relative">
                          <div style={{ borderRadius: "8px", border: "1px solid #ced4da" }}>
                            <img
                              src={imagePreview}
                              alt="preview"
                              style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "8px" }}
                            />
                          </div>
                          <Button
                            color="danger"
                            size="sm"
                            className="position-absolute top-0 end-0 m-1"
                            onClick={removeImage}
                          >
                            &times;
                          </Button>
                        </Col>
                      </Row>
                    )}

                    <div className="text-center mt-4">
                      <Button type="submit" color="primary" className="me-1" disabled={loading}>
                        {loading ? "Saving..." : "Save"}
                      </Button>
                    </div>
                  </Form>
                  )}
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default AddBanner;
