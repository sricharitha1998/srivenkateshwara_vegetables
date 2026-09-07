import React, { useEffect, useState } from "react";
import { Container, Row, Col, Spinner, Alert } from "reactstrap";
import { useSelector, useDispatch } from "react-redux";

import Breadcrumbs from '../../components/Common/Breadcrumb';
import Footer from "../../components/VerticalLayout/Footer";
import MiniWidgets from "./MiniWidgets";
import LatestTransactions from "./LatestTransactions";
import LowStockItems from "./LowStockItems";
import LatestOrders from "./LatestOrders";
import { fetchDashboardData } from "../../store/actions";

const Dashboard = () => {
    const dispatch = useDispatch();
    const [breadcrumbItems] = useState([
        { title: "Ecommerce", link: "/" },
        { title: "Dashboard", link: "#" },
    ]);

    const { data, loading, error } = useSelector(state => ({
        data: state.Dashboard.data,
        loading: state.Dashboard.loading,
        error: state.Dashboard.error,
    }));

    useEffect(() => {
        dispatch(fetchDashboardData());
    }, [dispatch]);

    return (
        <div className="page-content">
            {loading ? (
                <div className="loading-overlay d-flex justify-content-center align-items-center">
                    <Spinner color="primary" style={{ width: '3rem', height: '3rem' }} />
                </div>
            )
            :
            <div className={loading ? "blur-content" : ""}>
                <Container fluid>
                    <Breadcrumbs title="Dashboard" breadcrumbItems={breadcrumbItems} />
                    {error && <Alert color="danger">{error}</Alert>}
                    <Row>
                        <Col xl={12}>
                            <Row>
                                <MiniWidgets reports={[
                                    { icon: "ri-calendar-line", title: "Sales Per Month", value: data?.salesPerMonth?.[0]?.order_count },
                                    { icon: "ri-bar-chart-grouped-line", title: "Most Sold Product", value: data?.mostSoldProduct?.product_name, rate: data?.mostSoldProduct?.total_quantity_sold, desc: "Total Sold" },
                                    { icon: "ri-arrow-down-line", title: "Least Sold Product", value: data?.leastSoldProduct?.product_name, rate: data?.leastSoldProduct?.total_quantity_sold, desc: "Total Sold" },
                                ]} />
                            </Row>
                        </Col>
                    </Row>
                    <Row>
                        <LatestTransactions salesReport={data?.salesReport} generateReports={data?.generateSalesReport?.data} />
                    </Row>
                    <Row>
                        <LowStockItems products={data?.products} />
                        <LatestOrders orders={data?.latestOrders} />
                    </Row>
                </Container>
                <Footer />
            </div>
            }
        </div>
    );
    
};

export default Dashboard;
