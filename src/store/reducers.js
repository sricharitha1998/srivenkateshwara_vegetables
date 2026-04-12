import { combineReducers } from 'redux';

// Front
import Layout from './layout/reducer';

// Authentication Module
import Account from './auth/register/reducer';
import Login from './auth/login/reducer';
import Forget from './auth/forgetpwd/reducer';

//Calendar 
import Calendar from "./calendar/reducer";

//chat
import chat from "./chat/reducer"

//ecommerce
import Ecommerce from "./e-commerce/reducer";

//Dashboard
import Dashboard from "./dashboard/reducer";

//Categories
import Categories from "./categories/reducer";

//SubCategories
import SubCategories from "./subCategories/reducer";

//Products
import Products from "./products/reducer";

const rootReducer = combineReducers({

    // public
    Layout,

    // Authentication
    Account,
    Login,
    Forget,
    Calendar,
    Ecommerce,
    chat,
    Dashboard,
    Categories,
    SubCategories,
    Products,
});

export default rootReducer;