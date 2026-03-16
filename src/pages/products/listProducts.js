import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardBody,
  Col,
  Container,
  Row,
  Modal,
  ModalHeader,
  ModalBody,
  Button,
  Spinner,
} from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { Link } from "react-router-dom";
import DataTable from "react-data-table-component";

const ListProducts = () => {
  const API_BASE = process.env.REACT_APP_API_URL;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [imageUrls, setImageUrls] = useState({});
  const [searchText, setSearchText] = useState("");

  const user = useMemo(() => JSON.parse(localStorage.getItem("user")) || {}, []);
  const userInfo = user?.user || {};

  const canAdd = userInfo.is_superadmin || userInfo.permissions?.can_add_product;
  const canEdit = userInfo.is_superadmin || userInfo.permissions?.can_edit_product;
  const canDelete = userInfo.is_superadmin || userInfo.permissions?.can_delete_product;

  const breadcrumbItems = [
    { title: "Products", link: "#" },
    { title: "List Products", link: "#" },
  ];

  const getAuthHeaders = (token) => ({
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  });

  const refreshToken = async (refresh) => {
    const response = await fetch(`${API_BASE}/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });

    if (!response.ok) throw new Error("Session expired. Please login again.");
    const refreshData = await response.json();
    const newTokens = refreshData?.data;
    localStorage.setItem("user", JSON.stringify({ ...newTokens, user: userInfo }));
    return newTokens?.access;
  };

  const makeAuthenticatedRequest = async (url, options = {}, retry = true) => {
    let { access, refresh } = user;

    let response = await fetch(url, {
      ...options,
      headers: getAuthHeaders(access),
    });

    if (response.status === 401 && retry) {
      access = await refreshToken(refresh);
      return makeAuthenticatedRequest(url, options, false);
    }

    return response;
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await makeAuthenticatedRequest(`${API_BASE}/products/`);
      if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
      const result = await response.json();
      setData(result?.data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
    setLoading(false);
  };

  const getImage = async (link) => {
    try {
      let { access } = user;
      const response = await fetch(link, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${access}`,
        },
      });
      if (!response.ok) throw new Error(`Image fetch failed: ${response.status}`);
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error("Image fetch error:", error);
      return null;
    }
  };

  const openProductModal = async (product) => {
    try {
      const urls = {};
      for (const image of product.images || []) {
        const url = await getImage(image.secure_url);
        urls[image.secure_url] = url;
      }

      setImageUrls(urls);
      setSelectedProduct(product);
      setModalOpen(true);
    } catch (error) {
      console.error("Error opening modal:", error);
    }
  };

  const closeProductModal = () => {
    setModalOpen(false);
    setSelectedProduct(null);
    setImageUrls({});
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      const response = await makeAuthenticatedRequest(
        `${API_BASE}/products/${id}/`,
        { method: "DELETE" }
      );

      if (!response.ok) throw new Error(`Delete failed: ${response.status}`);
      fetchProducts();
    } catch (err) {
      console.error("Delete error:", err.message);
      alert("Failed to delete product.");
    }
  };

  const filteredData = useMemo(() => {
    return data.filter(item => 
      item.name.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [data, searchText]);

  const columns = useMemo(() => [
    {
      name: "No.",
      cell: (row, index) => index + 1,
      width: "80px",
    },
    {
      name: "Product Name",
      selector: row => row.name,
      sortable: true,
      cell: (row) => (
        <Button color="link" onClick={() => openProductModal(row)}>
          {row.name}
        </Button>
      ),
    },
    {
      name: "Brand",
      selector: row => row.brand,
      sortable: true,
    },
    (canEdit || canDelete) && {
      name: "Actions",
      cell: (row) => (
        <>
          {canEdit && (
            <Link to={`/update-product/${row.id}`} className="me-3 text-primary">
              <i className="mdi mdi-pencil font-size-18" />
            </Link>
          )}
          {canDelete && (
            <Link to="#" className="text-danger" onClick={() => handleDelete(row.id)}>
              <i className="mdi mdi-trash-can font-size-18" />
            </Link>
          )}
        </>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ].filter(Boolean), [canEdit, canDelete, openProductModal]);

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs title="List Products" breadcrumbItems={breadcrumbItems} />
        <Row>
          <Col lg={12}>
            <Card>
              <CardBody>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="card-title mb-0">Products</h5>
                  {canAdd && (
                    <Link to="/add-products" className="btn btn-primary">
                      <i className="mdi mdi-plus me-1" /> Add Product
                    </Link>
                  )}
                </div>

                <div className="d-flex justify-content-end mb-3">
                  <input
                    type="text"
                    className="form-control w-25"
                    placeholder="Search Product..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                </div>

                {loading ? (
                  <div className="text-center py-5">
                    <Spinner color="primary" />
                  </div>
                ) : (
                  <DataTable
                    columns={columns}
                    data={filteredData}
                    pagination
                    highlightOnHover
                    striped
                    responsive
                    paginationPerPage={10}
                  />
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Modal for product details */}
      <Modal isOpen={modalOpen} toggle={closeProductModal} size="lg">
        <ModalHeader toggle={closeProductModal}>{selectedProduct?.name}</ModalHeader>
        <ModalBody>
          <Row>
            <Col lg={4}>
              <h5>Images:</h5>
              {selectedProduct?.images?.map((image, index) => (
                <img
                  key={index}
                  src={imageUrls[image.secure_url]}
                  alt={image.alt_text || `product-${index}`}
                  className="img-thumbnail"
                  style={{ width: "120px", height: "120px", objectFit: "cover", marginRight: "10px" }}
                />
              ))}
            </Col>
            <Col lg={8}>
              <h5>Description:</h5>
              <p>{selectedProduct?.description}</p>

              <h5>Variants:</h5>
              <ul>
                {selectedProduct?.variants?.map((variant, index) => (
                  <li key={index}>
                    {variant.unit}: {variant.price} - {variant.stock} available
                  </li>
                ))}
              </ul>

              <h5>Brand:</h5>
              <p>{selectedProduct?.brand}</p>

              <h5>Category:</h5>
              <p>{selectedProduct?.category_name}</p>

              <h5>Subcategory:</h5>
              <p>{selectedProduct?.subcategory_name}</p>
            </Col>
          </Row>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default ListProducts;
