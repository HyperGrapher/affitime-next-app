import { create } from'zustand'

type NotifStoreType = {
  unread: number;
  setUnread: (type: number) => void;
};

const useNotificationStore = create<NotifStoreType>((set) => ({
  unread: 0,
  setUnread: (value: number) => set({ unread: value }),
}));

export default useNotificationStore;
