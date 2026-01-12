const express = require("express");
const path = require("path");

const app = express();
const PORT = 3050;

// Serve static files from current directory
app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "app.html"));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
