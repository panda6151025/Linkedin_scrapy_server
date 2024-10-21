// server/index.js
const express = require("express");
const bodyParser = require("body-parser");
const fetch = (async () => await import("node-fetch"))();
const dotenv = require("dotenv"); // Import dotenv to load .env variables
const cors = require("cors");
// Load environment variables from the .env file
dotenv.config();

const app = express();
const PORT = 5000;

// Use environment variables for Telegram API
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
let monitoring = false;

app.use(bodyParser.json());
app.use(cors());

app.post("/api/start-monitoring", async (req, res) => {
  const { currencyPair, id } = req.body;
  monitoring = true;

  while (monitoring) {
    // Fetch candle data
    const candles = await fetchCandleData(currencyPair);
    const sequences = checkPatterns(candles);

    if (sequences.length > 0) {
      await sendAlert(
        `Alert: Unique bullish sequence detected for ${currencyPair}`,
        id
      );
    }

    await new Promise((resolve) => setTimeout(resolve, 60000)); // Sleep for 60 seconds
  }

  res.send("Monitoring started");
});

app.post("/api/stop-monitoring", (req, res) => {
  monitoring = false;
  res.send("Monitoring stopped");
});
app.get("/", async (req, res) => {
  return res.json({ flag: "true", message: "server is working" });
});
// Function to fetch candle data
const fetchCandleData = async (currencyPair) => {
  const response = await fetch(
    `https://api.yourdata.com/v1/candles/${currencyPair}/data`
  );
  return response.json();
};

// Function to check for patterns
const checkPatterns = (candles) => {
  const sequences = [];
  for (let i = 0; i < candles.length - 3; i++) {
    const currentSequence = candles.slice(i, i + 4);

    if (currentSequence.every((candle) => candle.type === "bullish")) {
      if (!threeCandlePatternExists(currentSequence)) {
        sequences.push(currentSequence);
      }
    }
  }
  return sequences;
};

// Check for repeated three-candle patterns
const threeCandlePatternExists = (sequence) => {
  return (
    sequence[0].type === sequence[1].type &&
    sequence[1].type === sequence[2].type
  );
};

// Function to send alert to Telegram
const sendAlert = async (message, id) => {
  await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: "POST",
    body: JSON.stringify({
      chat_id: id,
      text: message,
    }),
    headers: { "Content-Type": "application/json" },
  });
};

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
