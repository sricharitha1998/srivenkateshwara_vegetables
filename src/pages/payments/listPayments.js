import React, { useEffect, useMemo, useState } from "react";
import { Card, CardBody, Col, Container, Row, Spinner } from "reactstrap";
import { Link } from "react-router-dom";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import DataTable from "react-data-table-component";

const API_BASE = process.env.REACT_APP_API_URL;

const ListPayments = () => {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [loading, setLoading] = useState(false);  // Loading state

  const breadcrumbItems = [
    { title: "Payments", link: "#" },
    { title: "List Payments", link: "#" },
  ];

  const getAuthHeaders = (accessToken) => ({
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  });

  const filteredData = async (e) => {
    const value = e.target.value;
    if (value) {
      const getvalues = await data.filter((item) =>
        item?.payment_id?.toLowerCase().includes(value?.toLowerCase())
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
    setLoading(true); 
    try {
      const response = await makeAuthenticatedRequest(`${API_BASE}/payments/`);
      if (!response.ok) throw new Error(`Fetch failed with status ${response.status}`);
      const result = await response.json();
      setData(result?.data || []);
    } catch (err) {
      console.error("Error fetching categories:", err.message);
    } finally {
      setLoading(false);  
    }
  };

  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const user = useMemo(() => JSON.parse(localStorage.getItem("user"))?.user || {}, []);

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
        name: "Payment ID",
        selector: row => row.payment_id,
        sortable: true,
      },
      {
        name: "User",
        selector: row => row.user_email,
        sortable: true,
      },
      {
        name: "Payment Date",
        selector: row => formatDate(row.payment_date),
        sortable: true,
      },
      {
        name: "Status",
        selector: row => row.status,
        sortable: true,
      },
    ];

    return cols;
  }, [data.length, currentPage, perPage]);

  useEffect(() => {
    fetchCategories();
  }, []);
console.log("data", data)
  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs title="List Payments" breadcrumbItems={breadcrumbItems} />
        <Row>
          <Col lg={12}>
            <Card>
              <CardBody>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h4 className="mb-0">Payments</h4>
                </div>

                <div className="d-flex justify-content-end mb-3">
                  <input
                    type="text"
                    className="form-control w-25"
                    placeholder="Search Payments"
                    onChange={(e) => filteredData(e)}
                  />
                </div>

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

export default ListPayments;
