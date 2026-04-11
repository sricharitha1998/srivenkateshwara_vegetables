import React, { useState } from "react";
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
  Spinner,
  Alert
} from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { useNavigate } from "react-router-dom";
import imageCompression from "browser-image-compression";
import { useDispatch, useSelector } from "react-redux";
import { addCategory } from "../../store/actions";

const AddCategory = () => {
  const breadcrumbItems = [
    { title: "Category", link: "#" },
    { title: "Add Category", link: "#" },
  ];

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error } = useSelector((state) => ({
    loading: state.Categories.loading,
    error: state.Categories.error,
  }));

  const [formData, setFormData] = useState({ name: "" });
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const handleNameChange = (e) => {
    setFormData({ name: e.target.value });
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
      name: formData.name,
      image: imageFile
    };

    dispatch(addCategory(plainData, navigate));
  };

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs title="Add Category" breadcrumbItems={breadcrumbItems} />
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
                          className="form-control"
                          value={formData.name}
                          onChange={handleNameChange}
                          required
                        />
                      </div>
                    </Col>
                    <Col md={12}>
                      <div className="mb-3">
                        <Label htmlFor="image">Category Image</Label>
                        <Input
                          id="image"
                          name="image"
                          type="file"
                          className="form-control"
                          accept="image/*"
                          onChange={handleImageChange}
                          required
                        />
                      </div>
                      {imagePreview && (
                        <div className="mb-3">
                          <Label>Preview:</Label>
                          <div>
                            <img
                              src={imagePreview}
                              alt="Preview"
                              style={{ maxWidth: "200px", maxHeight: "200px", borderRadius: "5px" }}
                            />
                          </div>
                        </div>
                      )}
                    </Col>
                  </Row>
                  <div className="text-center mt-4">
                    <Button type="submit" color="primary" className="me-1" disabled={loading}>
                      {loading ? <Spinner size="sm" color="light" className="me-2" /> : null}
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

export default AddCategory;
