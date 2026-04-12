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
} from "reactstrap";
import { useNavigate, useParams } from "react-router-dom";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { useDispatch, useSelector } from "react-redux";
import { updateSubCategory } from "../../store/actions";

const UpdateSubCategory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loading, error } = useSelector((state) => ({
    loading: state.SubCategories?.loading || false,
    error: state.SubCategories?.error || null,
  }));

  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    subCategoryName: "",
    categoryType: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState("");

  const breadcrumbItems = [
    { title: "Sub Category", link: "#" },
    { title: "Update Sub Category", link: "#" },
  ];

  const handleNameChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
    } else {
      setPreviewImage(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const plainData = {
      categoryType: formData.categoryType,
      subCategoryName: formData.subCategoryName,
      image: imageFile
    };

    dispatch(updateSubCategory(id, plainData, navigate));
  };

  const getUserData = () => JSON.parse(localStorage.getItem("user")) || {};

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

  const fetchWithAuth = async (url, options) => {
    const userData = getUserData();
    let accessToken = userData?.access;

    let response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.status === 401) {
      const newTokens = await getUpdatedTokens(userData.refresh);
      localStorage.setItem("user", JSON.stringify(newTokens));

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

  const fetchCategories = async () => {
    try {
      const res = await fetchWithAuth(`${process.env.REACT_APP_API_URL}/categories/`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const result = await res.json();
      const items = Array.isArray(result?.data?.results) ? result.data.results : (Array.isArray(result?.data?.data) ? result?.data?.data : (Array.isArray(result?.data) ? result.data : []));
      setCategories(items);
    } catch (err) {
      console.error("Error loading categories", err);
      alert("Failed to load categories.");
    }
  };

  const fetchSubCategory = async () => {
    try {
      const res = await fetchWithAuth(`${process.env.REACT_APP_API_URL}/subcategories/${id}/`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const result = await res.json();
      setFormData({
        subCategoryName: result?.data?.name || "",
        categoryType: result?.data?.category?.toString() || "",
      });
      if (result?.data?.image) {
        setPreviewImage(result.data.image);
      }
    } catch (err) {
      console.error("Error fetching subcategory:", err);
      alert("Failed to load subcategory.");
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchSubCategory();
  }, [id]);

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs title="Update Sub Category" breadcrumbItems={breadcrumbItems} />
        <Row>
          <Col lg={12}>
            <Card>
              <CardBody>
                {error && <Alert color="danger">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <div className="mb-3">
                        <Label htmlFor="categoryType">Category Type</Label>
                        <Input
                          id="categoryType"
                          name="categoryType"
                          type="select"
                          className="form-select"
                          value={formData.categoryType}
                          onChange={handleNameChange}
                          required
                        >
                          <option value="">-- Select Type --</option>
                          {categories?.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.name}
                            </option>
                          ))}
                        </Input>
                      </div>
                    </Col>

                    <Col md={6}>
                      <div className="mb-3">
                        <Label htmlFor="subCategoryName">Sub Category Name</Label>
                        <Input
                          id="subCategoryName"
                          name="subCategoryName"
                          type="text"
                          className="form-control"
                          value={formData.subCategoryName}
                          onChange={handleNameChange}
                          required
                        />
                      </div>
                    </Col>

                    <Col md={12}>
                      <div className="mb-3">
                        <Label htmlFor="image">Image</Label>
                        <Input
                        required
                          id="image"
                          name="image"
                          type="file"
                          className="form-control"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </div>
                    </Col>

                    {previewImage && (
                      <Col md={6}>
                        <div className="mb-3">
                          <Label>Preview</Label>
                          <div>
                            <img
                              src={previewImage}
                              alt="Preview"
                              style={{ maxHeight: "120px", borderRadius: "5px" }}
                            />
                          </div>
                        </div>
                      </Col>
                    )}
                  </Row>

                  <div className="text-center mt-4">
                    <Button type="submit" color="primary" className="me-1" disabled={loading}>
                      {loading ? <i className="bx bx-loader bx-spin font-size-16 align-middle me-2"></i> : null}
                      Update
                    </Button>
                    <Button type="button" color="light" onClick={() => navigate("/list-sub-category")}>
                      Cancel
                    </Button>
                  </div>
                </Form>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default UpdateSubCategory;
