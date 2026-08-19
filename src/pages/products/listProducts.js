import React, { useEffect, useMemo, useRef, useState } from "react";
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
import { Link, useLocation } from "react-router-dom";
import DataTable from "react-data-table-component";

const ListProducts = () => {
  const API_BASE = process.env.REACT_APP_API_URL;
  const location = useLocation();
  const pageFromUrl = Number(new URLSearchParams(location.search).get("page"));
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(pageFromUrl > 0 ? pageFromUrl : 1);
  const [perPage, setPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [subcategoryFilter, setSubcategoryFilter] = useState("all");
  const filtersMounted = useRef(false);

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

  const formatLastUpdated = (value) => {
    if (!value) return "N/A";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const sortProductsByLatestUpdate = (items = []) =>
    [...items].sort((a, b) => {
      const dateA = new Date(
  a?.last_updated_date || a?.last_updated || a?.updated_at || 0
).getTime();

const dateB = new Date(
  b?.last_updated_date || b?.last_updated || b?.updated_at || 0
).getTime();
      return dateB - dateA;
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

  const fetchProducts = async (page = currentPage, limit = perPage, search = searchText) => {
    setLoading(true);
    try {
      const response = await makeAuthenticatedRequest(`${API_BASE}/products/?page_no=${page}&page_size=${limit}&search=${search}`);
      if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
      const result = await response.json();
      const items = Array.isArray(result?.data?.results)
        ? result.data.results
        : (Array.isArray(result?.data?.data)
          ? result?.data?.data
          : (Array.isArray(result?.data) ? result.data : []));
      const sortedItems = sortProductsByLatestUpdate(items);
      const count = result?.data?.count ?? result?.count ?? result?.data?.total ?? result?.total ?? result?.data?.total_rows ?? sortedItems.length;
      setData(sortedItems);
      setTotalRows(count);
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
      setSelectedProduct(product);
      setModalOpen(true);
    } catch (error) {
      console.error("Error opening modal:", error);
    }
  };

  const closeProductModal = () => {
    setModalOpen(false);
    setSelectedProduct(null);
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

  const handleSearch = (e) => {
    setSearchText(e.target.value);
    setCurrentPage(1);
  };

  const categoryOptions = useMemo(
    () => [...new Set(data.map((row) => row.category_name).filter(Boolean))],
    [data]
  );

  const subcategoryOptions = useMemo(
    () => [...new Set(data.map((row) => row.subcategory_name).filter(Boolean))],
    [data]
  );

  const filteredProducts = useMemo(() => {
    return sortProductsByLatestUpdate(
      data.filter((row) => {
        const matchesCategory =
          categoryFilter === "all" || row.category_name === categoryFilter;
        const matchesSubcategory =
          subcategoryFilter === "all" || row.subcategory_name === subcategoryFilter;
        return matchesCategory && matchesSubcategory;
      })
    );
  }, [data, categoryFilter, subcategoryFilter]);

  const effectiveTotalRows =
    categoryFilter === "all" && subcategoryFilter === "all"
      ? totalRows
      : filteredProducts.length;

  const displayData = filteredProducts;

  const columns = useMemo(() => [
    {
      name: "No.",
      cell: (row, index) => (currentPage - 1) * perPage + (index + 1),
      width: "80px",
    },
    {
      name: "Product Name",
      selector: (row) => row.name,
      sortable: true,
      cell: (row) => (
        <Button color="link" onClick={() => openProductModal(row)}>
          {row.name}
        </Button>
      ),
    },
    {
      name: "Category",
      selector: (row) => row.category_name || "N/A",
      sortable: true,
    },
    {
      name: "Sub Category",
      selector: (row) => row.subcategory_name || "N/A",
      sortable: true,
    },
   {
  name: "Last Updated",
  selector: (row) =>
    row.last_updated_date ||
    row.last_updated ||
    row.updated_at ||
    "N/A",
  sortable: true,
  cell: (row) =>
    formatLastUpdated(
      row.last_updated_date ||
      row.last_updated ||
      row.updated_at
    ),
},
    (canEdit || canDelete) && {
      name: "Actions",
      cell: (row) => (
        <>
          {canEdit && (
            <Link to={`/update-product/${row.id}?page=${currentPage}`} className="me-3 text-primary">
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
  ].filter(Boolean), [canEdit, canDelete, openProductModal, currentPage, perPage]);

  useEffect(() => {
    fetchProducts(currentPage, perPage, searchText);
  }, [currentPage, perPage, searchText]);

  useEffect(() => {
    if (!filtersMounted.current) {
      filtersMounted.current = true;
      return;
    }
    setCurrentPage(1);
  }, [categoryFilter, subcategoryFilter]);

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

                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                  <div className="d-flex gap-2 flex-wrap">
                    <select
                      className="form-select"
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      style={{ minWidth: "150px" }}
                    >
                      <option value="all">All Categories</option>
                      {categoryOptions.map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>

                    <select
                      className="form-select"
                      value={subcategoryFilter}
                      onChange={(e) => setSubcategoryFilter(e.target.value)}
                      style={{ minWidth: "170px" }}
                    >
                      <option value="all">All Subcategories</option>
                      {subcategoryOptions.map((subcategory) => (
                        <option key={subcategory} value={subcategory}>{subcategory}</option>
                      ))}
                    </select>
                  </div>

                  <input
                    type="text"
                    className="form-control w-25 min-width-220"
                    placeholder="Search Product..."
                    value={searchText}
                    onChange={handleSearch}
                  />
                </div>

                {/* Data Table handles own loading state */}
                <DataTable
                  columns={columns}
                  data={displayData}
                  pagination
                  paginationServer
                  paginationTotalRows={effectiveTotalRows}
                  paginationPerPage={perPage}
                  paginationDefaultPage={currentPage}
                  progressPending={loading}
                  progressComponent={<div className="my-3 text-center"><Spinner color="primary" /></div>}
                  onChangePage={(page) => setCurrentPage(page)}
                  onChangeRowsPerPage={(newPerPage, page) => {
                    setPerPage(newPerPage);
                    setCurrentPage(page);
                  }}
                  highlightOnHover
                  striped
                  responsive
                />
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
                  src={image.image}
                  alt={image.alt_text || `product-${index}`}
                  className="img-thumbnail"
                  style={{ width: "120px", height: "120px", objectFit: "cover", marginRight: "10px" }}
                />
              ))}
            </Col>
            <Col lg={8}>
              <h5>Description:</h5>
              <div dangerouslySetInnerHTML={{ __html: selectedProduct?.description || "" }} />

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
