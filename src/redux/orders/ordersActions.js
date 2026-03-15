import axios from "axios";
import { DELIVERY_PARTNERS } from "./orderType";

export const DeliveryPartnersStart = () => ({
    type: DELIVERY_PARTNERS.DELIVERY_PARTNERS_START,
  });
  
  export const DeliveryPartnersSuccess = (data) => ({
    type: DELIVERY_PARTNERS.DELIVERY_PARTNERS_SUCCESS,
    payload: data,
  });
  
  export const DeliveryPartnersFail = (payload) => ({
    type: DELIVERY_PARTNERS.DELIVERY_PARTNERS_FAIL,
    payload:
      typeof payload === "string"
        ? payload
        : payload.message || "An error occurred",
  });
  
  export const DeliveryPartnersApi = (accessToken, dispatch) => {
    dispatch(DeliveryPartnersStart());
  console.log("hiiiiiiiiiiiii", process?.env?.REACT_APP_API_URL)
    try {
     const response = fetch(`${process?.env?.REACT_APP_API_URL}/delivery-persons/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
      console.log("response", response)
      dispatch(DeliveryPartnersSuccess(response));
      return response.data;
    } catch (error) {
      dispatch(DeliveryPartnersFail(error.message));
    }
  };