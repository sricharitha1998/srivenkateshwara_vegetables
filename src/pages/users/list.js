import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardBody,
  Col,
  Container,
  Row,
  Spinner,
} from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
// import TableContainer from "../../components/Common/TableContainer"; // Remove this
import DataTable from "react-data-table-component"; // Add this
import { Link } from "react-router-dom";

const ListUsers = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // loader state

  const breadcrumbItems = [
    { title: "Users", link: "#" },
    { title: "List Users", link: "#" },
  ];

  const fetchCategories = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      const accessToken = userData?.access;

      const response = await fetch("https://admin.veggafresh.com/be/api/v1/all-users/", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      setData(result?.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false); // stop loader
    }
  };

  const columns = useMemo(
    () => [
      {
        name: "No.",
        cell: (row, index) => data.length - index,
        sortable: false,
      },
      {
        name: "Name",
        selector: row => `${row.first_name} ${row.last_name}`,
        sortable: true,
      },
      {
        name: "Email",
        selector: row => row.email,
        sortable: true,
      },
      {
        name: "Mobile",
        selector: row => row.mobile,
        sortable: true,
      },
      {
        name: "Address",
        selector: row => row.address,
        sortable: true,
      },
      {
        name: "Date of Birth",
        selector: row => row.date_of_birth,
        sortable: true,
      },
    ],
    [data.length]
  );

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs title="List Users" breadcrumbItems={breadcrumbItems} />
        <Row>
          <Col lg={12}>
            <Card>
              <CardBody>
                {isLoading ? (
                  <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "300px" }}>
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

export default ListUsers;
