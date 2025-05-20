import React, { useEffect, useRef, useState } from "react";
import useChatStore from "../hooks/useChatStore";

// Username form component
function UsernameForm() {
  const { username, setUsername } = useChatStore();
  const [tempUsername, setTempUsername] = useState(username);

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
  const { messages, username, typingUser, deleteMessage, editMessage } =
    useChatStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUser]);

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
            <div className="message-content">
              <div>
                <strong>{msg.username || "Anonymous"}:</strong> {msg.text}
              </div>
              {msg.username === username && (
                <div>
                  <button
                    className="delete-button"
                    onClick={() => deleteMessage(msg.id)}
                  >
                    Delete
                  </button>
                  <button
                    className="edit-button"
                    onClick={() => editMessage(msg)}
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
            <span
              className="message-date"
              style={
                msg.username === username
                  ? { textAlign: "right" }
                  : { textAlign: "left" }
              }
            >
              {new Date(msg.date).toLocaleTimeString()}
            </span>
            {msg.isEdited ? <span className="message-date">Edited</span> : ""}
          </div>
        </div>
      ))}
      {/* Typing indicator */}
      <div className="message typing-indicator">
        {typingUser &&
          typingUser.typing &&
          typingUser.username !== username && (
            <div className="message-bubble">
              {typingUser.username} is typing...
            </div>
          )}
      </div>
      <div ref={messageEndRef} />
    </div>
  );
}

// Message input component
function MessageInput() {
  const {
    currentMessage,
    setCurrentMessage,
    sendMessage,
    isConnected,
    setTypingUser,
  } = useChatStore();

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  const handleChange = (e) => {
    setCurrentMessage(e.target.value);
  };

  const handleBlur = () => {
    setTypingUser(false);
  };

  const handleFocus = () => {
    setTypingUser(true);
  };

  return (
    <form onSubmit={handleSubmit} className="message-form">
      <input
        type="text"
        value={currentMessage}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder="Type a message"
        autoFocus={true}
        autoComplete="off"
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
  const { isConnected } = useChatStore();

  return (
    <div className={`status ${isConnected ? "online" : "offline"}`}>
      {isConnected ? "Connected" : "Disconnected"}
    </div>
  );
}

// Online status component
function OnlineStatus() {
  const { onlineUsers } = useChatStore();

  return (
    <div className="online-status">
      <h2>Online Users</h2>
      <ul>
        {onlineUsers?.map((user, index) => (
          <li key={index}>{user}</li>
        ))}
      </ul>
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
      <div className="chat-header">
        <h1 className="typed-out">Real-time Chat</h1>
      </div>
      <ConnectionStatus />
      <OnlineStatus />
      <UsernameForm />
      <MessageList />
      <MessageInput />
    </div>
  );
}

export default ChatApp;
