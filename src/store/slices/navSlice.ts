import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { NavItem } from "../../types/nav";
import { navService } from "../../services/navService";
import type { RootState } from "../index";

export const fetchNavigations = createAsyncThunk("nav/fetch", async () => {
  const res = await navService.getNavigations();
  const normalizedItems = res.data.map((item) => ({
    ...item,
    href:
      item.href === "/home#homeServices"
        ? "/Services"
        : item.href,
  }));
  return normalizedItems;
});

function toggleInTree(items: NavItem[], id: number): NavItem[] {
  return items.map((item) => {
    if (item.id === id) return { ...item, is_active: item.is_active === 1 ? 0 : 1 };
    if (item.children?.length) return { ...item, children: toggleInTree(item.children, id) };
    return item;
  });
}

function deleteFromTree(items: NavItem[], id: number): NavItem[] {
  return items
    .filter((item) => item.id !== id)
    .map((item) => ({
      ...item,
      children: item.children?.length ? deleteFromTree(item.children, id) : item.children,
    }));
}

// Fires PUT with the current items after the reducer has already updated state
export const persistNavigations = createAsyncThunk(
  "nav/persist",
  async (_, { getState }) => {
    const state = getState() as RootState;
    await navService.updateAll(state.nav.items);
  }
);

interface NavState {
  items: NavItem[];
  loading: boolean;
  updating: boolean;
}

const initialState: NavState = { items: [], loading: false, updating: false };

const navSlice = createSlice({
  name: "nav",
  initialState,
  reducers: {
    toggleNavActive(state, action: { payload: number }) {
      state.items = toggleInTree(state.items, action.payload);
    },
    deleteNav(state, action: { payload: number }) {
      state.items = deleteFromTree(state.items, action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNavigations.pending, (state) => { state.loading = true; })
      .addCase(fetchNavigations.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchNavigations.rejected, (state) => { state.loading = false; })

      .addCase(persistNavigations.pending, (state) => { state.updating = true; })
      .addCase(persistNavigations.fulfilled, (state) => { state.updating = false; })
      .addCase(persistNavigations.rejected, (state) => { state.updating = false; });
  },
});

export const { toggleNavActive, deleteNav } = navSlice.actions;
export default navSlice.reducer;
