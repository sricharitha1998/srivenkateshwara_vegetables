import {
    ADD_SUBCATEGORY,
    ADD_SUBCATEGORY_SUCCESS,
    ADD_SUBCATEGORY_FAIL,
    UPDATE_SUBCATEGORY,
    UPDATE_SUBCATEGORY_SUCCESS,
    UPDATE_SUBCATEGORY_FAIL
} from "./actionTypes";

const initialState = {
    loading: false,
    error: null,
    submitSuccess: false,
};

const SubCategories = (state = initialState, action) => {
    switch (action.type) {
        case ADD_SUBCATEGORY:
        case UPDATE_SUBCATEGORY:
            return {
                ...state,
                loading: true,
                error: null,
                submitSuccess: false,
            };
        case ADD_SUBCATEGORY_SUCCESS:
        case UPDATE_SUBCATEGORY_SUCCESS:
            return {
                ...state,
                loading: false,
                submitSuccess: true,
            };
        case ADD_SUBCATEGORY_FAIL:
        case UPDATE_SUBCATEGORY_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };
        default:
            return state;
    }
};

export default SubCategories;
