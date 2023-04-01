import { create } from'zustand'

type NavbarStoreType = {
  update: string;
  setupdate: (type: string) => void;
};

const useNavbarStore = create<NavbarStoreType>((set) => ({
  update: '',
  setupdate: (value: string) => set({ update: value }),
}));

export default useNavbarStore;
