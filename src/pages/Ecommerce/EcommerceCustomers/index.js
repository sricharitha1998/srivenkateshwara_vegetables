import React, { useMemo } from "react";
import TableContainer from "../../../components/Common/TableContainer";

//Import Breadcrumb
import Breadcrumbs from '../../../components/Common/Breadcrumb';
import { Card, CardBody, Container } from "reactstrap";
import { Link } from "react-router-dom";
import { customers } from "../../../common/data/ecommerce";

const EcommerceOrders = () => {

  const columns = useMemo(
    () => [
      {
        Header: "Customer ",
        accessor: "username",
        disableFilters: true,
        filterable: false,
      },
      {
        Header: "Email",
        accessor: "email",
        disableFilters: true,
        filterable: false,
      },
      {
        Header: "Phone",
        accessor: "phone",
        disableFilters: true,
        filterable: false,
      },
      {
        Header: "Wallet Balance",
        accessor: "amount",
        disableFilters: true,
        filterable: false,
      },
      {
        Header: "Join Date",
        accessor: "date",
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
    { title: "Customers", link: "#" },
  ]

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs
            title="Customers"
            breadcrumbItems={breadcrumbItems}
          />
          <Card>
            <CardBody>
              <TableContainer
                columns={columns || []}
                data={customers || []}
                isPagination={false}
                // isGlobalFilter={false}
                iscustomPageSize={false}
                isBordered={false}
                customPageSize={10}
              />
            </CardBody>
          </Card>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default EcommerceOrders;
