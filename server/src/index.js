const { join } = require("path");
const { app, server } = require("./config/socket.io");
const cors = require("cors");

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST"],
  })
);

app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "view", "index.html"));
});

server.listen(3000, () => {
  console.log("server running at http://localhost:3000");
});
