import { takeEvery, put, all, call, fork } from "redux-saga/effects";
import { ADD_SUBCATEGORY, UPDATE_SUBCATEGORY } from "./actionTypes";
import {
    addSubCategorySuccess,
    addSubCategoryFail,
    updateSubCategorySuccess,
    updateSubCategoryFail,
} from "./actions";
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL;

const refreshAccessToken = async (refreshToken) => {
    const response = await axios.post(`${API_BASE}/token/refresh/`, { refresh: refreshToken });
    const { data } = response.data;
    
    const existingUserData = JSON.parse(localStorage.getItem("user")) || {};
    const updatedUserData = { ...existingUserData, access: data.access };
    if (data.refresh) updatedUserData.refresh = data.refresh;
    
    localStorage.setItem("user", JSON.stringify(updatedUserData));
    return data.access;
};

function* addSubCategory({ payload: { subCategoryData, navigate } }) {
    try {
        const formDataBody = new FormData();
        formDataBody.append("category", subCategoryData.categoryType);
        formDataBody.append("name", subCategoryData.subCategoryName);
        formDataBody.append("is_active", true);
        if (subCategoryData.image) {
            formDataBody.append("image", subCategoryData.image);
        }

        const userDataStr = localStorage.getItem("user");
        if (!userDataStr) throw new Error("No authentication data found.");
        const userData = JSON.parse(userDataStr);
        let access = userData.access;

        let responseData;

        try {
            const response = yield call(axios.post, `${API_BASE}/subcategories/`, formDataBody, {
                headers: {
                    Authorization: `Bearer ${access}`
                }
            });
            responseData = response.data;
        } catch (error) {
            if (error.response && error.response.status === 401) {
                access = yield call(refreshAccessToken, userData.refresh);
                const retryResponse = yield call(axios.post, `${API_BASE}/subcategories/`, formDataBody, {
                    headers: {
                        Authorization: `Bearer ${access}`
                    }
                });
                responseData = retryResponse.data;
            } else {
                throw error;
            }
        }
        
        yield put(addSubCategorySuccess(responseData));
        if (navigate) navigate("/list-sub-category");
        
    } catch (error) {
        const errorMsg = (error.response?.status === 400 || error.response?.data?.status_code === 400)
            ? "Sub Category name already exists"
            : (error.response?.data?.message || error.message || "Failed to add subcategory");
            console.log("errorMsg", errorMsg)
        yield put(addSubCategoryFail(errorMsg));
    }
}

function* updateSubCategory({ payload: { id, subCategoryData, navigate } }) {
    try {
        const formDataBody = new FormData();
        formDataBody.append("category", subCategoryData.categoryType);
        formDataBody.append("name", subCategoryData.subCategoryName);
        if (subCategoryData.image) {
            formDataBody.append("image", subCategoryData.image);
        }

        const userDataStr = localStorage.getItem("user");
        if (!userDataStr) throw new Error("No authentication data found.");
        const userData = JSON.parse(userDataStr);
        let access = userData.access;

        let responseData;

        try {
            const response = yield call(axios.patch, `${API_BASE}/subcategories/${id}/`, formDataBody, {
                headers: {
                    Authorization: `Bearer ${access}`
                }
            });
            responseData = response.data;
        } catch (error) {
            if (error.response && error.response.status === 401) {
                access = yield call(refreshAccessToken, userData.refresh);
                const retryResponse = yield call(axios.patch, `${API_BASE}/subcategories/${id}/`, formDataBody, {
                    headers: {
                        Authorization: `Bearer ${access}`
                    }
                });
                responseData = retryResponse.data;
            } else {
                throw error;
            }
        }
        
        yield put(updateSubCategorySuccess(responseData));
        if (navigate) navigate("/list-sub-category");
        
    } catch (error) {
        const errorMsg = (error.response?.status === 400 || error.response?.data?.status_code === 400)
            ? (error.response?.data?.message || "Sub Category name already exists")
            : (error.response?.data?.message || error.message || "Failed to update subcategory");
        yield put(updateSubCategoryFail(errorMsg));
    }
}

export function* watchAddSubCategory() {
    yield takeEvery(ADD_SUBCATEGORY, addSubCategory);
}

export function* watchUpdateSubCategory() {
    yield takeEvery(UPDATE_SUBCATEGORY, updateSubCategory);
}

function* subCategoriesSaga() {
    yield all([
        fork(watchAddSubCategory),
        fork(watchUpdateSubCategory),
    ]);
}

export default subCategoriesSaga;
