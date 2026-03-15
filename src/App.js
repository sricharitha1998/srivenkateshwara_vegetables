import { Routes, Route } from "react-router-dom";
import Login from "./pages/Authentication/Login";
import Dashboard from "./pages/Dashboard/index"; 
import { useSelector } from "react-redux";
import VerticalLayout from "./components/VerticalLayout";
import HorizontalLayout from "./components/HorizontalLayout";
import AddCategory from './pages/Categories/addCategory'
import ListCategory from './pages/Categories/listCategories'
import UpdateCategory from './pages/Categories/updateCategory'
import AddSubCategory from './pages/SubCategory/addSubCategory'
import ListSubCategory from './pages/SubCategory/listSubCatergories'
import UpdateSubCategory from './pages/SubCategory/updateSubCategory'
import AddEmployee from './pages/Employee/addEmployee'
import ListEmployee from './pages/Employee/listEmployees'
import UpdateEmployee from './pages/Employee/updateEmployee'
import AddProduct from './pages/products/addProduct'
import ListProduct from './pages/products/listProducts'
import ProductDetail from './pages/products/productView'
import ListUsers from './pages/users/list'
import ListOrders from './pages/Orders/listOrders'
import ListPayments from "./pages/payments/listPayments";
import AuthRoute from "./routes/AuthRoute";
import PrivateRoute from "./routes/PrivateRoute";

function App() {

	const layoutType = useSelector((state) => state.Layout.layoutType);

  const getLayout = () => {
    switch (layoutType) {
      case "horizontal":
        return HorizontalLayout;
      default:
        return VerticalLayout;
    }
  };

  const Layout = getLayout();

  return (
    <Routes>
      <Route path="/" element={<AuthRoute><Login /></AuthRoute>} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </PrivateRoute>
        }
      />
	  <Route
        path="/add-category"
        element={
          <PrivateRoute>
            <Layout>
              <AddCategory />
            </Layout>
          </PrivateRoute>
        }
      />
	  <Route
        path="/list-category"
        element={
          <PrivateRoute>
            <Layout>
              <ListCategory />
            </Layout>
          </PrivateRoute>
        }
      />

<Route
        path="/update-category/:id"
        element={
          <PrivateRoute>
            <Layout>
              <UpdateCategory />
            </Layout>
          </PrivateRoute>
        }
      />

	  <Route
        path="/add-sub-category"
        element={
          <PrivateRoute>
            <Layout>
              <AddSubCategory />
            </Layout>
          </PrivateRoute>
        }
      />
	  <Route
        path="/list-sub-category"
        element={
          <PrivateRoute>
            <Layout>
              <ListSubCategory />
            </Layout>
          </PrivateRoute>
        }
      />

<Route
        path="/update-sub-category/:id"
        element={
          <PrivateRoute>
            <Layout>
              <UpdateSubCategory />
            </Layout>
          </PrivateRoute>
        }
      />

<Route
        path="/add-employee"
        element={
          <PrivateRoute>
            <Layout>
              <AddEmployee />
            </Layout>
          </PrivateRoute>
        }
      />

<Route
        path="/list-employees"
        element={
          <PrivateRoute>
            <Layout>
              <ListEmployee />
            </Layout>
          </PrivateRoute>
        }
      />

<Route
        path="/payments"
        element={
          <PrivateRoute>
            <Layout>
              <ListPayments />
            </Layout>
          </PrivateRoute>
        }
      />

<Route
        path="/update-employee/:id"
        element={
          <PrivateRoute>
            <Layout>
              <UpdateEmployee />
            </Layout>
          </PrivateRoute>
        }
      />

<Route
        path="/add-products"
        element={
          <PrivateRoute>
            <Layout>
              <AddProduct />
            </Layout>
          </PrivateRoute>
        }
      />

<Route
        path="/list-products"
        element={
          <PrivateRoute>
            <Layout>
              <ListProduct />
            </Layout>
          </PrivateRoute>
        }
      />

<Route
        path="/product"
        element={
          <PrivateRoute>
            <Layout>
              <ProductDetail />
            </Layout>
          </PrivateRoute>
        }
      />

<Route
        path="/update-product/:id"
        element={
          <PrivateRoute>
            <Layout>
              <AddProduct />
            </Layout>
          </PrivateRoute>
        }
      />

<Route
        path="/list-users"
        element={
          <PrivateRoute>
            <Layout>
              <ListUsers />
            </Layout>
          </PrivateRoute>
        }
      />

<Route
        path="/list-orders"
        element={
          <PrivateRoute>
            <Layout>
              <ListOrders />
            </Layout>
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default App;
