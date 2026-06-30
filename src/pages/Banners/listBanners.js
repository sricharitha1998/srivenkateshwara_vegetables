import React, { useEffect, useState } from "react";
import { Card, CardBody, Col, Container, Row, Spinner, Input } from "reactstrap";
import { Link } from "react-router-dom";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import DataTable from "react-data-table-component";

const ListBanners = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    banner_type: "",
    is_active: "",
    active_only: false,
    ordering: ""
  });

  const breadcrumbItems = [
    { title: "Banners", link: "#" },
    { title: "List Banners", link: "#" },
  ];

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

  const fetchBanners = async () => {
    setLoading(true);
    try {
      let queryParams = [];
      if (filters.search) queryParams.push(`search=${filters.search}`);
      if (filters.banner_type) queryParams.push(`banner_type=${filters.banner_type}`);
      if (filters.is_active !== "") queryParams.push(`is_active=${filters.is_active}`);
      if (filters.active_only) queryParams.push(`active_only=true`);
      if (filters.ordering) queryParams.push(`ordering=${filters.ordering}`);

      const queryString = queryParams.length > 0 ? `?${queryParams.join("&")}` : "";

      const result = await apiCall(`${process.env.REACT_APP_API_URL}/banners/${queryString}`);
      const banners = Array.isArray(result?.results) ? result.results : (Array.isArray(result?.data?.results) ? result.data.results : (Array.isArray(result) ? result : []));
      setData(banners);
    } catch (error) {
      console.error("Fetch error:", error);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this banner?");
    if (!confirmDelete) return;

    try {
      await apiCall(`${process.env.REACT_APP_API_URL}/banners/${id}/`, "DELETE");
      fetchBanners();
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete banner.");
    }
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const columns = [
    {
      name: "S.No",
      selector: (row, index) => index + 1,
      width: "80px",
    },
    {
      name: "Image",
      cell: (row) => (
        <img src={row.image} alt={row.title} style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "5px" }} />
      ),
      width: "100px",
    },
    {
      name: "Title",
      selector: (row) => row.title,
      sortable: true,
    },
    {
      name: "Type",
      selector: (row) => row.banner_type,
      sortable: true,
    },
    {
      name: "Position",
      selector: (row) => row.position,
      sortable: true,
    },
    {
      name: "Status",
      selector: (row) => row.is_active ? "Active" : "Inactive",
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <>
          <Link to={`/update-banner/${row.id}`} className="me-3 text-primary">
            <i className="mdi mdi-pencil font-size-18"></i>
          </Link>
          <Link to="#" className="text-danger" onClick={() => handleDelete(row.id)}>
            <i className="mdi mdi-trash-can font-size-18"></i>
          </Link>
        </>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchBanners();
    }, 500); // Debounce search to avoid too many API calls
    
    return () => clearTimeout(timeoutId);
  }, [filters]);

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs title="List Banners" breadcrumbItems={breadcrumbItems} />
        <Row>
          <Col lg={12}>
            <Card>
              <CardBody>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="card-title mb-0">Banners</h5>
                  <Link to="/add-banner" className="btn btn-primary">
                    <i className="mdi mdi-plus me-1" /> Add Banner
                  </Link>
                </div>

                <Row className="mb-3">
                  <Col md={3} className="mb-2">
                    <Input
                      type="text"
                      name="search"
                      placeholder="Search Banners..."
                      value={filters.search}
                      onChange={handleFilterChange}
                    />
                  </Col>
                  <Col md={2} className="mb-2">
                    <Input
                      type="text"
                      name="banner_type"
                      placeholder="Banner Type..."
                      value={filters.banner_type}
                      onChange={handleFilterChange}
                    />
                  </Col>
                  <Col md={2} className="mb-2">
                    <Input
                      type="select"
                      name="is_active"
                      value={filters.is_active}
                      onChange={handleFilterChange}
                    >
                      <option value="">Status (All)</option>
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </Input>
                  </Col>
                  <Col md={2} className="mb-2">
                    <Input
                      type="select"
                      name="ordering"
                      value={filters.ordering}
                      onChange={handleFilterChange}
                    >
                      <option value="">Default Order</option>
                      <option value="position">Position Asc</option>
                      <option value="-position">Position Desc</option>
                    </Input>
                  </Col>
                  <Col md={3} className="d-flex align-items-center mb-2">
                    <div className="form-check form-switch form-switch-md" dir="ltr">
                      <Input
                        type="checkbox"
                        className="form-check-input"
                        id="active_only"
                        name="active_only"
                        checked={filters.active_only}
                        onChange={handleFilterChange}
                      />
                      <label className="form-check-label ms-2" htmlFor="active_only">
                        Live/Scheduled
                      </label>
                    </div>
                  </Col>
                </Row>

                {loading ? (
                  <div className="text-center">
                    <Spinner color="primary" />
                  </div>
                ) : (
                  <DataTable
                    columns={columns}
                    data={data}
                    pagination
                    highlightOnHover
                    striped
                    responsive
                    persistTableHead
                    paginationPerPage={10}
                    paginationRowsPerPageOptions={[5, 10, 20, 50]}
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

export default ListBanners;
