import {
    ADD_PRODUCT,
    ADD_PRODUCT_SUCCESS,
    ADD_PRODUCT_FAIL,
    UPDATE_PRODUCT,
    UPDATE_PRODUCT_SUCCESS,
    UPDATE_PRODUCT_FAIL
} from "./actionTypes";

const initialState = {
    loading: false,
    error: null,
    submitSuccess: false,
};

const Products = (state = initialState, action) => {
    switch (action.type) {
        case ADD_PRODUCT:
        case UPDATE_PRODUCT:
            return {
                ...state,
                loading: true,
                error: null,
                submitSuccess: false,
            };
        case ADD_PRODUCT_SUCCESS:
        case UPDATE_PRODUCT_SUCCESS:
            return {
                ...state,
                loading: false,
                submitSuccess: true,
            };
        case ADD_PRODUCT_FAIL:
        case UPDATE_PRODUCT_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };
        default:
            return state;
    }
};

export default Products;
