import { create } from'zustand'

export type ProjectNavType = "profile" | "notification" | undefined;

type NavbarMenuType = {
	sideOpen: boolean;
	setSideOpen: (type: boolean) => void;
};

const useNavbarMenuStore = create<NavbarMenuType>((set) => ({
	sideOpen: false,
	setSideOpen: (value: boolean) => set({ sideOpen: value }),
}));

export default useNavbarMenuStore;
