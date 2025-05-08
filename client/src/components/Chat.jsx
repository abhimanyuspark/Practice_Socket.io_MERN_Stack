import React, { useEffect } from "react";
import useChatStore from "../hooks/useChatStore";

// Username form component
function UsernameForm() {
  const { username, setUsername } = useChatStore();
  const [tempUsername, setTempUsername] = React.useState(username);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (tempUsername.trim()) {
      setUsername(tempUsername);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="username-form">
      <input
        type="text"
        value={tempUsername}
        onChange={(e) => setTempUsername(e.target.value)}
        placeholder="Set your username"
      />
      <button type="submit">Set Username</button>
    </form>
  );
}

// Message list component
function MessageList() {
  const { messages, username } = useChatStore();
  const messageEndRef = React.useRef(null);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="message-list">
      {messages.map((msg, index) => (
        <div
          key={index}
          className="message"
          style={
            msg.username === username
              ? { justifyContent: "flex-end" }
              : { justifyContent: "flex-start" }
          }
        >
          <div className="message-bubble">
            <strong>{msg.username || "Anonymous"}:</strong> {msg.text}
          </div>
        </div>
      ))}
      <div ref={messageEndRef} />
    </div>
  );
}

// Message input component
function MessageInput() {
  const { currentMessage, setCurrentMessage, sendMessage, isConnected } =
    useChatStore();

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  return (
    <form onSubmit={handleSubmit} className="message-form">
      <input
        type="text"
        value={currentMessage}
        onChange={(e) => setCurrentMessage(e.target.value)}
        placeholder="Type a message"
        disabled={!isConnected}
      />
      <button type="submit" disabled={!isConnected}>
        Send
      </button>
    </form>
  );
}

// Connection status indicator
function ConnectionStatus() {
  const isConnected = useChatStore((state) => state.isConnected);

  return (
    <div className={`status ${isConnected ? "online" : "offline"}`}>
      {isConnected ? "Connected" : "Disconnected"}
    </div>
  );
}

// Main chat app component
function ChatApp() {
  const { connectSocket, disConnectSocket } = useChatStore();

  useEffect(() => {
    connectSocket();

    return () => {
      disConnectSocket();
    };
  }, [connectSocket, disConnectSocket]);

  return (
    <div className="chat-app">
      <h1>Real-time Chat</h1>
      <ConnectionStatus />
      <UsernameForm />
      <MessageList />
      <MessageInput />
    </div>
  );
}

export default ChatApp;
