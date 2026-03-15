import {
    ADD_SUBCATEGORY,
    ADD_SUBCATEGORY_SUCCESS,
    ADD_SUBCATEGORY_FAIL,
    UPDATE_SUBCATEGORY,
    UPDATE_SUBCATEGORY_SUCCESS,
    UPDATE_SUBCATEGORY_FAIL
} from "./actionTypes";

export const addSubCategory = (subCategoryData, navigate) => ({
    type: ADD_SUBCATEGORY,
    payload: { subCategoryData, navigate },
});

export const addSubCategorySuccess = (data) => ({
    type: ADD_SUBCATEGORY_SUCCESS,
    payload: data,
});

export const addSubCategoryFail = (error) => ({
    type: ADD_SUBCATEGORY_FAIL,
    payload: error,
});

export const updateSubCategory = (id, subCategoryData, navigate) => ({
    type: UPDATE_SUBCATEGORY,
    payload: { id, subCategoryData, navigate },
});

export const updateSubCategorySuccess = (data) => ({
    type: UPDATE_SUBCATEGORY_SUCCESS,
    payload: data,
});

export const updateSubCategoryFail = (error) => ({
    type: UPDATE_SUBCATEGORY_FAIL,
    payload: error,
});
