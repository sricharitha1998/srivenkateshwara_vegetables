import { DELIVERY_PARTNERS } from "./orderType";

const initialState = {
    delivery_partners_data: [],
    delivery_partners_error: false,
    delivery_partners_loading: false
}

const DeliveryPartnersReducer = (state = initialState, action) =>
    produce(state, (draft) => {
      switch (action.type) {
        case DELIVERY_PARTNERS.DELIVERY_PARTNERS_START:
            initialState?.delivery_partners_loading = true;
            initialState?.delivery_partners_error = false;
          break;
  
        case DELIVERY_PARTNERS.DELIVERY_PARTNERS_SUCCESS:
            initialState.delivery_partners_loading = false;
            initialState.delivery_partners_data = action.payload;
            initialState.delivery_partners_error = false;
          break;
          case DELIVERY_PARTNERS.DELIVERY_PARTNERS_FAIL:
            initialState.delivery_partners_loading = false;
            initialState.delivery_partners_data = action.payload;
            initialState.delivery_partners_error = false;
            break;
      }
    });

    export default DeliveryPartnersReducer;