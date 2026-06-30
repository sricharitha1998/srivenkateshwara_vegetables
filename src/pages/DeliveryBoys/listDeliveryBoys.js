import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardBody,
  Container,
  Button,
  Spinner,
  Alert,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormGroup,
  Label,
  Input,
  Row,
  Col,
} from "reactstrap";
import DataTable from "react-data-table-component";
import Breadcrumbs from "../../components/Common/Breadcrumb";

const ListDeliveryBoys = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    mobile: "",
  });

  const getAuthHeaders = () => {
    const userData = JSON.parse(localStorage.getItem("user"));
    return {
      Authorization: `Bearer ${userData?.access}`,
      "Content-Type": "application/json",
    };
  };

  const getUpdatedTokens = async (refreshToken) => {
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/token/refresh/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: refreshToken }),
      }
    );

    if (!response.ok) throw new Error("Session expired. Please login again.");
    const data = await response.json();
    return data?.data;
  };

  const fetchWithAuth = async (url, options = {}) => {
    const userData = JSON.parse(localStorage.getItem("user"));
    let accessToken = userData?.access;

    let response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.status === 401) {
      const newTokens = await getUpdatedTokens(userData?.refresh);
      userData.access = newTokens.access;
      userData.refresh = newTokens.refresh;
      localStorage.setItem("user", JSON.stringify(userData));

      response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${newTokens.access}`,
        },
      });
    }

    return response;
  };

  const fetchDeliveryBoys = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchWithAuth(
        `${process.env.REACT_APP_API_URL}/admin/delivery-persons/`,
        {
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        const errorMsg = errorData?.message || `Error: ${response.status} ${response.statusText}`;
        throw new Error(errorMsg);
      }
      
      const result = await response.json();
      console.log("Delivery boys fetched:", result);

      // Normalize API response so `data` is always an array for the table
      let deliveryBoysArray = [];
      if (Array.isArray(result)) {
        deliveryBoysArray = result;
      } else if (Array.isArray(result?.data?.results)) {
        deliveryBoysArray = result.data.results;
      } else if (Array.isArray(result?.data)) {
        deliveryBoysArray = result.data;
      } else if (Array.isArray(result?.results)) {
        deliveryBoysArray = result.results;
      }

      setData(deliveryBoysArray);
    } catch (err) {
      const errorMsg = err?.message || "Failed to fetch delivery boys";
      setError(errorMsg);
      console.error("Error fetching delivery boys:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveryBoys();
  }, []);

  const handleEdit = (row) => {
    setEditingId(row.id);
    setEditFormData({
      name: row.name,
      mobile: row.mobile,
    });
    setEditModal(true);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveEdit = async () => {
    setError(null);
    setSuccess(null);

    try {
      const response = await fetchWithAuth(
        `${process.env.REACT_APP_API_URL}/delivery-persons/${editingId}/`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify(editFormData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        const errorMsg = errorData?.message || `Error: ${response.status} ${response.statusText}`;
        throw new Error(errorMsg);
      }

      setSuccess("Delivery boy updated successfully!");
      setEditModal(false);
      await fetchDeliveryBoys();
    } catch (err) {
      const errorMsg = err?.message || "Failed to update delivery boy";
      setError(errorMsg);
      console.error("Error updating delivery boy:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this delivery boy?"))
      return;

    setError(null);
    try {
      const response = await fetchWithAuth(
        `${process.env.REACT_APP_API_URL}/delivery-persons/${id}/`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        const errorMsg = errorData?.message || `Error: ${response.status} ${response.statusText}`;
        throw new Error(errorMsg);
      }
      
      setSuccess("Delivery boy deleted successfully!");
      await fetchDeliveryBoys();
    } catch (err) {
      const errorMsg = err?.message || "Failed to delete delivery boy";
      setError(errorMsg);
      console.error("Error deleting delivery boy:", err);
    }
  };

  const columns = [
    {
      name: "No.",
      cell: (row, index) => index + 1,
      width: "70px",
    },
    {
      name: "Name",
      selector: (row) => row.name,
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
        <div className="d-flex gap-2">
          <Button
            size="sm"
            color="warning"
            onClick={() => handleEdit(row)}
          >
            Edit
          </Button>
          <Button
            size="sm"
            color="danger"
            onClick={() => handleDelete(row.id)}
          >
            Delete
          </Button>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      width: "150px",
    },
  ];

  const breadcrumbItems = [
    { title: "Dashboard", link: "/" },
    { title: "Delivery Boys", link: "#" },
  ];

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Delivery Boys" breadcrumbItems={breadcrumbItems} />

          {error && <Alert color="danger">{error}</Alert>}
          {success && <Alert color="success">{success}</Alert>}

          <Card>
            <CardBody>
              <div className="mb-3">
                <Link to="/add-delivery-boy">
                  <Button color="primary">Add Delivery Boy</Button>
                </Link>
              </div>

              {loading ? (
                <div className="text-center py-5">
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
                  paginationPerPage={10}
                />
              )}
            </CardBody>
          </Card>
        </Container>
      </div>

      <Modal isOpen={editModal} toggle={() => setEditModal(!editModal)}>
        <ModalHeader toggle={() => setEditModal(!editModal)}>
          Edit Delivery Boy
        </ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label for="edit-name">Name</Label>
            <Input
              type="text"
              name="name"
              id="edit-name"
              value={editFormData.name}
              onChange={handleEditInputChange}
            />
          </FormGroup>
          <FormGroup>
            <Label for="edit-mobile">Mobile</Label>
            <Input
              type="tel"
              name="mobile"
              id="edit-mobile"
              value={editFormData.mobile}
              onChange={handleEditInputChange}
            />
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleSaveEdit}>
            Save
          </Button>
          <Button color="secondary" onClick={() => setEditModal(false)}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </React.Fragment>
  );
};

export default ListDeliveryBoys;
