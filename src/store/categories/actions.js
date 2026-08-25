import {
    ADD_CATEGORY,
    ADD_CATEGORY_SUCCESS,
    ADD_CATEGORY_FAIL,
    UPDATE_CATEGORY,
    UPDATE_CATEGORY_SUCCESS,
    UPDATE_CATEGORY_FAIL
} from "./actionTypes";

export const addCategory = (categoryData, navigate, onSuccess) => ({
    type: ADD_CATEGORY,
    payload: { categoryData, navigate, onSuccess },
});

export const addCategorySuccess = (data) => ({
    type: ADD_CATEGORY_SUCCESS,
    payload: data,
});

export const addCategoryFail = (error) => ({
    type: ADD_CATEGORY_FAIL,
    payload: error,
});

export const updateCategory = (id, categoryData, navigate, onSuccess) => ({
    type: UPDATE_CATEGORY,
    payload: { id, categoryData, navigate, onSuccess },
});

export const updateCategorySuccess = (data) => ({
    type: UPDATE_CATEGORY_SUCCESS,
    payload: data,
});

export const updateCategoryFail = (error) => ({
    type: UPDATE_CATEGORY_FAIL,
    payload: error,
});
