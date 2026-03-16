// src/store/orderSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Fetch Orders
export const fetchOrders = createAsyncThunk("orders/fetchOrders", async (type, { rejectWithValue }) => {
  try {
    const userData = JSON.parse(localStorage.getItem("user"));
    const accessToken = userData?.access;
    let url = `${process.env.REACT_APP_API_URL}/orders/`;

    if (type === "2") url = `${process.env.REACT_APP_API_URL}/orders/status/Accepted/`;
    if (type === "3") url = `${process.env.REACT_APP_API_URL}/orders/status/Cancelled/`;
    if (type === "4") url = `${process.env.REACT_APP_API_URL}/orders/status/Assigned to Delivery Partner/`;
    if (type === "5") url = `${process.env.REACT_APP_API_URL}/orders/status/Delivered/`;

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    });

    const result = await response.json();
    return result?.data || [];
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

// Fetch Delivery Persons
export const fetchDeliveryPersons = createAsyncThunk("orders/fetchDeliveryPersons", async (_, { rejectWithValue }) => {
  try {
    const userData = JSON.parse(localStorage.getItem("user"));
    const accessToken = userData?.access;

    const response = await fetch(`${process.env.REACT_APP_API_URL}/delivery-persons/`, {
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    });

    const result = await response.json();
    return result?.data || [];
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

// Slice
const orderSlice = createSlice({
  name: "orders",
  initialState: {
    orders: [],
    deliveryList: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearOrders: (state) => {
      state.orders = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchDeliveryPersons.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDeliveryPersons.fulfilled, (state, action) => {
        state.loading = false;
        state.deliveryList = action.payload;
      })
      .addCase(fetchDeliveryPersons.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearOrders } = orderSlice.actions;
export default orderSlice.reducer;
