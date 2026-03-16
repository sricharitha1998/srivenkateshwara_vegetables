import { takeEvery, put, all, call, fork } from "redux-saga/effects";
import { FETCH_DASHBOARD_DATA } from "./actionTypes";
import { fetchDashboardDataSuccess, fetchDashboardDataFail } from "./actions";

const API_BASE = process.env.REACT_APP_API_URL;

const getAuthHeaders = (accessToken) => ({
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
});

const refreshAccessToken = async (refreshToken) => {
    const response = await fetch(`${API_BASE}/token/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) throw new Error("Session expired. Please login again.");

    const { data } = await response.json();
    
    // Update the local storage with new session data
    const existingUserData = JSON.parse(localStorage.getItem("user")) || {};
    const updatedUserData = { ...existingUserData, access: data.access };
    if (data.refresh) {
        updatedUserData.refresh = data.refresh;
    }
    
    localStorage.setItem("user", JSON.stringify(updatedUserData));
    return data.access;
};

// Generic authenticated fetch logic
const makeAuthenticatedRequest = async (url, options = {}, retry = true) => {
    const userDataStr = localStorage.getItem("user");
    if (!userDataStr) {
        throw new Error("No authentication data found.");
    }

    const userData = JSON.parse(userDataStr);
    let { access, refresh } = userData;

    let response = await fetch(url, {
        ...options,
        headers: getAuthHeaders(access),
    });

    if (response.status === 401 && retry) {
        try {
            access = await refreshAccessToken(refresh);
            response = await makeAuthenticatedRequest(url, options, false);
        } catch (err) {
            // Force logout behavior if we want to handle session expiry heavily here 
            // localStorage.removeItem("user");
            throw new Error("Re-authentication failed.");
        }
    }

    return response;
};

// Orchestrate the Dashboard API calls
function* fetchDashboardData() {
    try {
        const [
            responseSales,
            responseMostSold,
            responseLeastSold,
            responseReport,
            responseGenerate,
        ] = yield all([
            call(makeAuthenticatedRequest, `${API_BASE}/analytics/sales-per-month/`),
            call(makeAuthenticatedRequest, `${API_BASE}/analytics/most-sold-product/`),
            call(makeAuthenticatedRequest, `${API_BASE}/analytics/least-sold-product/`),
            call(makeAuthenticatedRequest, `${API_BASE}/analysis/sales-report/`),
            call(makeAuthenticatedRequest, `${API_BASE}/generate-sales-report/`),
        ]);

        const [
            resultSales,
            resultMostSold,
            resultLeastSold,
            resultReport,
            resultGenerate,
        ] = yield all([
            call([responseSales, responseSales.json]),
            call([responseMostSold, responseMostSold.json]),
            call([responseLeastSold, responseLeastSold.json]),
            call([responseReport, responseReport.json]),
            call([responseGenerate, responseGenerate.json]),
        ]);

        yield put(
            fetchDashboardDataSuccess({
                salesPerMonth: resultSales?.data || [],
                mostSoldProduct: resultMostSold?.data || {},
                leastSoldProduct: resultLeastSold?.data || {},
                salesReport: resultReport?.data || [],
                generateSalesReport: resultGenerate?.data || {},
            })
        );
    } catch (error) {
        yield put(fetchDashboardDataFail(error.message ? error.message : error));
    }
}

export function* watchFetchDashboardData() {
    yield takeEvery(FETCH_DASHBOARD_DATA, fetchDashboardData);
}

function* dashboardSaga() {
    yield all([
        fork(watchFetchDashboardData),
    ]);
}

export default dashboardSaga;
