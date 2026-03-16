import { takeEvery, put, all, call, fork } from "redux-saga/effects";
import { ADD_CATEGORY, UPDATE_CATEGORY } from "./actionTypes";
import {
    addCategorySuccess,
    addCategoryFail,
    updateCategorySuccess,
    updateCategoryFail,
} from "./actions";
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL;

const refreshAccessToken = async (refreshToken) => {
    const response = await axios.post(`${API_BASE}/token/refresh/`, { refresh: refreshToken });
    const { data } = response.data;
    
    // Update local storage
    const existingUserData = JSON.parse(localStorage.getItem("user")) || {};
    const updatedUserData = { ...existingUserData, access: data.access };
    if (data.refresh) updatedUserData.refresh = data.refresh;
    
    localStorage.setItem("user", JSON.stringify(updatedUserData));
    return data.access;
};

function* addCategory({ payload: { categoryData, navigate } }) {
    try {
        const formDataBody = new FormData();
        formDataBody.append("name", categoryData.name);
        formDataBody.append("is_active", true);
        if (categoryData.image) {
            formDataBody.append("image", categoryData.image);
        }

        const userDataStr = localStorage.getItem("user");
        if (!userDataStr) throw new Error("No authentication data found.");
        const userData = JSON.parse(userDataStr);
        let access = userData.access;

        let responseData;

        try {
            const response = yield call(axios.post, `${API_BASE}/categories/`, formDataBody, {
                headers: {
                    Authorization: `Bearer ${access}`
                }
            });
            responseData = response.data;
        } catch (error) {
            if (error.response && error.response.status === 401) {
                access = yield call(refreshAccessToken, userData.refresh);
                const retryResponse = yield call(axios.post, `${API_BASE}/categories/`, formDataBody, {
                    headers: {
                        Authorization: `Bearer ${access}`
                    }
                });
                responseData = retryResponse.data;
            } else {
                throw error;
            }
        }
        
        yield put(addCategorySuccess(responseData));
        if (navigate) navigate("/list-category");
        
    } catch (error) {
        yield put(addCategoryFail(error.response?.data?.message || error.message || "Failed to add category"));
    }
}

function* updateCategory({ payload: { id, categoryData, navigate } }) {
    try {
        const formDataBody = new FormData();
        formDataBody.append("name", categoryData.name);
        if (categoryData.image) {
            formDataBody.append("image", categoryData.image);
        }

        const userDataStr = localStorage.getItem("user");
        if (!userDataStr) throw new Error("No authentication data found.");
        const userData = JSON.parse(userDataStr);
        let access = userData.access;

        let responseData;

        try {
            const response = yield call(axios.patch, `${API_BASE}/categories/${id}/`, formDataBody, {
                headers: {
                    Authorization: `Bearer ${access}`
                }
            });
            responseData = response.data;
        } catch (error) {
            if (error.response && error.response.status === 401) {
                access = yield call(refreshAccessToken, userData.refresh);
                const retryResponse = yield call(axios.patch, `${API_BASE}/categories/${id}/`, formDataBody, {
                    headers: {
                        Authorization: `Bearer ${access}`
                    }
                });
                responseData = retryResponse.data;
            } else {
                throw error;
            }
        }
        
        yield put(updateCategorySuccess(responseData));
        if (navigate) navigate("/list-category");
        
    } catch (error) {
        yield put(updateCategoryFail(error.response?.data?.message || error.message || "Failed to update category"));
    }
}

export function* watchAddCategory() {
    yield takeEvery(ADD_CATEGORY, addCategory);
}

export function* watchUpdateCategory() {
    yield takeEvery(UPDATE_CATEGORY, updateCategory);
}

function* categoriesSaga() {
    yield all([
        fork(watchAddCategory),
        fork(watchUpdateCategory),
    ]);
}

export default categoriesSaga;
