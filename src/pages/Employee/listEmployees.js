import React, { useEffect, useState } from "react";
import { Card, CardBody, Col, Container, Row, Spinner, Input } from "reactstrap";
import { Link } from "react-router-dom";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import DataTable from "react-data-table-component";

const ListEmployees = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const breadcrumbItems = [
    { title: "Employee", link: "#" },
    { title: "List Employees", link: "#" },
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

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const result = await apiCall(`${process.env.REACT_APP_API_URL}/employees/`);
      const employees = Array.isArray(result?.data?.results) ? result.data?.results : (Array.isArray(result?.data?.data) ? result?.data?.data : []);
      setData(employees);
      setFilteredData(employees);
    } catch (error) {
      console.error("Fetch error:", error);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this employee?");
    if (!confirmDelete) return;

    try {
      await apiCall(`${process.env.REACT_APP_API_URL}/employees/${id}/`, "DELETE");
      fetchEmployees();
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete employee.");
    }
  };

  const handleSearch = (e) => {
    const keyword = e.target.value;
    setSearchTerm(keyword);

    if (keyword.trim() === "") {
      setFilteredData(data);
    } else {
      const filtered = data.filter((item) =>
        `${item.first_name} ${item.last_name}`.toLowerCase().includes(keyword.toLowerCase()) ||
        item.email.toLowerCase().includes(keyword.toLowerCase()) ||
        item.mobile.toLowerCase().includes(keyword.toLowerCase())
      );
      setFilteredData(filtered);
    }
  };

  const columns = [
    {
      name: "S.No",
      selector: (row, index) => index + 1,
      width: "80px",
    },
    {
      name: "Name",
      selector: (row) => `${row.first_name} ${row.last_name}`,
      sortable: true,
    },
    {
      name: "Email",
      selector: (row) => row.email,
      sortable: true,
    },
    {
      name: "Mobile",
      selector: (row) => row.mobile,
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <>
          <Link to={`/update-employee/${row.id}`} className="me-3 text-primary">
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
    fetchEmployees();
  }, []);

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs title="List Employees" breadcrumbItems={breadcrumbItems} />
        <Row>
          <Col lg={12}>
            <Card>
              <CardBody>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="card-title mb-0">Employees</h5>
                  <Link to="/add-employee" className="btn btn-primary">
                    <i className="mdi mdi-plus me-1" /> Add Employee
                  </Link>
                </div>

                {/* Search Input */}
                <Row className="mb-3">
                  <Col md={4} className="ms-auto">
                    <Input
                      type="text"
                      placeholder="Search Employees..."
                      value={searchTerm}
                      onChange={handleSearch}
                    />
                  </Col>
                </Row>

                {/* Loader */}
                {loading ? (
                  <div className="text-center">
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

export default ListEmployees;
