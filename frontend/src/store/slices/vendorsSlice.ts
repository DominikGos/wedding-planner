import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { vendors as initialVendors } from '../../features/vendors/data/vendorsMock'
import type { Vendor } from '../../features/vendors/data/vendorsMock'

interface VendorsState {
  items: Vendor[]
}

const initialState: VendorsState = {
  items: initialVendors,
}

const vendorsSlice = createSlice({
  name: 'vendors',
  initialState,
  reducers: {
    setVendors: (state, action: PayloadAction<Vendor[]>) => {
      state.items = action.payload
    },
    addVendor: (state, action: PayloadAction<Vendor>) => {
      state.items.unshift(action.payload)
    },
    removeVendor: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(vendor => vendor.id !== action.payload)
    },
    updateVendorStatus: (state, action: PayloadAction<{ id: string; status: Vendor['status'] }>) => {
      const vendor = state.items.find(v => v.id === action.payload.id)
      if (vendor) {
        vendor.status = action.payload.status
      }
    },
    updateVendor: (state, action: PayloadAction<Vendor>) => {
      const idx = state.items.findIndex(v => v.id === action.payload.id)
      if (idx !== -1) {
        state.items[idx] = action.payload
      }
    }
  }
})

export const { setVendors, addVendor, removeVendor, updateVendorStatus, updateVendor } = vendorsSlice.actions
export const vendorsReducer = vendorsSlice.reducer
