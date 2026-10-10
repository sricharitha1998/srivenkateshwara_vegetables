import React, { useEffect, useMemo, useState } from "react";
import { Card, CardBody, Container, Modal, Spinner, ModalHeader, ModalBody, ModalFooter, Button, Input, FormGroup, Label, Row, Col } from "reactstrap";
import { Link } from "react-router-dom";
import Select from "react-select";
import { jsPDF } from "jspdf";
import { customSelectStyles } from "../../helpers/customStyles";
import Breadcrumbs from '../../components/Common/Breadcrumb';
import DataTable from "react-data-table-component";

const ListOrders = () => {
  const [modal, setModal] = useState(false);
  const [orderDetailsModal, setOrderDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deliveryInfo, setDeliveryInfo] = useState({ name: "", mobile: "", trackingLink: "" });
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [status, setStatus] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [deliveryList, setDeliveryList] = useState([]);
  const [deliveryPersonsLoading, setDeliveryPersonsLoading] = useState(false);
  const [deliveryPersonsError, setDeliveryPersonsError] = useState(null);
  const [assignOrderId, setAssignOrderId] = useState(null);
  const [isAddMode, setIsAddMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isNameInput, setIsNameInput] = useState(false);
  const [isMobileInput, setIsMobileInput] = useState(false);
  const [filters, setFilters] = useState({
    emailSearch: "",
    searchOrderID: "",
    fromDate: "",
    toDate: "",
  });
  const [deliverySlots, setDeliverySlots] = useState([]);
  const [selectedDeliveryDate, setSelectedDeliveryDate] = useState("");
  const [selectedDeliverySlot, setSelectedDeliverySlot] = useState(null);

  // Helper function to get base URL for admin endpoints
 const getAdminBaseUrl = () => {
  return process.env.REACT_APP_API_URL;
};

  const fetchDeliveryPersons = async () => {
    setDeliveryPersonsLoading(true);
    setDeliveryPersonsError(null);
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      const accessToken = userData?.access;

      if (!accessToken) {
        setDeliveryPersonsError("Access token missing. Please log in again.");
        return;
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL}/admin/delivery-persons/?page_no=1&page_size=100`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData?.message || `Failed to fetch delivery persons: ${response.status} ${response.statusText}`;
        throw new Error(errorMsg);
      }

      const result = await response.json();

      let persons = [];
      if (Array.isArray(result?.data?.results)) {
        persons = result.data.results;
      } else if (Array.isArray(result?.data?.data)) {
        persons = result.data.data;
      } else if (Array.isArray(result?.data)) {
        persons = result.data;
      } else if (Array.isArray(result?.results)) {
        persons = result.results;
      } else if (Array.isArray(result)) {
        persons = result;
      }

      setDeliveryList(persons);
    } catch (err) {
      setDeliveryPersonsError(err?.message || "Failed to fetch delivery persons");
      console.error("Error fetching delivery persons:", err);
    } finally {
      setDeliveryPersonsLoading(false);
    }
  };

  const fetchDeliverySlots = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      const accessToken = userData?.access;
      const response = await fetch(
  `${process.env.REACT_APP_API_URL}/admin/delivery-slots/`,
  {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  }
);
      if (response.ok) {
        const result = await response.json();
        const slots = Array.isArray(result?.data?.results)
          ? result.data.results
          : Array.isArray(result?.data)
            ? result.data
            : [];
        setDeliverySlots(slots);
console.log("Delivery Slots =>", slots);

       return slots;
      } else {
        console.error("Failed to fetch delivery slots");
        return [];
      }
    } catch (err) {
     console.error("Error fetching delivery slots:", err);
      return [];
    }
  }; 


  const toggleModal = async (order = null) => {

    if (!modal) {
        await fetchDeliveryPersons();
        const slots = await fetchDeliverySlots();

        setIsNameInput(false);
        setIsMobileInput(false);
        setSelectedDeliveryDate("");
        setSelectedDeliverySlot(null);

        if (!isAddMode) {
            setDeliveryInfo(prev => ({
                ...prev,
                trackingLink: ""
            }));
        } else {
            setDeliveryInfo({
                name: "",
                mobile: "",
                trackingLink: "",
                id: ""
            });
        }
    }

    if (order) {

        console.log("ORDER", order);

        setAssignOrderId(order.order_id);
        setSelectedOrder(order);
        if (order.delivery_date) {
            setSelectedDeliveryDate(order.delivery_date);
        }

        const dp = order.delivery_person;

        if (dp && typeof dp === "object") {
            setDeliveryInfo(prev => ({
                ...prev,
                name: dp.name || "",
                mobile: dp.mobile || "",
                id: dp.id || ""
            }));
        } else if (typeof dp === "string") {
            setDeliveryInfo(prev => ({
                ...prev,
                name: dp,
                id: ""
            }));
        } else {
            setDeliveryInfo(prev => ({
                ...prev,
                id: ""
            }));
        }

        

    } else {
        setAssignOrderId(null);
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

  const handleSearch = async (page = 1, limit = perPage) => {
    setLoading(true);
    setIsSearching(true);
    if (page === 1 && currentPage !== 1) setCurrentPage(1);
    try {

      const userData = JSON.parse(localStorage.getItem("user"));
      const accessToken = userData?.access;

      const response = await fetch(`${process.env.REACT_APP_API_URL}/orders-filters?user_email=${filters?.emailSearch}&order_date_from=${filters?.fromDate}&order_date_to=${filters?.toDate}&order_id=${filters?.searchOrderID}&page_no=${page}&page_size=${limit}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        const items = Array.isArray(result?.data?.results) ? result.data.results : (Array.isArray(result?.data?.data) ? result?.data?.data : (Array.isArray(result?.data) ? result.data : []));
        const count = result?.data?.count ?? result?.count ?? result?.data?.total ?? result?.total ?? result?.data?.total_rows ?? items.length;
        setData(items);
        setTotalRows(count);
      } else {
        throw new Error("Failed to fetch statuses");
      }
    } catch (error) {
      console.error("Error fetching status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeliveryInputChange = (e) => {
    const { name, value } = e.target;
    setDeliveryInfo((prev) => ({ ...prev, [name]: value }));
  };

  const getUpdatedTokens = async (refreshToken) => {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) throw new Error("Session expired. Please login again.");
    const data = await response.json();
    return data?.data;
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

    return await fetchWithAuth(`${process.env.REACT_APP_API_URL}/delivery-persons/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }




  const handleDeliverySubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!assignOrderId) {
      alert("Order ID is missing");
      return;
    }

    if (!deliveryInfo?.id && !isAddMode) {
      alert("Please select a delivery person");
      return;
    }

    if (!selectedDeliverySlot) {
      alert("Delivery slot is not assigned to this order");
      return;
    }

    if (!selectedDeliveryDate) {
      alert("Delivery date is not assigned to this order");
      return;
    }

    try {
      let deliveryPersonId = deliveryInfo?.id;

      // If adding new delivery person, create them first
      if (isAddMode) {
        const createResponse = await SubmitDeliveryDetails();
        if (!createResponse.ok) {
          throw new Error("Failed to create delivery person");
        }
        const responseData = await createResponse.json();
        deliveryPersonId = responseData?.data?.id;
      }

      // Now assign delivery to order using correct endpoint
      const baseUrl = getAdminBaseUrl();
      const assignPayload = {
        order_id: String(assignOrderId),
        delivery_slot_id: Number(selectedDeliverySlot.id),
        delivery_person_id: Number(deliveryPersonId),
        delivery_date: selectedDeliveryDate,
      };
      console.log("Assign Payload", assignPayload);
console.log("Selected Delivery Slot", selectedDeliverySlot);

      const assignResponse = await fetchWithAuth(`${baseUrl}/admin/assign-delivery/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assignPayload),
      });

      if (assignResponse.ok) {
        alert("Delivery assigned successfully!");
        // Refresh the orders list
        if (isSearching) {
          await handleSearch(currentPage, perPage);
        } else {
          await fetchOrders(selectedFilter, currentPage, perPage);
        }
        toggleModal();
        
      } else {
        const errorData = await assignResponse.json();
        console.error("Assignment error:", errorData);
        alert("Failed to assign delivery: " + (errorData?.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error during delivery assignment:", error);
      alert("Something went wrong: " + error.message);
    }
  };

  const downloadBill = (order) => {
    const items = Array.isArray(order?.items) ? order.items : [];
    const total = order?.final_amount ?? order?.payment_amount ?? 0;
    const gst = order?.gst_amount ?? order?.tax_amount ?? order?.gst ?? 0;
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 14;
    const contentWidth = pageWidth - margin * 2;
    const pageHeight = pdf.internal.pageSize.getHeight();
    const lineHeight = 4.5;
    let y = 16;

    const numberToWords = (value) => {
      const smallNumbers = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
      const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
      const number = Math.floor(value);

      if (number < 20) return smallNumbers[number];
      if (number < 100) return `${tens[Math.floor(number / 10)]}${number % 10 ? ` ${smallNumbers[number % 10]}` : ""}`;
      if (number < 1000) return `${smallNumbers[Math.floor(number / 100)]} Hundred${number % 100 ? ` ${numberToWords(number % 100)}` : ""}`;

      const groups = [[10000000, "Crore"], [100000, "Lakh"], [1000, "Thousand"]];
      const group = groups.find(([divisor]) => number >= divisor);
      if (group) {
        const [divisor, label] = group;
        const remainder = number % divisor;
        return `${numberToWords(Math.floor(number / divisor))} ${label}${remainder ? ` ${numberToWords(remainder)}` : ""}`;
      }

      return "Zero";
    };

    const totalValue = Number(total) || 0;
    let wholeRupees = Math.floor(Math.abs(totalValue));
    let paise = Math.round((Math.abs(totalValue) - wholeRupees) * 100);
    if (paise === 100) {
      wholeRupees += 1;
      paise = 0;
    }
    const amountInWords = `${totalValue < 0 ? "Minus " : ""}${numberToWords(wholeRupees)} Rupees${paise ? ` and ${numberToWords(paise)} Paise` : ""} Only`;
    pdf.setFontSize(8);
    pdf.setFont(undefined, "bold");
    const amountWordsLines = pdf.splitTextToSize(`Total Amount in Words: ${amountInWords}`, contentWidth - 8);
    const amountWordsHeight = Math.max(12, amountWordsLines.length * 4 + 6);

    const drawTableHeader = () => {
      const columnWidths = [10, 47, 12, 25, 30, 34, contentWidth - 158];
      const headings = [
        "S No",
        "Description of Item",
        "Qty",
        "Unit Price",
        "Taxable Amount",
        "Tax Rate (CGST+SGST+IGST)%",
        "Total Amount",
      ];
      const wrappedHeadings = headings.map((heading, index) =>
        pdf.splitTextToSize(heading, columnWidths[index] - 4)
      );
      const headerHeight = Math.max(12, ...wrappedHeadings.map((lines) => lines.length * 3.5 + 5));
      let x = margin;
      pdf.setFontSize(7);
      pdf.setFont(undefined, "bold");
      pdf.setTextColor(25, 25, 25);
      wrappedHeadings.forEach((lines, index) => {
        pdf.setFillColor(235, 238, 240);
        pdf.rect(x, y, columnWidths[index], headerHeight, "F");
        pdf.setDrawColor(80, 80, 80);
        pdf.rect(x, y, columnWidths[index], headerHeight, "S");
        pdf.text(lines, x + 2, y + 4);
        x += columnWidths[index];
      });
      pdf.setFont(undefined, "normal");
      return { columnWidths, headerHeight };
    };

    pdf.setFontSize(18);
    pdf.setFont(undefined, "bold");
    pdf.text("VEGGA FRESH", margin, y);
    pdf.setFontSize(12);
    pdf.text("Tax Invoice", margin, y + 7);

    const metaX = pageWidth - 78;
    pdf.setFontSize(9);
    pdf.setFont(undefined, "normal");
    pdf.text(`Order ID: ${order?.order_id || "-"}`, metaX, y - 1);
    pdf.text(`Date: ${order?.created_at ? formatDate(order.created_at) : new Date().toLocaleDateString("en-IN")}`, metaX, y + 6);
    y += 13;
    pdf.setDrawColor(80, 80, 80);
    pdf.line(margin, y, pageWidth - margin, y);
    y += 7;

    const addressWidth = (contentWidth - 6) / 2;
    const billingLines = [
      "VEGGA FRESH",
      "H No.13-6-448/1, Sai Nagar Colony",
      "Behind Vegetable Market, Guddimalkapur",
      "Hyderabad, Telangana - 500028",
      "GSTIN: 36DROPP2943D1ZJ",
    ];
    const address = order?.address || {};
    const customerLines = [
      String(order?.user || address.full_name || "-"),
      String(address.mobile || "-"),
      String(address.address_line1 || "-"),
      ...(address.address_line2 ? [String(address.address_line2)] : []),
      `${address.city || "-"}, ${address.state || "-"} - ${address.pincode || "-"}`,
    ];
    const addressBoxHeight = 38;
    [
      { x: margin, title: "Billing Address", lines: billingLines },
      { x: margin + addressWidth + 6, title: "Customer", lines: customerLines },
    ].forEach((section) => {
      pdf.rect(section.x, y, addressWidth, addressBoxHeight);
      pdf.setFontSize(9);
      pdf.setFont(undefined, "bold");
      pdf.text(section.title, section.x + 3, y + 5);
      pdf.setFontSize(8);
      pdf.setFont(undefined, "normal");
      const wrappedLines = section.lines.flatMap((line) => pdf.splitTextToSize(line, addressWidth - 6));
      pdf.text(wrappedLines, section.x + 3, y + 10);
    });
    y += addressBoxHeight + 8;

    let { columnWidths, headerHeight } = drawTableHeader();
    y += headerHeight;
    pdf.setFontSize(8);
    (items.length ? items : [{}]).forEach((item, index) => {
      const quantity = Number(item.quantity) || 0;
      const unitPrice = Number(item.unit_price ?? item.price ?? 0) || 0;
      const effectiveUnitPrice = Number(item.discounted_price ?? item.unit_price ?? item.price ?? 0) || 0;
      const cgstRate = Number(item.cgst_rate ?? item.cgst_percentage ?? item.cgst_percent ?? 0) || 0;
      const sgstRate = Number(item.sgst_rate ?? item.sgst_percentage ?? item.sgst_percent ?? 0) || 0;
      const igstRate = Number(item.igst_rate ?? item.igst_percentage ?? item.igst_percent ?? 0) || 0;
      const taxableAmount = Number(item.taxable_amount ?? item.taxableAmount ?? effectiveUnitPrice * quantity);
      const calculatedTax = taxableAmount * (cgstRate + sgstRate + igstRate) / 100;
      const hasComponentTaxAmounts = item.cgst_amount != null || item.sgst_amount != null || item.igst_amount != null;
      const componentTax = Number(item.cgst_amount || 0) + Number(item.sgst_amount || 0) + Number(item.igst_amount || 0);
      const itemTax = Number(item.tax_amount ?? item.gst_amount ?? (hasComponentTaxAmounts ? componentTax : calculatedTax));
      const totalAmount = Number(item.total_amount ?? item.total ?? (taxableAmount + itemTax));
      const values = [
        String(index + 1),
        [item.product_name, item.product_variant].filter(Boolean).join(" - ") || "No items available",
        String(item.quantity ?? "-"),
        `INR ${unitPrice.toFixed(2)}`,
        `INR ${taxableAmount.toFixed(2)}`,
        `${cgstRate}+${sgstRate}+${igstRate}%`,
        `INR ${totalAmount.toFixed(2)}`,
      ];
      const wrappedValues = values.map((value, valueIndex) =>
        pdf.splitTextToSize(value, columnWidths[valueIndex] - 4)
      );
      const rowHeight = Math.max(9, ...wrappedValues.map((lines) => lines.length * lineHeight + 4));

      if (y + rowHeight > pageHeight - 24) {
        pdf.addPage();
        y = 16;
        ({ columnWidths, headerHeight } = drawTableHeader());
        y += headerHeight;
      }

      let x = margin;
      values.forEach((value, valueIndex) => {
        pdf.rect(x, y, columnWidths[valueIndex], rowHeight);
        pdf.text(wrappedValues[valueIndex], x + 2, y + 5);
        x += columnWidths[valueIndex];
      });
      y += rowHeight;
    });

    const totalsHeight = 18;
    const signatureHeight = 36;
    const finalBlockHeight = 7 + totalsHeight + 5 + amountWordsHeight + 5 + signatureHeight;
    if (y + finalBlockHeight > pageHeight - margin) {
      pdf.addPage();
      y = 16;
    } else {
      y += 7;
    }
    const totalsWidth = 64;
    const totalsX = pageWidth - margin - totalsWidth;
    pdf.rect(totalsX, y, totalsWidth, totalsHeight);
    pdf.line(totalsX, y + 9, pageWidth - margin, y + 9);
    pdf.setFontSize(9);
    pdf.setFont(undefined, "bold");
    pdf.text(`GST: INR ${gst}`, totalsX + 3, y + 6);
    pdf.text(`Total: INR ${total}`, totalsX + 3, y + 15);
    y += totalsHeight + 5;

    pdf.rect(margin, y, contentWidth, amountWordsHeight);
    pdf.setFontSize(8);
    pdf.setFont(undefined, "bold");
    pdf.text(amountWordsLines, margin + 4, y + 5);
    y += amountWordsHeight + 5;

    const signatureGap = 8;
    const signatureWidth = (contentWidth - signatureGap) / 2;
    [
      { x: margin, label: "Customer / Consumer Signature" },
      { x: margin + signatureWidth + signatureGap, label: "Authorized Owner Signature" },
    ].forEach((signature) => {
      pdf.rect(signature.x, y, signatureWidth, signatureHeight);
      pdf.setFontSize(8);
      pdf.setFont(undefined, "normal");
      pdf.text(signature.label, signature.x + 3, y + 6);
      pdf.line(signature.x + 3, y + signatureHeight - 6, signature.x + signatureWidth - 3, y + signatureHeight - 6);
    });
    pdf.save(`bill-${order?.order_id || "order"}.pdf`);
  };

  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const fetchOrders = async (type = selectedFilter, page = currentPage, limit = perPage) => {
    setLoading(true);
    setSelectedFilter(type);
    if (type !== selectedFilter || page === 1) setIsSearching(false);
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      const accessToken = userData?.access;
      let apiurl = `${process.env.REACT_APP_API_URL}/orders/?page_no=${page}&page_size=${limit}`;

      if (type && type !== "all") {
        apiurl = `${process.env.REACT_APP_API_URL}/orders/status/${encodeURIComponent(type)}/?page_no=${page}&page_size=${limit}`;
      }

      const response = await fetch(apiurl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        const items = Array.isArray(result?.data?.results) ? result.data.results : (Array.isArray(result?.data?.data) ? result?.data?.data : (Array.isArray(result?.data) ? result.data : []));
        const count = result?.data?.count ?? result?.count ?? result?.data?.total ?? result?.total ?? result?.data?.total_rows ?? items.length;
        setData(items);
        setTotalRows(count);
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
      const userData = JSON.parse(localStorage.getItem("user"));
      const accessToken = userData?.access;

      const response = await fetch(`${process.env.REACT_APP_API_URL}/order-statuses/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        const statusData = result?.data?.status_options;
        setStatus(
          Array.isArray(statusData)
            ? statusData
            : statusData && typeof statusData === "object"
              ? Object.values(statusData)
              : []
        );
      } else {
        throw new Error("Failed to fetch statuses");
      }
    } catch (error) {
      console.error("Error fetching status:", error);
    } finally {
      setLoading(false);
    }
  };

  const openOrderModal = (order) => {
    setSelectedOrder(order);
    setOrderDetailsModal(true);
  };

  const closeOrderModal = () => {
    setSelectedOrder(null);
    setOrderDetailsModal(false);
  };

  useEffect(() => {
    if (isSearching) {
      handleSearch(currentPage, perPage);
    } else {
      fetchOrders(selectedFilter, currentPage, perPage);
    }
  }, [currentPage, perPage]);

  useEffect(() => {
    if (!modal || !selectedOrder || deliverySlots.length === 0) return;

    const slot = deliverySlots.find(
    s =>
        Number(s.id) === Number(selectedOrder.delivery_schedule_id) ||
        s.name === selectedOrder.delivery_slot_name
);

if (slot) {
    setSelectedDeliverySlot(slot);
}
}, [modal, selectedOrder, deliverySlots]);

  const columns = useMemo(() => [
    {
      name: "No.",
      cell: (row, index) => (currentPage - 1) * perPage + (index + 1),
      width: "70px",
    },
    {
      name: "Order ID",
      selector: (row) => row.order_id,
      sortable: true,
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
      name: "Payment Method",
      selector: (row) => row.payment_method,
      sortable: true,
    },
    {
      name: "Order Status",
      selector: (row) => row.status,
      sortable: true,
    },
    {
      name: "Payment Amount",
      selector: (row) => row.final_amount || row.payment_amount,
      sortable: true,
    },
    // {
    //   name: "Payment Status",
    //   selector: (row) => row.payment_status,
    //   sortable: true,
    // },
    {
      name: "Actions",
      cell: (row) => {
        return (
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <Button size="sm" color="info" onClick={() => openOrderModal(row)}>
              View
            </Button>
            <Button size="sm" color="primary" onClick={() => toggleModal(row)}>
              Assign
            </Button>
          </div>
        );
      },
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      minWidth: "170px",
    },
  ], []);


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
                  value={selectedFilter}
                  onChange={(e) => fetchOrders(e.target.value)}
                >
                  <option value="all">All</option>
                  {Array.isArray(status) && status.map((statusItem) => (
                    <option key={statusItem.id} value={statusItem.name}>
                      {statusItem.name}
                    </option>
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


              {/* Data Table handles own loading state */}
              <DataTable
                columns={columns}
                data={data}
                pagination
                paginationServer
                paginationTotalRows={totalRows}
                paginationPerPage={perPage}
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
        </Container>
      </div>

      <Modal isOpen={orderDetailsModal} toggle={closeOrderModal} size="lg">
        <ModalHeader toggle={closeOrderModal}>Order Details</ModalHeader>
        <ModalBody>
          {selectedOrder && (
            <>
              <div className="mb-3">
                <strong>Order ID:</strong> {selectedOrder.order_id}
              </div>
              <div className="mb-3">
                <strong>Status:</strong> {selectedOrder.status}
                <span className="ms-3">
                  <strong>Payment Status:</strong> {selectedOrder.payment_status}
                </span>
              </div>
              <div className="mb-3">
                <strong>Payment Method:</strong> {selectedOrder.payment_method}
              </div>
              <div className="mb-3">
                <strong>Final Amount:</strong> {selectedOrder.final_amount || selectedOrder.payment_amount}
              </div>
              <div className="mb-3">
                <strong>Delivery Person:</strong> {selectedOrder.delivery_person?.name || "Not assigned"}
              </div>

              <div className="mb-3">
                <h5>Items</h5>
                {selectedOrder.items?.length ? (
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Product</th>
                        <th>Variant</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Discounted</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map((item, index) => (
                        <tr key={item.id}>
                          <td>{index + 1}</td>
                          <td>{item.product_name}</td>
                          <td>{item.product_variant}</td>
                          <td>{item.quantity}</td>
                          <td>{item.price}</td>
                          <td>{item.discounted_price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div>No items available</div>
                )}
              </div>

              <div className="mb-3">
                <h5>Shipping Address</h5>
                {selectedOrder.address ? (
                  <div>
                    <div>{selectedOrder.address.full_name}</div>
                    <div>{selectedOrder.address.mobile}</div>
                    <div>{selectedOrder.address.address_line1}</div>
                    {selectedOrder.address.address_line2 && <div>{selectedOrder.address.address_line2}</div>}
                    <div>{selectedOrder.address.city}, {selectedOrder.address.state} - {selectedOrder.address.pincode}</div>
                    <div>{selectedOrder.address.country}</div>
                  </div>
                ) : (
                  <div>No address information</div>
                )}
              </div>
            </>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={() => downloadBill(selectedOrder)}>
            <i className="mdi mdi-download me-1"></i> Download Bill
          </Button>
          <Button color="secondary" onClick={closeOrderModal}>
            Close
          </Button>
        </ModalFooter>
      </Modal>

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
                    styles={customSelectStyles}
                    isLoading={deliveryPersonsLoading}
                    isDisabled={deliveryPersonsLoading || Boolean(deliveryPersonsError)}
                    noOptionsMessage={() => deliveryPersonsError || "No delivery persons found"}
                    options={deliveryList.map(d => ({ label: d.name || "", value: d.id, mobile: d.mobile }))}
                    onInputChange={(inputValue, actionMeta) => {
                      if (actionMeta.action !== "input-change") return;

                      const filtered = deliveryList.filter(d =>
                        (d.name || "").toLowerCase().includes(inputValue.toLowerCase())
                      );

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
                      if (!selectedOption) {
                        setDeliveryInfo((prev) => ({ ...prev, name: "", mobile: "", id: "" }));
                        return;
                      }
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
                    styles={customSelectStyles}
                    isLoading={deliveryPersonsLoading}
                    isDisabled={deliveryPersonsLoading || Boolean(deliveryPersonsError)}
                    noOptionsMessage={() => deliveryPersonsError || "No delivery persons found"}
                    options={deliveryList.map(d => ({ label: d.mobile || "", value: d.id, name: d.name }))}
                    value={deliveryList
                      .map((person) => ({
                        label: person.mobile,
                        value: person.id,
                        name: person.name,
                      }))
                      .find((opt) => opt.value === deliveryInfo.id)}

                    onInputChange={(inputValue, actionMeta) => {
                      if (actionMeta.action !== "input-change") return;

                      const filtered = deliveryList.filter(d =>
                        (d.mobile || "").includes(inputValue)
                      );

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
                      if (!selectedOption) {
                        setDeliveryInfo((prev) => ({ ...prev, name: "", mobile: "", id: "" }));
                        return;
                      }
                      setDeliveryInfo((prev) => ({
                        ...prev,
                        mobile: selectedOption.label,
                        id: selectedOption.value,
                        name: selectedOption.name,
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
            <Label for="deliverySlot">Delivery Slot</Label>
            <Input
  type="text"
  id="deliverySlot"
  value={
    selectedDeliverySlot
      ? `${selectedDeliverySlot.name} (${selectedDeliverySlot.start_time} - ${selectedDeliverySlot.end_time})`
      : "No delivery slot assigned"
  }
  disabled
/>
          </FormGroup>
          <FormGroup>
            <Label for="deliveryDate">Delivery Date</Label>
            <Input
              type="text"
              name="deliveryDate"
              id="deliveryDate"
              value={selectedDeliveryDate || ""}
              disabled
              placeholder="No delivery date assigned"
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
