import React from "react";
import { Card, CardBody, Col } from "reactstrap";

const LatestOrders = ({ orders = [] }) => {
  const latestOrders = [...orders]
    .sort((first, second) => new Date(second.created_at || 0) - new Date(first.created_at || 0))
    .slice(0, 5);

  return (
    <Col xl={6}>
      <Card>
        <CardBody>
          <h4 className="card-title mb-4">Latest Orders</h4>
          <div className="table-responsive">
            <table className="table table-sm align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {latestOrders.length > 0 ? latestOrders.map((order) => (
                  <tr key={order.id || order.order_id}>
                    <td>{order.order_id || "-"}</td>
                    <td>{order.user || order.billing_name || "-"}</td>
                    <td>{order.status || "-"}</td>
                    <td>₹{order.final_amount || order.payment_amount || 0}</td>
                  </tr>
                )) : (
                  <tr><td colSpan="4" className="text-muted">No orders found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </Col>
  );
};

export default LatestOrders;