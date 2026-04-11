import React, { useEffect, useState } from "react";
import {
  Button, Card, CardBody, CardTitle, Col, Container,
  Input, Label, Row, Nav, NavItem, NavLink,
  TabContent, TabPane, Form
} from "reactstrap";
import Dropzone from "react-dropzone";
import classnames from "classnames";
import Select from "react-select";
import { customSelectStyles } from "../../helpers/customStyles";
import { useParams } from "react-router-dom";
import Breadcrumb from "../../components/Common/Breadcrumb";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { useDispatch, useSelector } from "react-redux";
import { updateProduct } from "../../store/actions";
import { useNavigate } from "react-router-dom";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const breadcrumbItems = [
    { title: "Product", link: "#" },
    { title: "Edit Product", link: "#" },
  ];
  const unitOptions = [
    { label: "Kilogram (kg)", value: "kg" },
    { label: "Gram (g)", value: "g" },
    { label: "Liter (l)", value: "l" },
    { label: "Milliliter (ml)", value: "ml" },
    { label: "Piece (pc)", value: "pc" },
  ];
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [formValues, setFormValues] = useState({
    name: "",
    category: "",
    description: "",
    brand: "",
    subcategory: "",
  });

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [variants, setVariants] = useState([
    {
      quantity: "",
      unit: "",
      price: "",
      discounted_price: "",
      stock: "",
      is_available: true,
    },
  ]);

  const dispatch = useDispatch();
  const { loading } = useSelector(state => ({
    loading: state.Products?.loading || false
  }));

  const token = JSON.parse(localStorage.getItem("user"))?.access;

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (id) {
      fetchProductDetails(id);
    }
  }, [id]);

  useEffect(() => {
    if (formValues.category && categories.length > 0) {
      const categoryObj = categories.find((cat) => cat.id === parseInt(formValues.category));
      setSubcategories(categoryObj?.subcategories || []);
    }
  }, [formValues.category, categories]);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/categories/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const result = await res.json();
      const items = Array.isArray(result?.data?.results) ? result.data.results : (Array.isArray(result?.data?.data) ? result?.data?.data : (Array.isArray(result?.data) ? result.data : []));
      setCategories(items);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const fetchProductDetails = async (productId) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/products/${productId}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setFormValues({
        name: data?.data?.name,
        category: data?.data?.category,
        description: data?.data?.description,
        brand: data?.data?.brand,
        subcategory: data?.data.subcategory,
      });

      const selectedCategory = data?.data?.category;
      const categoryObj = categories.find((cat) => cat.id === selectedCategory);
      setSubcategories(categoryObj?.subcategories || []);
      setVariants(data?.data?.variants || []);

      // Set image previews
      if (data?.data?.images && data?.data?.images?.length > 0) {
        const imagePreviews = data?.data?.images.map((url, i) => ({
          name: `image-${i}`,
          preview: url?.image,
          formattedSize: "Existing",
        }));
        setSelectedFiles(imagePreviews);
      }
    } catch (err) {
      console.error("Failed to fetch product details:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "category") {
      const cat = categories.find((item) => item?.id == value);
      setSubcategories(cat?.subcategories || []);
    }
    setFormValues({ ...formValues, [name]: value });
  };

  const handleVariantChange = (index, e) => {
    const updated = [...variants];
    const { name, value, type, checked } = e.target;
    updated[index][name] = type === "checkbox" ? checked : value;
    setVariants(updated);
  };



  const addVariant = () => {
    setVariants([
      ...variants,
      {
        quantity: "",
        unit: "",
        price: "",
        discounted_price: "",
        stock: "",
        is_available: true,
      },
    ]);
  };

  const removeVariant = (index) => {
    const updated = [...variants];
    updated.splice(index, 1);
    setVariants(updated);
  };

  const handleAcceptedFiles = (files) => {
    const updatedFiles = files.map((file) =>
      Object.assign(file, {
        preview: URL.createObjectURL(file),
        formattedSize: formatBytes(file.size),
      })
    );
    setSelectedFiles([...selectedFiles, ...updatedFiles]);
  };

  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate if any variant is incomplete
    for (let i = 0; i < variants.length; i++) {
      const v = variants[i];
      if (!v.quantity || !v.unit || !v.price || !v.stock) {
        alert(`Please complete Quantity, Unit, Price, and Stock for Variant ${i + 1}.`);
        return;
      }
    }

    const plainData = {
      name: formValues.name,
      category: formValues.category,
      description: formValues.description,
      brand: formValues.brand,
      subcategory: formValues.subcategory,
      variants: variants,
      images: selectedFiles.filter(f => !f.formattedSize || f.formattedSize !== "Existing")
    };

    dispatch(updateProduct(id, plainData, navigate));
  };

  const handleImageDelete = (index) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
  };

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumb title="Edit Product" breadcrumbItems={breadcrumbItems} />
        <Row>
          <Col lg={12}>
            <Card>
              <CardBody>
                {/* <CardTitle tag="h4">Edit Product</CardTitle> */}
                <Form onSubmit={handleSubmit}>
                  {/* Product Info Section */}
                  <Row className="mb-3">
                    <Col md={6}>
                      <Label>Product Name</Label>
                      <Input
                        type="text"
                        name="name"
                        value={formValues.name}
                        onChange={handleInputChange}
                        required
                      />
                    </Col>
                    <Col md={6}>
                      <Label>Brand</Label>
                      <Input
                        type="text"
                        name="brand"
                        value={formValues.brand}
                        onChange={handleInputChange}
                        required
                      />
                    </Col>
                  </Row>

                  <Row className="mb-3">
                    <Col md={6}>
                      <Label>Category</Label>
                      <Select
                        styles={customSelectStyles}

                        name="category"
                        value={
                          categories
                            .map((cat) => ({ value: cat.id, label: cat.name }))
                            .find((cat) => cat.value === parseInt(formValues.category)) || null
                        }
                        onChange={(selected) => {
                          const cat = categories.find((item) => item.id === selected.value);
                          setFormValues({ ...formValues, category: selected.value, subcategory: "" });
                          setSubcategories(cat?.subcategories || []);
                        }}
                        options={categories?.map((cat) => ({
                          value: cat.id,
                          label: cat.name,
                        }))}
                        placeholder="Select Category"
                        isSearchable
                        required
                      />

                    </Col>
                    <Col md={6}>
                      <Label>Subcategory</Label>
                      <Select
                        styles={customSelectStyles}

                        name="subcategory"
                        value={
                          subcategories
                            .map((sub) => ({ value: sub.id, label: sub.name }))
                            .find((sub) => sub.value === parseInt(formValues.subcategory)) || null
                        }
                        onChange={(selected) =>
                          setFormValues({ ...formValues, subcategory: selected?.value || "" })
                        }
                        options={subcategories?.map((sub) => ({
                          value: sub.id,
                          label: sub.name,
                        }))}
                        placeholder="Select Subcategory"
                        isSearchable
                        isDisabled={!formValues.category}
                        required
                      />

                    </Col>
                  </Row>

                  <Row className="mb-3">
                    <Col>
                      <Label>Description</Label>

                      <CKEditor
                        editor={ClassicEditor}
                        data={formValues.description}
                        onChange={(event, editor) => {
                          const data = editor.getData();
                          setFormValues({ ...formValues, description: data });
                        }}
                      />
                    </Col>
                  </Row>

                  {/* Variants */}
                  <CardTitle tag="h5" className="mt-4">Product Variants</CardTitle>
                  {variants.map((variant, index) => (
                    <Row key={index} className="mb-3 align-items-end">
                      <Col md={2}>
                        <Label>Quantity</Label>
                        <Input
                          type="text"
                          name="quantity"
                          value={variant.quantity}
                          onChange={(e) => handleVariantChange(index, e)}
                          required
                        />
                      </Col>
                      <Col md={2}>
                        <Label>Unit</Label>
                        <Select
                          styles={customSelectStyles}
                          options={unitOptions}
                          value={unitOptions.find(opt => opt.value === variant.unit) || null}
                          onChange={(selected) => {
                            const updated = [...variants];
                            updated[index].unit = selected?.value || "";
                            setVariants(updated);
                          }}
                          placeholder="Select Unit"
                          isClearable
                        />
                      </Col>
                      <Col md={2}>
                        <Label>Price</Label>
                        <Input
                          type="number"
                          name="price"
                          value={variant.price}
                          onChange={(e) => handleVariantChange(index, e)}
                          required
                        />
                      </Col>
                      <Col md={2}>
                        <Label>Discounted Price</Label>
                        <Input
                          type="number"
                          name="discounted_price"
                          value={variant.discounted_price}
                          onChange={(e) => handleVariantChange(index, e)}
                        />
                      </Col>
                      <Col md={2}>
                        <Label>Stock</Label>
                        <Input
                          type="number"
                          name="stock"
                          value={variant.stock}
                          onChange={(e) => handleVariantChange(index, e)}
                          required
                        />
                      </Col>
                      <Col md={1}>
                        <Label>Available</Label>
                        <Input
                          type="checkbox"
                          name="is_available"
                          checked={variant.is_available}
                          onChange={(e) => handleVariantChange(index, e)}
                        />
                      </Col>
                      <Col md={1}>
                        {variants.length > 1 && (
                          <Button color="danger" onClick={() => removeVariant(index)}>X</Button>
                        )}
                      </Col>
                    </Row>
                  ))}
                  <Button color="info" onClick={addVariant}>Add Variant</Button>
                  <Row className="dropzone-previews mt-3">
                    {selectedFiles?.map((file, i) => (
                      <Col key={i} md={3}>
                        <div className="position-relative border p-2 mb-2">
                          <img
                            src={file.preview}
                            alt=""
                            className="img-fluid"
                            style={{ maxHeight: "200px", objectFit: "cover" }}
                          />
                          <Button
                            type="button"
                            color="danger"
                            size="sm"
                            className="position-absolute top-0 end-0 m-1"
                            onClick={() => handleImageDelete(i)}
                          >
                            <i className="mdi mdi-trash-can font-size-18"></i>
                          </Button>
                          <p className="text-center mt-2">{file.formattedSize}</p>
                        </div>
                      </Col>
                    ))}
                  </Row>
                  {/* Images Upload */}
                  <CardTitle tag="h5" className="mt-4">Upload Images</CardTitle>
                  <Dropzone onDrop={handleAcceptedFiles}>
                    {({ getRootProps, getInputProps }) => (
                      <div className="dropzone">
                        <div className="dz-message needsclick mt-2" {...getRootProps()}>
                          <input {...getInputProps()} />
                          <div>
                            <i className="display-4 text-muted bx bx-cloud-upload" />
                            <h5>Drop files here or click to upload.</h5>
                          </div>
                        </div>
                      </div>
                    )}
                  </Dropzone>


                  {/* Submit */}
                  <div className="text-end mt-4">
                    <Button color="success" type="submit" disabled={loading}>
                      {loading ? <i className="bx bx-loader bx-spin font-size-16 align-middle me-2"></i> : null}
                      Update Product
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

export default EditProduct;
