import React, { useEffect, useMemo, useState } from "react";
import { Card, CardBody, Col, Container, Row, Spinner } from "reactstrap";
import { Link } from "react-router-dom";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import DataTable from "react-data-table-component";

const API_BASE = "http://178.16.139.77:8000/api/v1";

const ListSubCategories = () => {
  const [data, setData] = useState([]);
  const [pending, setPending] = useState(true);
  const [searchText, setSearchText] = useState("");

  const user = useMemo(() => JSON.parse(localStorage.getItem("user")) || {}, []);
  const userInfo = user?.user || {};
  const canAdd = userInfo.is_superadmin || userInfo.permissions?.can_add_subcategory;
  const canEdit = userInfo.is_superadmin || userInfo.permissions?.can_edit_subcategory;
  const canDelete = userInfo.is_superadmin || userInfo.permissions?.can_delete_subcategory;

  const breadcrumbItems = [
    { title: "Sub Category", link: "#" },
    { title: "List Sub Categories", link: "#" },
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
      try {
        access = await refreshToken(refresh);
        response = await makeAuthenticatedRequest(url, options, false);
      } catch (err) {
        throw new Error("Re-authentication failed.");
      }
    }

    return response;
  };

  const fetchCategories = async () => {
    setPending(true);
    try {
      const response = await makeAuthenticatedRequest(`${API_BASE}/subcategories/`);
      if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
      const result = await response.json();
      setData(result?.data || []);
    } catch (err) {
      console.error("Error fetching categories:", err.message);
    } finally {
      setPending(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;

    try {
      const response = await makeAuthenticatedRequest(
        `${API_BASE}/subcategories/${id}/`,
        { method: "DELETE" }
      );

      if (!response.ok) throw new Error(`Delete failed: ${response.status}`);

      fetchCategories(); // Refresh list after delete
    } catch (err) {
      console.error("Delete error:", err.message);
      alert("Failed to delete category.");
    }
  };

  const filteredItems = data.filter(
    (item) =>
      item.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.category_name?.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = useMemo(() => {
    const cols = [
      {
        name: "No.",
        selector: (row, index) => index + 1,
        cell: (row, index, column, id) => <>{index + 1}</>,
        width: "70px",
      },
      {
        name: "Category Name",
        selector: (row) => row.category_name,
        sortable: true,
      },
      {
        name: "Sub Category Name",
        selector: (row) => row.name,
        sortable: true,
      },
    ];

    if (canEdit || canDelete) {
      cols.push({
        name: "Actions",
        cell: (row) => (
          <>
            {canEdit && (
              <Link to={`/update-sub-category/${row.id}`} className="me-3 text-primary">
                <i className="mdi mdi-pencil font-size-18" />
              </Link>
            )}
            {canDelete && (
              <Link
                to="#"
                className="text-danger"
                onClick={() => handleDelete(row.id)}
              >
                <i className="mdi mdi-trash-can font-size-18" />
              </Link>
            )}
          </>
        ),
      });
    }

    return cols;
  }, [canEdit, canDelete]);

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs title="List Sub Categories" breadcrumbItems={breadcrumbItems} />
        <Row>
          <Col lg={12}>
            <Card>
              <CardBody>
                <div className="d-flex justify-content-between align-items-center mb-2">
                                  <h4 className="mb-0">Sub Categories</h4>
                                  {canAdd && (
                    <Link to="/add-sub-category" className="btn btn-primary">
                      <i className="mdi mdi-plus me-1" /> Add Sub Category
                    </Link>
                  )}
                                </div>

                <div className="d-flex justify-content-end mb-2">
                  <input
                    type="text"
                    className="form-control w-auto"
                    placeholder="Search Category"
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                </div>

                <DataTable
                  columns={columns}
                  data={filteredItems}
                  progressPending={pending}
                  progressComponent={<Spinner color="primary" />}
                  pagination
                  paginationServer={false}
                  highlightOnHover
                  persistTableHead
                  responsive
                />
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ListSubCategories;
