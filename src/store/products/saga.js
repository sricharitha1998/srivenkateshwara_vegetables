import { takeEvery, put, all, call, fork } from "redux-saga/effects";
import { ADD_PRODUCT, UPDATE_PRODUCT } from "./actionTypes";
import {
    addProductSuccess,
    addProductFail,
    updateProductSuccess,
    updateProductFail,
} from "./actions";
import axios from "axios";

const API_BASE = "http://178.16.139.77:8000/api/v1";

const refreshAccessToken = async (refreshToken) => {
    const response = await axios.post(`${API_BASE}/token/refresh/`, { refresh: refreshToken });
    const { data } = response.data;

    const existingUserData = JSON.parse(localStorage.getItem("user")) || {};
    const updatedUserData = { ...existingUserData, access: data.access };
    if (data.refresh) updatedUserData.refresh = data.refresh;

    localStorage.setItem("user", JSON.stringify(updatedUserData));
    return data.access;
};

function* addProduct({ payload: { productData, navigate } }) {
        const formDataBody = new FormData();
        formDataBody.append("name", productData.name);
        formDataBody.append("category", productData.category);
        if (productData.description) formDataBody.append("description", productData.description);
        if (productData.brand) formDataBody.append("brand", productData.brand);
        if (productData.subcategory) formDataBody.append("subcategory", productData.subcategory);

        if (productData.variants) {
            formDataBody.append("variants", JSON.stringify(productData.variants));
        }

        if (productData.images && productData.images.length > 0) {
            productData.images.forEach((file, index) => {
                // Ensure we are appending the actual File object
                const fileToAppend = file.originFileObj || file;
                console.log(`Saga addProduct - Appending image ${index}:`, fileToAppend);
                formDataBody.append("images", fileToAppend, fileToAppend.name || `product_image_${index}.png`);
            });
        }

        // Debug: Log all FormData entries
        console.log("Saga addProduct - Final FormData contents:");
        for (let [key, value] of formDataBody.entries()) {
            console.log(`${key}:`, value);
        }

        const userDataStr = localStorage.getItem("user");
        if (!userDataStr) throw new Error("No authentication data found.");
        const userData = JSON.parse(userDataStr);
        let access = userData.access;

        let responseData;

        try {
            const response = yield call(axios.post, `${API_BASE}/products/`, formDataBody, {
                headers: {
                    Authorization: `Bearer ${access}`
                }
            });
            responseData = response.data;
        } catch (error) {
            if (error.response && error.response.status === 401) {
                access = yield call(refreshAccessToken, userData.refresh);
                const retryResponse = yield call(axios.post, `${API_BASE}/products/`, formDataBody, {
                    headers: {
                        Authorization: `Bearer ${access}`
                    }
                });
                responseData = retryResponse.data;
            } else {
                throw error;
            }
        }

        yield put(addProductSuccess(responseData));
        if (navigate) navigate("/list-products");

    // } catch (error) {
    //     yield put(addProductFail(error.response?.data?.message || error.message || "Failed to add product"));
    // }
}

function* updateProduct({ payload: { id, productData, navigate } }) {
    try {
        const formDataBody = new FormData();
        if (productData.name) formDataBody.append("name", productData.name);
        if (productData.category) formDataBody.append("category", productData.category);
        if (productData.description !== undefined && productData.description !== null) {
            formDataBody.append("description", productData.description);
        }
        if (productData.brand !== undefined && productData.brand !== null) {
            formDataBody.append("brand", productData.brand);
        }
        if (productData.subcategory !== undefined && productData.subcategory !== null) {
            formDataBody.append("subcategory", productData.subcategory);
        }

        if (productData.variants) {
            formDataBody.append("variants", JSON.stringify(productData.variants));
        }

        if (productData.images && productData.images.length > 0) {
            productData.images.forEach((file, index) => {
                // Ensure we are appending the actual File object
                const fileToAppend = file.originFileObj || file;
                console.log(`Saga updateProduct - Appending image ${index}:`, fileToAppend);
                formDataBody.append("images", fileToAppend, fileToAppend.name || `product_image_${index}.png`);
            });
        }

        // Debug: Log all FormData entries
        console.log("Saga updateProduct - Final FormData contents:");
        for (let [key, value] of formDataBody.entries()) {
            console.log(`${key}:`, value);
        }

        const userDataStr = localStorage.getItem("user");
        if (!userDataStr) throw new Error("No authentication data found.");
        const userData = JSON.parse(userDataStr);
        let access = userData.access;

        let responseData;

        try {
            const response = yield call(axios.put, `${API_BASE}/products/${id}/`, formDataBody, {
                headers: {
                    Authorization: `Bearer ${access}`
                }
            });
            responseData = response.data;
        } catch (error) {
            if (error.response && error.response.status === 401) {
                access = yield call(refreshAccessToken, userData.refresh);
                const retryResponse = yield call(axios.put, `${API_BASE}/products/${id}/`, formDataBody, {
                    headers: {
                        Authorization: `Bearer ${access}`
                    }
                });
                responseData = retryResponse.data;
            } else {
                throw error;
            }
        }

        yield put(updateProductSuccess(responseData));
        alert("Product updated successfully!");
        // Keep user on the edit page as was done before, or navigate if you prefer.
        // if (navigate) navigate("/list-products");

    } catch (error) {
        alert("Failed to update product.");
        yield put(updateProductFail(error.response?.data?.message || error.message || "Failed to update product"));
    }
}

export function* watchAddProduct() {
    yield takeEvery(ADD_PRODUCT, addProduct);
}

export function* watchUpdateProduct() {
    yield takeEvery(UPDATE_PRODUCT, updateProduct);
}

function* productsSaga() {
    yield all([
        fork(watchAddProduct),
        fork(watchUpdateProduct),
    ]);
}

export default productsSaga;
