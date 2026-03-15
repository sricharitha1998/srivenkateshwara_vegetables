import React from "react";
import {
  Card,
  CardBody,
  Col,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
} from "reactstrap";

const LatestTransactions = ({ salesReport, generateReports }) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const toggle = () => setDropdownOpen((prevState) => !prevState);
  

  const periods = ["daily", "weekly", "monthly"];

  const getProductNameWithQuantity = (product) => {
    if (!product) return "-";
    return `${product.product_name} (${product.variant_quantity}${product.unit})`;
  };

  const renderRow = (period, data) => {
    const product =
      data?.top_selling_product || data?.least_selling_product || null;

    return (
      <tr key={period}>
        <td className="text-capitalize">{period}</td>
        <td>{getProductNameWithQuantity(product)}</td>
        <td>{data?.total_items_sold || 0}</td>
        <td>{data?.total_orders || 0}</td>
        <td>₹{data?.total_revenue || 0}</td>
        <td>₹{product?.price || "-"}</td>
        <td>₹{product?.discounted_price || "-"}</td>
      </tr>
    );
  };

  // 🔽 Handle download logic
  const handleDownload = async (type) => {
    try {
      
      const url =
        type === "pdf"
          ? generateReports?.pdf_report_url
          : generateReports?.csv_report_url;

      if (url) {
        const link = document.createElement("a");
        link.href = url;
        link.download = url.split("/").pop(); // optional: sets default filename
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        console.error("Download URL not found");
      }
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  return (
    <React.Fragment>
      <Col lg={12}>
        <Card>
          <CardBody>
            <Dropdown
              isOpen={dropdownOpen}
              toggle={toggle}
              className="float-end"
            >
              <DropdownToggle tag="i" className="arrow-none card-drop">
                <i className="mdi mdi-dots-vertical"></i>
              </DropdownToggle>
              <DropdownMenu className="dropdown-menu-end">
                <DropdownItem onClick={() => handleDownload("pdf")}>
                  Download PDF
                </DropdownItem>
                <DropdownItem onClick={() => handleDownload("csv")}>
                  Download CSV
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>

            <h4 className="card-title mb-4">Sales Summary</h4>
            <div className="table-responsive">
              <table className="table table-bordered align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Period</th>
                    <th>Product (Qty)</th>
                    <th>Total Sold Items</th>
                    <th>Total Orders</th>
                    <th>Total Revenue</th>
                    <th>Price</th>
                    <th>Discounted Price</th>
                  </tr>
                </thead>
                <tbody>
  {(salesReport ? periods : []).map((period) =>
    renderRow(period, salesReport[period])
  )}
</tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      </Col>
    </React.Fragment>
  );
};

export default LatestTransactions;
