import React, { useEffect, useState } from "react";
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
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import Select from "react-select";
import Dropzone from "react-dropzone";
import Breadcrumb from "../../components/Common/Breadcrumb";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addProduct, updateProduct } from "../../store/actions";

const AddProduct = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isEdit = !!id;

  const breadcrumbItems = [
    { title: "Product", link: "#" },
    { title: isEdit ? "Edit Product" : "Add Product", link: "#" },
  ];

  // --- State ---
  const [productData, setProductData] = useState({
    name: "",
    brand: "",
    category: "",
    subcategory: "",
    description: "",
  });

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

  const [selectedFiles, setSelectedFiles] = useState([]); // { binary?, preview, name, isExisting: boolean }
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  const { loading } = useSelector((state) => ({
    loading: state.Products?.loading || false,
  }));

  // --- Fetching Categories ---
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("user"));
        const response = await fetch("https://admin.veggafresh.com/be/api/v1/categories/", {
          headers: { Authorization: `Bearer ${userData?.access}` },
        });
        const result = await response.json();
        const formatted = (result?.data || []).map((cat) => ({
          value: cat.id,
          label: cat.name,
          subcategories: cat.subcategories || [],
        }));
        setCategories(formatted);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // --- Fetching Product Details (Edit Mode) ---
  useEffect(() => {
    if (isEdit && categories.length > 0) {
      const fetchProductDetails = async () => {
        try {
          const userData = JSON.parse(localStorage.getItem("user"));
          const response = await fetch(`https://admin.veggafresh.com/be/api/v1/products/${id}/`, {
            headers: { Authorization: `Bearer ${userData?.access}` },
          });
          const result = await response.json();
          const item = result?.data;

          if (item) {
            setProductData({
              name: item.name || "",
              brand: item.brand || "",
              category: item.category || "",
              subcategory: item.subcategory || "",
              description: item.description || "",
            });
            setVariants(item.variants || []);

            // Handle Existing Images
            if (item.images && item.images.length > 0) {
              const existingImages = item.images.map((img, idx) => ({
                preview: img.image, // Assuming the API returns a 'image' field with URL
                name: `existing-${idx}`,
                isExisting: true
              }));
              setSelectedFiles(existingImages);
            }

            // Sync subcategories for the selected category
            const findCat = categories.find(c => c.value == item.category);
            setSubcategories(findCat?.subcategories || []);
          }
        } catch (err) {
          console.error("Failed to fetch product details:", err);
        }
      };
      fetchProductDetails();
    }
  }, [id, isEdit, categories]);

  // --- Handlers ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (selected) => {
    setProductData((prev) => ({
      ...prev,
      category: selected?.value || "",
      subcategory: "",
    }));
    setSubcategories(selected?.subcategories || []);
  };

  const handleSubcategoryChange = (selected) => {
    setProductData((prev) => ({ ...prev, subcategory: selected?.id || "" }));
  };

  const handleVariantChange = (index, e) => {
    const { name, value, type, checked } = e.target;
    const updated = [...variants];
    updated[index][name] = type === "checkbox" ? checked : value;
    setVariants(updated);
  };

  const addVariant = () => {
    setVariants([
      ...variants,
      { quantity: "", unit: "", price: "", discounted_price: "", stock: "", is_available: true },
    ]);
  };

  const removeVariant = (index) => {
    if (variants.length > 1) {
      setVariants(variants.filter((_, i) => i !== index));
    }
  };

  const onDrop = (files) => {
    const updated = files.map((file) =>
      Object.assign(file, {
        preview: URL.createObjectURL(file),
        isExisting: false
      })
    );
    setSelectedFiles((prev) => [...prev, ...updated]);
  };

  const removeFile = (index) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // In Update Mode, the backend might only want NEW images or a specific merging logic.
    // For standard multipart/form-data ADD/UPDATE, we typically send NEW files.
    const newFiles = selectedFiles.filter(f => !f.isExisting);

    const payload = {
      ...productData,
      variants: variants,
      images: newFiles,
    };

    console.log(`${isEdit ? "Updating" : "Submitting"} Product Payload:`, payload);

    if (isEdit) {
      dispatch(updateProduct(id, payload, navigate));
    } else {
      dispatch(addProduct(payload, navigate));
    }
  };

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumb title={isEdit ? "Edit Product" : "Add Product"} breadcrumbItems={breadcrumbItems} />
        <Row>
          <Col lg={12}>
            <Card>
              <CardBody>
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6} className="mb-3">
                      <Label>Product Name</Label>
                      <Input
                        name="name"
                        value={productData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </Col>
                    <Col md={6} className="mb-3">
                      <Label>Brand</Label>
                      <Input name="brand" value={productData.brand} onChange={handleInputChange} />
                    </Col>
                    <Col md={6} className="mb-3">
                      <Label>Category</Label>
                      <Select
                        value={categories.find(c => c.value == productData.category) || null}
                        options={categories}
                        onChange={handleCategoryChange}
                        placeholder="Select Category..."
                        isClearable
                      />
                    </Col>
                    <Col md={6} className="mb-3">
                      <Label>Subcategory</Label>
                      <Select
                        value={subcategories.find(s => s.id == productData.subcategory) || null}
                        options={subcategories}
                        getOptionLabel={(opt) => opt.name}
                        getOptionValue={(opt) => opt.id}
                        onChange={handleSubcategoryChange}
                        placeholder="Select Subcategory..."
                        isDisabled={subcategories.length === 0}
                        isClearable
                      />
                    </Col>
                    <Col md={12} className="mb-4">
                      <Label>Description</Label>
                      <CKEditor
                        editor={ClassicEditor}
                        data={productData.description}
                        onChange={(event, editor) => {
                          setProductData((prev) => ({ ...prev, description: editor.getData() }));
                        }}
                      />
                    </Col>
                  </Row>

                  <CardTitle className="h5 mt-4">Variants</CardTitle>
                  {variants.map((variant, index) => (
                    <Row key={index} className="mb-3 border-bottom pb-3">
                      <Col md={2}>
                        <Label>Quantity</Label>
                        <Input
                          type="text"
                          name="quantity"
                          value={variant.quantity}
                          onChange={(e) => handleVariantChange(index, e)}
                        />
                      </Col>
                      <Col md={2}>
                        <Label>Unit</Label>
                        <Input
                          type="text"
                          name="unit"
                          value={variant.unit}
                          onChange={(e) => handleVariantChange(index, e)}
                          required
                        />
                      </Col>
                      <Col md={2}>
                        <Label>Price</Label>
                        <Input
                          type="number"
                          name="price"
                          value={variant.price}
                          onChange={(e) => handleVariantChange(index, e)}
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
                        />
                      </Col>
                      <Col md={1} className="d-flex align-items-center mt-4">
                        <Label className="me-2">Available</Label>
                        <Input
                          type="checkbox"
                          name="is_available"
                          checked={variant.is_available}
                          onChange={(e) => handleVariantChange(index, e)}
                        />
                      </Col>
                      {variants.length > 1 && (
                        <Col md={1} className="d-flex align-items-center mt-4">
                          <Button color="danger" size="sm" onClick={() => removeVariant(index)}>
                            Delete
                          </Button>
                        </Col>
                      )}
                    </Row>
                  ))}
                  <Button color="primary" size="sm" onClick={addVariant} className="mb-4">
                    + Add Variant Row
                  </Button>

                  <CardTitle className="h5 mt-4">Product Images</CardTitle>
                  <Dropzone onDrop={onDrop} accept="image/*" multiple>
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
                        <p>Drag 'n' drop some files here, or click to select files</p>
                      </div>
                    )}
                  </Dropzone>

                  <Row className="mt-3">
                    {selectedFiles.map((file, index) => (
                      <Col md={3} key={index} className="mb-3 position-relative">
                        <div style={{ border: file.isExisting ? "2px solid #556ee6" : "none", borderRadius: "8px" }}>
                          <img
                            src={file.preview}
                            alt="preview"
                            style={{ width: "100%", height: "150px", objectFit: "cover", borderRadius: "8px" }}
                          />
                          {file.isExisting && (
                            <small className="d-block text-center text-primary">Existing Image</small>
                          )}
                        </div>
                        <Button
                          color="danger"
                          size="sm"
                          className="position-absolute top-0 end-0 m-1"
                          onClick={() => removeFile(index)}
                        >
                          &times;
                        </Button>
                      </Col>
                    ))}
                  </Row>

                  <div className="text-end mt-4">
                    <Button color="success" type="submit" disabled={loading} size="lg">
                      {loading ? "Processing..." : isEdit ? "Update Product" : "Submit Product"}
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

export default AddProduct;
