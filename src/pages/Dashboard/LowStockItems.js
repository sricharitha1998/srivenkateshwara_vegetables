import React from "react";
import { Card, CardBody, Col } from "reactstrap";

const LowStockItems = ({ products = [] }) => {
  const items = products.flatMap((product) =>
    (product.variants || [])
      .filter((variant) => Number(variant.stock) < 5)
      .map((variant) => ({
        name: product.name || product.product_name || "-",
        quantity: variant.quantity,
        unit: variant.unit,
        stock: variant.stock,
      }))
  );

  return (
    <Col xl={6}>
      <Card>
        <CardBody>
          <h4 className="card-title mb-4">Low Stock Items</h4>
          <div className="table-responsive">
            <table className="table table-sm align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Product</th>
                  <th>Variant</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {items.length > 0 ? items.map((item, index) => (
                  <tr key={`${item.name}-${item.unit}-${index}`}>
                    <td>{item.name}</td>
                    <td>{item.quantity || "-"} {item.unit || ""}</td>
                    <td className="text-danger fw-semibold">{item.stock}</td>
                  </tr>
                )) : (
                  <tr><td colSpan="3" className="text-muted">No low stock items</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </Col>
  );
};

export default LowStockItems;