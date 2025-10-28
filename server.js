import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "✅ Hostinger Proxy Running on Railway" });
});

app.post("/api/hostinger", async (req, res) => {
  const apiToken = req.headers.authorization?.replace("Bearer ", "");
  if (!apiToken)
    return res.status(400).json({ error: "Missing Hostinger API token" });

  const { domain, type, name, value, ttl } = req.body;
  if (!domain || !type || !name || !value) {
    return res.status(400).json({ error: "Missing DNS fields" });
  }

  try {
    const endpoint = `https://api.hostinger.com/v2/domains/${domain}/records`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ type, name, value, ttl: ttl || 3600 }),
    });

    const result = await response.json();
    return res.status(response.status).json(result);
  } catch (err) {
    return res.status(500).json({
      error: "Proxy request failed",
      details: err.message,
    });
  }
});

// Railway auto assigns PORT env variable:
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log("🚀 Proxy Running on Port", PORT));
