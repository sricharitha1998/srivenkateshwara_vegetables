import {
    ADD_CATEGORY,
    ADD_CATEGORY_SUCCESS,
    ADD_CATEGORY_FAIL,
    UPDATE_CATEGORY,
    UPDATE_CATEGORY_SUCCESS,
    UPDATE_CATEGORY_FAIL
} from "./actionTypes";

const initialState = {
    loading: false,
    error: null,
    submitSuccess: false,
};

const CategoriesReducer = (state = initialState, action) => {
    switch (action.type) {
        case ADD_CATEGORY:
        case UPDATE_CATEGORY:
            return {
                ...state,
                loading: true,
                error: null,
                submitSuccess: false,
            };

        case ADD_CATEGORY_SUCCESS:
        case UPDATE_CATEGORY_SUCCESS:
            return {
                ...state,
                loading: false,
                submitSuccess: true,
                error: null,
            };

        case ADD_CATEGORY_FAIL:
        case UPDATE_CATEGORY_FAIL:
            return {
                ...state,
                loading: false,
                submitSuccess: false,
                error: action.payload,
            };

        default:
            return state;
    }
};

export default CategoriesReducer;
