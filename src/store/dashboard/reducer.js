import {
    FETCH_DASHBOARD_DATA,
    FETCH_DASHBOARD_DATA_SUCCESS,
    FETCH_DASHBOARD_DATA_FAIL,
} from "./actionTypes";

const initialState = {
    data: {
        salesPerMonth: [],
        mostSoldProduct: {},
        leastSoldProduct: {},
        salesReport: [],
        generateSalesReport: {},
        products: [],
        latestOrders: [],
    },
    error: "",
    loading: false,
};

const DashboardReducer = (state = initialState, action) => {
    switch (action.type) {
        case FETCH_DASHBOARD_DATA:
            return {
                ...state,
                loading: true,
                error: "",
            };

        case FETCH_DASHBOARD_DATA_SUCCESS:
            return {
                ...state,
                loading: false,
                data: action.payload,
            };

        case FETCH_DASHBOARD_DATA_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };

        default:
            return state;
    }
};

export default DashboardReducer;
