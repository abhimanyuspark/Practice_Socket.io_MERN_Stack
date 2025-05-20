import { create } from "zustand";
import { io } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";

const url =
  import.meta.env.MODE === "development" ? "http://localhost:3000" : "/";

const socket = io(url, {
  query: {
    userId: localStorage.getItem("username") || "Guest",
  },
});

const useChatStore = create((set, get) => ({
  messages: [],
  currentMessage: "",
  username: localStorage.getItem("username") || "Guest",
  isConnected: false,
  typingUser: null,
  socket: null,
  editId: null,
  edit: false,

  onlineUsers: [],

  setCurrentMessage: (message) => set({ currentMessage: message }),
  setUsername: (username) => {
    localStorage.setItem("username", username);
    set({ username });
  },

  setTypingUser: (isTyping) => {
    const { username } = get();
    if (isTyping) {
      socket.emit("typing", { typing: true, username });
    } else {
      socket.emit("typing", { typing: false, username });
    }
  },

  //? sending message to the store or server

  sendMessage: () => {
    const { currentMessage, username, edit, editId } = get();
    if (currentMessage.trim()) {
      if (edit) {
        socket.emit("edit message", {
          id: editId,
          text: currentMessage,
          username,
          date: new Date(),
          isEdited: true,
        });
      } else {
        socket.emit("chat message", {
          id: uuidv4(),
          text: currentMessage,
          username,
          date: new Date(),
          isEdited: false,
        });
      }

      set({ currentMessage: "", edit: false, editId: null });
    }
  },

  editMessage: (msg) => {
    set({ currentMessage: msg.text, edit: true, editId: msg.id });
  },

  deleteMessage: (id) => {
    const { messages } = get();
    const updatedMessages = messages.filter((message) => message.id !== id);
    set({ messages: updatedMessages });
    socket.emit("delete message", id);
  },

  connectSocket: () => {
    if (get().socket?.connected) {
      return;
    }

    socket.connect();
    set({ isConnected: true });

    set({ socket: socket });

    socket.on("chat message", (message) => {
      set((state) => ({ messages: [...state.messages, message] }));
    });

    socket.on("typing", (user) => {
      set({ typingUser: user });
    });

    socket.on("getOnlineUsers", (users) => {
      set({ onlineUsers: users });
    });

    socket.on("delete message", (id) => {
      const { messages } = get();
      const updatedMessages = messages.filter((message) => message.id !== id);
      set({ messages: updatedMessages });
    });

    socket.on("edit message", (msg) => {
      const { messages } = get();
      const updatedMessages = messages.map((message) => {
        if (message.id === msg.id) {
          return {
            ...message,
            text: msg.text,
            isEdited: msg.isEdited,
            date: msg.date,
          };
        }
        return message;
      });
      set({ messages: updatedMessages });
    });

    return () => {
      socket.off("typing");
      socket.off("chat message");
      socket.off("getOnlineUsers");
      socket.off("delete message");
      socket.off("edit Message");
    };
  },

  disConnectSocket: () => {
    if (get().socket?.connected) get().socket?.disconnect();
    set({ isConnected: false });
  },
}));

export default useChatStore;
