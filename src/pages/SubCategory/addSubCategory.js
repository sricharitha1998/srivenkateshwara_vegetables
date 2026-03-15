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
} from "reactstrap";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { useDispatch, useSelector } from "react-redux";
import { addSubCategory } from "../../store/actions";

const AddSubCategory = () => {
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
  const [imagePreview, setImagePreview] = useState(null);

  const breadcrumbItems = [
    { title: "Sub Category", link: "#" },
    { title: "Add Sub Category", link: "#" },
  ];

  const handleNameChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const plainData = {
      categoryType: formData.categoryType,
      subCategoryName: formData.subCategoryName,
      image: imageFile
    };

    dispatch(addSubCategory(plainData, navigate));
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

  const fetchWithAuth = async (url, options) => {
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

  const fetchCategories = async () => {
    try {
      const response = await fetchWithAuth("https://admin.veggafresh.com/be/api/v1/categories/", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const result = await response.json();
      setCategories(result?.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      alert("Failed to load categories.");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs title="Add Sub Category" breadcrumbItems={breadcrumbItems} />
        <Row>
          <Col lg={12}>
            <Card>
              <CardBody>
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <div className="mb-3">
                        <Label htmlFor="categoryType">Category Type</Label>
                        <Select
                          id="categoryType"
                          name="categoryType"
                          options={categories.map((item) => ({
                            value: item.id,
                            label: item.name,
                          }))}
                          value={categories
                            .map((item) => ({
                              value: item.id,
                              label: item.name,
                            }))
                            .find((option) => option.value === formData.categoryType)}
                          onChange={(selectedOption) =>
                            setFormData((prev) => ({
                              ...prev,
                              categoryType: selectedOption ? selectedOption.value : "",
                            }))
                          }
                          placeholder="-- Select Type --"
                          isClearable
                        />
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
                        <Label htmlFor="image">Sub Category Image</Label>
                        <Input
                          id="image"
                          name="image"
                          type="file"
                          className="form-control"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </div>
                      {imagePreview && (
                        <div className="mt-3">
                          <img
                            src={imagePreview}
                            alt="Image Preview"
                            style={{ width: "100px", height: "100px", objectFit: "cover" }}
                          />
                        </div>
                      )}
                    </Col>
                  </Row>

                  <div className="text-center mt-4">
                    <Button type="submit" color="primary" className="me-1" disabled={loading}>
                      {loading ? <i className="bx bx-loader bx-spin font-size-16 align-middle me-2"></i> : null}
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
  );
};

export default AddSubCategory;
