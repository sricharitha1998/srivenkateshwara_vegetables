import {
    ADD_PRODUCT,
    ADD_PRODUCT_SUCCESS,
    ADD_PRODUCT_FAIL,
    UPDATE_PRODUCT,
    UPDATE_PRODUCT_SUCCESS,
    UPDATE_PRODUCT_FAIL
} from "./actionTypes";

export const addProduct = (productData, navigate) => ({
    type: ADD_PRODUCT,
    payload: { productData, navigate },
});

export const addProductSuccess = (data) => ({
    type: ADD_PRODUCT_SUCCESS,
    payload: data,
});

export const addProductFail = (error) => ({
    type: ADD_PRODUCT_FAIL,
    payload: error,
});

export const updateProduct = (id, productData, navigate, page) => ({
    type: UPDATE_PRODUCT,
    payload: { id, productData, navigate, page },
});

export const updateProductSuccess = (data) => ({
    type: UPDATE_PRODUCT_SUCCESS,
    payload: data,
});

export const updateProductFail = (error) => ({
    type: UPDATE_PRODUCT_FAIL,
    payload: error,
});
