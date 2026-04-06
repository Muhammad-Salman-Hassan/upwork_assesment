import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { NavItem } from "../../types/nav";
import { navService } from "../../services/navService";

export const fetchNavigations = createAsyncThunk("nav/fetch", async () => {
  const res = await navService.getNavigations();
  return res.data;
});

interface NavState {
  items: NavItem[];
  loading: boolean;
}

const initialState: NavState = { items: [], loading: false };

const navSlice = createSlice({
  name: "nav",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNavigations.pending, (state) => { state.loading = true; })
      .addCase(fetchNavigations.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchNavigations.rejected, (state) => { state.loading = false; });
  },
});

export default navSlice.reducer;
