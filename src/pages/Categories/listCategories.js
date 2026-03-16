import React, { useEffect, useMemo, useState } from "react";
import { Card, CardBody, Col, Container, Row, Spinner } from "reactstrap";
import { Link } from "react-router-dom";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import DataTable from "react-data-table-component";

const API_BASE = process.env.REACT_APP_API_URL;

const ListCategories = () => {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [loading, setLoading] = useState(false);  // Loading state

  const breadcrumbItems = [
    { title: "Category", link: "#" },
    { title: "List Categories", link: "#" },
  ];

  const getAuthHeaders = (accessToken) => ({
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  });

  const filteredData = async (e) => {
    const value = e.target.value;
    if (value) {
      const getvalues = await data.filter((item) =>
        item.name.toLowerCase().includes(value.toLowerCase())
      );
      setData(getvalues);
    } else {
      fetchCategories();
    }
  };

  const refreshAccessToken = async (refreshToken) => {
    const response = await fetch(`${API_BASE}/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) throw new Error("Session expired. Please login again.");

    const { data } = await response.json();
    localStorage.setItem("user", JSON.stringify(data));
    return data.access;
  };

  const makeAuthenticatedRequest = async (url, options = {}, retry = true) => {
    const userData = JSON.parse(localStorage.getItem("user"));
    let { access, refresh } = userData;

    let response = await fetch(url, {
      ...options,
      headers: getAuthHeaders(access),
    });

    if (response.status === 401 && retry) {
      try {
        access = await refreshAccessToken(refresh);
        response = await makeAuthenticatedRequest(url, options, false);
      } catch (err) {
        throw new Error("Re-authentication failed.");
      }
    }

    return response;
  };

  const fetchCategories = async () => {
    setLoading(true);  // Set loading to true when starting fetch
    try {
      const response = await makeAuthenticatedRequest(`${API_BASE}/categories/`);
      if (!response.ok) throw new Error(`Fetch failed with status ${response.status}`);
      const result = await response.json();
      setData(result?.data || []);
    } catch (err) {
      console.error("Error fetching categories:", err.message);
    } finally {
      setLoading(false);  // Set loading to false when fetch is done
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;

    try {
      const response = await makeAuthenticatedRequest(`${API_BASE}/categories/${id}/`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error(`Delete failed with status ${response.status}`);
      fetchCategories();
    } catch (err) {
      console.error("Delete error:", err.message);
      alert("Failed to delete category.");
    }
  };

  const user = useMemo(() => JSON.parse(localStorage.getItem("user"))?.user || {}, []);

  const canAdd = user.is_superadmin || user.permissions?.can_add_category;
  const canEdit = user.is_superadmin || user.permissions?.can_edit_category;
  const canDelete = user.is_superadmin || user.permissions?.can_delete_category;

  const columns = useMemo(() => {
    const cols = [
      {
        name: "No.",
        cell: (row, index) =>
          (currentPage - 1) * perPage + (index + 1),
        ignoreRowClick: true,
        allowOverflow: true,
        button: true,
      },
      {
        name: "Category Name",
        selector: row => row.name,
        sortable: true,
      },
    ];

    if (canEdit || canDelete) {
      cols.push({
        name: "Actions",
        cell: (row) => (
          <>
            {canEdit && (
              <Link to={`/update-category/${row.id}`} className="me-3 text-primary">
                <i className="mdi mdi-pencil font-size-18"></i>
              </Link>
            )}
            {canDelete && (
              <Link
                to="#"
                className="text-danger"
                onClick={() => handleDelete(row.id)}
              >
                <i className="mdi mdi-trash-can font-size-18"></i>
              </Link>
            )}
          </>
        ),
        ignoreRowClick: true,
        allowOverflow: true,
        button: true,
      });
    }

    return cols;
  }, [data.length, currentPage, perPage, canEdit, canDelete]);

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs title="List Categories" breadcrumbItems={breadcrumbItems} />
        <Row>
          <Col lg={12}>
            <Card>
              <CardBody>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h4 className="mb-0">Categories</h4>
                  {canAdd && (
                    <Link to="/add-category" className="btn btn-primary">
                      <i className="mdi mdi-plus me-1" /> Add Category
                    </Link>
                  )}
                </div>

                <div className="d-flex justify-content-end mb-3">
                  <input
                    type="text"
                    className="form-control w-25"
                    placeholder="Search Category"
                    onChange={(e) => filteredData(e)}
                  />
                </div>

                {/* Show loader while fetching data */}
                {loading ? (
                  <div className="text-center">
                    <Spinner color="primary" />
                  </div>
                ) : (
                  <DataTable
                    columns={columns}
                    data={data}
                    pagination
                    responsive
                    highlightOnHover
                    striped
                    persistTableHead
                    defaultSortField="name"
                    onChangePage={(page) => setCurrentPage(page)}
                    onChangeRowsPerPage={(newPerPage, page) => {
                      setPerPage(newPerPage);
                      setCurrentPage(page);
                    }}
                  />
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ListCategories;
