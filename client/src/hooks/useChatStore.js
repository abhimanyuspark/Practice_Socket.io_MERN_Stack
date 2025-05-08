import { create } from "zustand";
import { io } from "socket.io-client";

const url =
  import.meta.env.MODE === "development" ? "http://localhost:3000" : "/";

const socket = io(url);

const useChatStore = create((set, get) => ({
  messages: [],
  currentMessage: "",
  username: localStorage.getItem("username") || "Guest",
  isConnected: false,

  socket: null,

  setCurrentMessage: (message) => set({ currentMessage: message }),
  setUsername: (username) => {
    localStorage.setItem("username", username);
    set({ username });
  },

  sendMessage: () => {
    const { currentMessage, username } = get();
    if (currentMessage.trim()) {
      //? sending message to the server
      socket.emit("chat message", { text: currentMessage, username });

      set({ currentMessage: "" });
    }
  },

  connectSocket: () => {
    if (get().socket?.connected) {
      return;
    }
    socket.connect();
    set({ isConnected: true });

    set({ socket: socket });

    //? receive a message from a server for realtime chat
    socket.on("chat message", (message) => {
      set((state) => ({ messages: [...state.messages, message] }));
    });
  },

  disConnectSocket: () => {
    if (get().socket?.connected) get().socket?.disconnect();
    set({ isConnected: false });
  },
}));

export default useChatStore;
