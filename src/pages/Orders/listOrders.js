import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Card, CardBody, Container, Modal, Spinner, ModalHeader, ModalBody, ModalFooter, Button, Input, FormGroup, Label, Row, Col } from "reactstrap";
import { Link } from "react-router-dom";
import Select from "react-select";
import TableContainer from "../../components/Common/TableContainer";
import Breadcrumbs from '../../components/Common/Breadcrumb';
import DataTable from "react-data-table-component";
import { DeliveryPartnersApi } from "../../redux/orders/ordersActions";
import { useDispatch } from "react-redux";

const ListOrders = () => {
  const [modal, setModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [getID, setID] = useState(null);
  const [deliveryInfo, setDeliveryInfo] = useState({ name: "", mobile: "", trackingLink: "" });
  const [data, setData] = useState([]);
  const [status, setStatus] = useState([]);
  const dispatch = useDispatch();
  const [deliveryList, setDeliveryList] = useState([]);
  const [isAddMode, setIsAddMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const statusOptions = [
    { label: "All", value: "1" },
    { label: "Accepted", value: "2" },
    { label: "Cancelled", value: "3" },
    { label: "Assign to Delivery Partner", value: "4" },
    { label: "Delivered", value: "5" },
  ];
  const [isNameInput, setIsNameInput] = useState(false);
  const [isMobileInput, setIsMobileInput] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [filters, setFilters] = useState({
    emailSearch: "",
    searchOrderID: "",
    fromDate: "",
    toDate: "",
  });


  const fetchDeliveryPersons = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      const accessToken = userData?.access;
      // console.log("accessToken", accessToken)
      // await dispatch(DeliveryPartnersApi(accessToken, dispatch));

      const response = await fetch("https://admin.veggafresh.com/be/api/v1/delivery-persons/", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();
      setDeliveryList(result?.data || []);
    } catch (err) {
      console.error("Error fetching delivery persons:", err);
    }
  };

  const toggleModal = () => {
    if (!modal) {
      fetchDeliveryPersons();
      setIsNameInput(false);
      setIsMobileInput(false);
      if (!isAddMode) {
        setDeliveryInfo((prev) => ({ ...prev, trackingLink: "" }));
      } else {
        setDeliveryInfo({ name: "", mobile: "", trackingLink: "", id: "" });
      }
    }
    setModal(!modal);

  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const handleSearch = async () => {
    setLoading(true);
    try {

      const userData = JSON.parse(localStorage.getItem("user"));
      const accessToken = userData?.access;

      const response = await fetch(`https://admin.veggafresh.com/be/api/v1/orders-filters?user_email=${filters?.emailSearch}&order_date_from=${filters?.fromDate}&order_date_to=${filters?.toDate}&order_id=${filters?.searchOrderID}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        setData(result?.data || []);
      } else {
        throw new Error("Failed to fetch statuses");
      }
    } catch (error) {
      console.error("Error fetching status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (e, id) => {
    const value = Number(e.target.value);
    setSelectedStatus({ id, status: value });
    setID(id);

    if (value === 3) toggleModal();
    else updateStatus({ status: value, }, id);
  };

  const handleDeliveryInputChange = (e) => {
    const { name, value } = e.target;
    setDeliveryInfo((prev) => ({ ...prev, [name]: value }));
  };

  const sendRequest = (accessToken, requestBody, id) => {
    return fetch(`https://admin.veggafresh.com/be/api/v1/orders/${id ? id : getID}/update-status/`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
  };

  const getUpdatedTokens = async (refreshToken) => {
    const response = await fetch("https://admin.veggafresh.com/be/api/v1/token/refresh/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) throw new Error("Session expired. Please login again.");
    const data = await response.json();
    return data?.data;
  };

  const updateStatus = async (requestBody, id) => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      let accessToken = userData?.access;

      if (!accessToken) {
        alert("Access token missing. Please log in.");
        return;
      }

      let response = await sendRequest(accessToken, requestBody, id);

      if (response.status === 401) {
        const newTokens = await getUpdatedTokens(userData?.refresh);
        accessToken = newTokens.access;
        userData.access = accessToken;
        userData.refresh = newTokens.refresh;
        localStorage.setItem("user", JSON.stringify(userData));
        response = await sendRequest(accessToken, requestBody);
      }

      if (response.ok) {
        window.location.reload();
      } else {
        const errorData = await response.json();
        console.error("Error:", errorData);
        alert("Failed to update order status.");
      }
    } catch (error) {
      console.error("Request failed:", error);
      alert("Something went wrong.");
    }
  };

  const fetchWithAuth = async (url, options) => {
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

  const SubmitDeliveryDetails = async () => {

    const payload = {
      name: deliveryInfo?.name,
      mobile: deliveryInfo?.mobile
    };

    return await fetchWithAuth(`https://admin.veggafresh.com/be/api/v1/delivery-persons/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }




  const handleDeliverySubmit = async (e) => {
    e.preventDefault();

    if (isAddMode) {
      const getDetail = await SubmitDeliveryDetails();
      const response = await getDetail.json()
      const requestBody = {
        status: 3,
        tracking_link: deliveryInfo?.trackingLink,
        delivery_person: response?.data?.id
      };

      updateStatus(requestBody);
    } else {
      const requestBody = {
        status: 3,
        tracking_link: deliveryInfo?.trackingLink,
        delivery_person: deliveryInfo?.id
      };

      updateStatus(requestBody);
    }


    toggleModal();
  };

  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const fetchOrders = async (type) => {
    setLoading(true);
    try {
      const userData = await JSON.parse(localStorage.getItem("user"));
      const accessToken = await userData?.access;
      let apiurl;
      if (type === "1") {
        apiurl = "https://admin.veggafresh.com/be/api/v1/orders/"
      } else if (type === "2") {
        apiurl = "https://admin.veggafresh.com/be/api/v1/orders/status/Accepted/"
      } else if (type === "3") {
        apiurl = "https://admin.veggafresh.com/be/api/v1/orders/status/Cancelled/"
      } else if (type === "4") {
        apiurl = "https://admin.veggafresh.com/be/api/v1/orders/status/Assigned to Delivery Partner/"
      } else if (type === "5") {
        apiurl = "https://admin.veggafresh.com/be/api/v1/orders/status/Delivered/"
      }
      const response = await fetch(apiurl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        setData(result?.data || []);
      } else {
        throw new Error("Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatus = async () => {
    setLoading(true);
    try {

      const userData = await JSON.parse(localStorage.getItem("user"));
      const accessToken = await userData?.access;

      const response = await fetch("https://admin.veggafresh.com/be/api/v1/order-status/", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        setStatus(result?.data || []);
      } else {
        throw new Error("Failed to fetch statuses");
      }
    } catch (error) {
      console.error("Error fetching status:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders("1");
    fetchStatus();
  }, []);

  const columns = useMemo(() => [
    {
      name: "No.",
      cell: (row, index) => index + 1,
      width: "70px",
    },
    {
      name: "Date",
      selector: (row) => row.created_at,
      cell: (row) => formatDate(row?.created_at),
      sortable: true,
    },
    {
      name: "Billing Person",
      selector: (row) => row.user,
      sortable: true,
    },
    {
      name: "Order Status",
      selector: (row) => row.status,
      sortable: true,
    },
    {
      name: "Payment Amount",
      selector: (row) => row.payment_amount,
      sortable: true,
    },
    {
      name: "Payment Status",
      selector: (row) => row.payment_status,
      sortable: true,
    },
    {
      name: "Status",
      cell: (row) => (
        <div className="d-flex align-items-center gap-2">
          <select
            className="form-select"
            onChange={(e) => handleStatusChange(e, row?.id)}
            value={selectedStatus?.id === row.id ? selectedStatus.status : ""}
          >
            <option value="">Select</option>
            {status
              .filter((item) => {
                const userPermissions = JSON.parse(localStorage.getItem("user"))?.user;
                switch (item.name) {
                  case "Delivered":
                    return userPermissions?.is_superadmin || userPermissions?.permissions?.can_update_delivery_status;
                  case "Accepted":
                    return userPermissions?.is_superadmin || userPermissions?.permissions?.can_accept_orders;
                  default:
                    return true;
                }
              })
              .map((item, index) => (
                <option key={index} value={item.id}>
                  {item.name}
                </option>
              ))}
          </select>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ], [selectedStatus, status]);


  const breadcrumbItems = [
    { title: "Ecommerce", link: "/" },
    { title: "Orders", link: "#" },
  ];
  console.log("deliveryInfo", deliveryInfo)
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Orders" breadcrumbItems={breadcrumbItems} />
          <Card>
            <CardBody>
              <FormGroup className="mb-3" style={{ maxWidth: 300 }}>
                <Label for="statusFilter">Filter by Status</Label>
                <Input
                  type="select"
                  name="statusFilter"
                  id="statusFilter"
                  // value={statusFilter}
                  onChange={(e) => fetchOrders(e.target.value)}
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </Input>
              </FormGroup>


              <FormGroup className="mb-3" style={{ maxWidth: 700 }}>
                <Row className="mb-2">
                  <Col md={6}>
                    <Label for="emailSearch">Email</Label>
                    <Input
                      type="text"
                      name="emailSearch"
                      id="emailSearch"
                      placeholder="Enter Email"
                      value={filters.emailSearch}
                      onChange={handleChange}
                    />
                  </Col>
                  <Col md={6}>
                    <Label for="searchOrderID">Order ID</Label>
                    <Input
                      type="text"
                      name="searchOrderID"
                      id="searchOrderID"
                      placeholder="Enter Order ID"
                      value={filters.searchOrderID}
                      onChange={handleChange}
                    />
                  </Col>
                </Row>

                <Row className="mb-2">
                  <Col md={6}>
                    <Label for="fromDate">From Date</Label>
                    <Input
                      type="date"
                      name="fromDate"
                      id="fromDate"
                      value={filters.fromDate}
                      onChange={handleChange}
                    />
                  </Col>
                  <Col md={6}>
                    <Label for="toDate">To Date</Label>
                    <Input
                      type="date"
                      name="toDate"
                      id="toDate"
                      value={filters.toDate}
                      onChange={handleChange}
                    />
                  </Col>
                </Row>

                <Button color="primary" onClick={handleSearch}>
                  Search
                </Button>
              </FormGroup>


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

      {/* Assign Delivery Modal */}
      <Modal isOpen={modal} toggle={toggleModal}>
        <ModalHeader toggle={toggleModal}>
          {isAddMode ? "Add Delivery Person" : "Assign Delivery Partner"}
          {/* <Button color="primary" size="sm" className="float-end" onClick={() => setIsAddMode(!isAddMode)}>
      {isAddMode ? "Select Delivery Person" : "Add Delivery Person"}
    </Button> */}
        </ModalHeader>
        <ModalBody>
          {isAddMode ? (
            <>
              <FormGroup>
                <Label>Name</Label>
                <Input
                  name="name"
                  value={deliveryInfo.name}
                  onChange={handleDeliveryInputChange}
                />
              </FormGroup>
              <FormGroup>
                <Label>Mobile</Label>
                <Input
                  name="mobile"
                  value={deliveryInfo.mobile}
                  onChange={handleDeliveryInputChange}
                />
              </FormGroup>
            </>
          ) : (
            <>
              <FormGroup>
                <Label>Name</Label>
                {isNameInput ? (
                  <Input
                    type="text"
                    name="name"
                    value={deliveryInfo.name}
                    onChange={handleDeliveryInputChange}
                    placeholder="Enter delivery partner name"
                  />
                ) : (
                  <Select
                    options={deliveryList.map(d => ({ label: d.name, value: d.id }))}
                    onInputChange={(inputValue) => {
                      const filtered = deliveryList.filter(d =>
                        d.name.toLowerCase().includes(inputValue.toLowerCase())
                      );
                      setFilteredOptions(filtered);

                      // Update deliveryInfo immediately with typed value
                      setDeliveryInfo((prev) => ({
                        ...prev,
                        name: inputValue,
                        id: '', // Clear id when typing manually
                      }));

                      if (filtered.length === 0) {
                        setIsNameInput(true);
                      } else {
                        setIsNameInput(false);
                      }
                    }}
                    value={deliveryList
                      .map((person) => ({
                        label: person.name,
                        value: person.id,
                        mobile: person.mobile,
                      }))
                      .find((opt) => opt.value === deliveryInfo.id)}
                    onChange={(selectedOption) => {
                      setDeliveryInfo((prev) => ({
                        ...prev,
                        name: selectedOption.label,
                        id: selectedOption.value,
                        mobile: selectedOption.mobile,
                      }));
                      setIsAddMode(false);
                      // Because selected existing partner
                    }}
                    placeholder="Search delivery partner name"
                  />

                )}
              </FormGroup>

              <FormGroup>
                <Label>Mobile Number</Label>
                {isMobileInput ? (
                  <Input
                    type="text"
                    name="mobile"
                    value={deliveryInfo.mobile}
                    onChange={handleDeliveryInputChange}
                    placeholder="Enter mobile number"
                  />
                ) : (
                  <Select
                    options={deliveryList.map(d => ({ label: d.mobile, value: d.id }))}
                    value={deliveryList
                      .map((person) => ({
                        label: person.mobile,
                        value: person.id,
                        name: person.name,
                      }))
                      .find((opt) => opt.value === deliveryInfo.id)}

                    onInputChange={(inputValue) => {
                      const filtered = deliveryList.filter(d =>
                        d.mobile.includes(inputValue)
                      );
                      setFilteredOptions(filtered);

                      // Update deliveryInfo immediately with typed mobile number
                      setDeliveryInfo((prev) => ({
                        ...prev,
                        mobile: inputValue,
                        id: '', // Clear id when typing manually
                      }));

                      if (filtered.length === 0) {
                        setIsMobileInput(true);
                      } else {
                        setIsMobileInput(false);
                      }
                    }}
                    onChange={(selectedOption) => {
                      setDeliveryInfo((prev) => ({
                        ...prev,
                        mobile: selectedOption.label,
                        id: selectedOption.value,
                      }));
                      setIsAddMode(false); // Because selected existing partner
                    }}
                    placeholder="Search delivery partner mobile"
                  />

                )}
              </FormGroup>
            </>
          )}
          <FormGroup>
            <Label>Tracking Link</Label>
            <Input
              name="trackingLink"
              value={deliveryInfo.trackingLink}
              onChange={handleDeliveryInputChange}
            />
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleDeliverySubmit}>Assign</Button>
          <Button color="secondary" onClick={toggleModal}>Cancel</Button>
        </ModalFooter>
      </Modal>

    </React.Fragment>
  );
};

export default ListOrders;
