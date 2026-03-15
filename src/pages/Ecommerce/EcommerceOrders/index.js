import React, { useMemo } from "react";
import TableContainer from "../../../components/Common/TableContainer";

//Import Breadcrumb
import Breadcrumbs from '../../../components/Common/Breadcrumb';
import { Card, CardBody, Container } from "reactstrap";
import { orders } from "../../../common/data";
import { Link } from "react-router-dom";

const EcommerceOrders = () => {

  const columns = useMemo(
    () => [
      {
        Header: "ID",
        accessor: "id",
        disableFilters: true,
        filterable: false,
      },
      {
        Header: "Order ID",
        accessor: "orderid",
        disableFilters: true,
        filterable: false,
      },
      {
        Header: "Date",
        accessor: "orderdate",
        disableFilters: true,
        filterable: false,
      },
      {
        Header: "Billing Name",
        accessor: "billingname",
        disableFilters: true,
        filterable: false,
      },
      {
        Header: "Total",
        accessor: "total",
        disableFilters: true,
        filterable: false,
      },
      {
        Header: "Payment Status",
        disableFilters: true,
        filterable: true,
        accessor: (cellProps) => {
          switch (cellProps.paymentStatus) {
            case "Paid":
              return (<span className="badge bg-success-subtle text-success text-uppercase"> {cellProps.paymentStatus}</span>)
            case "unpaid":
              return (<span className="badge bg-warning-subtle text-warning text-uppercase"> {cellProps.paymentStatus}</span>)
            default:
              return (<span className="badge bg-danger-subtle text-danger text-uppercase"> {cellProps.paymentStatus}</span>)
          }
        },
      },
      {
        Header: "Invoice",
        accessor: (cellProps) => {
          return (
            <button className="btn btn-light btn-rounded">Invoice <i className="mdi mdi-download ms-2"></i></button>
          )
        },
        disableFilters: true,
        filterable: false,
      },
      {
        Header: "Action",
        accessor: (cellProps) => {
          return (
            <React.Fragment>
              <Link to="#" className="me-3 text-primary"><i className="mdi mdi-pencil font-size-18"></i></Link>
              <Link to="#" className="text-danger"><i className="mdi mdi-trash-can font-size-18"></i></Link>
            </React.Fragment>
          )
        },
        disableFilters: true,
        filterable: false,
      },
    ],
    []
  );

  const breadcrumbItems = [
    { title: "Ecommerce", link: "/" },
    { title: "Orders", link: "#" },
  ]

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs
            title="Orders"
            breadcrumbItems={breadcrumbItems}
          />
          <Card>
            <CardBody>
              <TableContainer
                columns={columns || []}
                data={orders || []}
                isPagination={false}
                // isGlobalFilter={false}
                iscustomPageSize={false}
                isBordered={false}
                customPageSize={10}
                className="custom-header-css table align-middle table-nowrap"
                tableClassName="table-centered align-middle table-nowrap mb-0"
                theadClassName="text-muted table-light"
              />
            </CardBody>
          </Card>

          
        </Container>
      </div>
    </React.Fragment>
  );
};

export default EcommerceOrders;
