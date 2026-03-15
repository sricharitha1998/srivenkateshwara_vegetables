import { configureStore } from "@reduxjs/toolkit";
import orderReducer from "./orderSlice"; // adjust path

export const store = configureStore({
  reducer: {
    orders: orderReducer,
  },
});
