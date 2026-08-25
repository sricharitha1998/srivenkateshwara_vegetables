import {
    ADD_SUBCATEGORY,
    ADD_SUBCATEGORY_SUCCESS,
    ADD_SUBCATEGORY_FAIL,
    UPDATE_SUBCATEGORY,
    UPDATE_SUBCATEGORY_SUCCESS,
    UPDATE_SUBCATEGORY_FAIL
} from "./actionTypes";

export const addSubCategory = (subCategoryData, navigate, onSuccess) => ({
    type: ADD_SUBCATEGORY,
    payload: { subCategoryData, navigate, onSuccess },
});

export const addSubCategorySuccess = (data) => ({
    type: ADD_SUBCATEGORY_SUCCESS,
    payload: data,
});

export const addSubCategoryFail = (error) => ({
    type: ADD_SUBCATEGORY_FAIL,
    payload: error,
});

export const updateSubCategory = (id, subCategoryData, navigate, onSuccess) => ({
    type: UPDATE_SUBCATEGORY,
    payload: { id, subCategoryData, navigate, onSuccess },
});

export const updateSubCategorySuccess = (data) => ({
    type: UPDATE_SUBCATEGORY_SUCCESS,
    payload: data,
});

export const updateSubCategoryFail = (error) => ({
    type: UPDATE_SUBCATEGORY_FAIL,
    payload: error,
});
