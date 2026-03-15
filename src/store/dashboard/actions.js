import {
    FETCH_DASHBOARD_DATA,
    FETCH_DASHBOARD_DATA_SUCCESS,
    FETCH_DASHBOARD_DATA_FAIL,
} from "./actionTypes";

export const fetchDashboardData = () => ({
    type: FETCH_DASHBOARD_DATA,
});

export const fetchDashboardDataSuccess = (data) => ({
    type: FETCH_DASHBOARD_DATA_SUCCESS,
    payload: data,
});

export const fetchDashboardDataFail = (error) => ({
    type: FETCH_DASHBOARD_DATA_FAIL,
    payload: error,
});
