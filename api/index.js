const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { LinkedInProfileScraper } = require("linkedin-profile-scraper");
const app = express();
const PORT = 5000;

app.use(bodyParser.json());
app.use(cors());

app.get("/", async (req, res) => {
  return res.json({ flag: "true", message: "server is working" });
});
app.post("/getInfo", async (req, res) => {
  const { url, lib_at } = req.body;
  const scraper = new LinkedInProfileScraper({
    sessionCookieValue: lib_at,
    keepAlive: false,
  });

  await scraper.setup();

  const result = await scraper.run(url);
  res.json(result);
  console.log(result);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
