const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(bodyParser.json());
app.use(cors());

app.get("/", async (req, res) => {
  return res.json({ flag: "true", message: "server is working" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
