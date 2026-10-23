import { create } from 'zustand'

const usePropertyStore = create((set) => ({
  selectedProperty: null,
  setSelectedProperty: (property) => set({ selectedProperty: property }),
}))

export default usePropertyStore
