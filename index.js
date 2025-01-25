// server.js
const express = require("express");
const fetch = require("node-fetch"); // or "axios" if you prefer

const app = express();
const PORT = process.env.PORT || 3000;

// This endpoint queries the user's on-sale game passes.
// For demonstration, we may use a Roblox API like:
// "https://catalog.roblox.com/v1/search/items/details?CreatorTargetId={userId}&Limit=30&Subcategory=GamePass"
// to get up to 30 passes, etc.
//
// Note: Some of these endpoints might require trial/error to find a stable one.

app.get("/getpasses", async (req, res) => {
  try {
    // 1. Read the "userId" parameter from the query string
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    // 2. Construct a Roblox catalog API URL
    // We'll try searching for items of type "Game Pass" by that creator.
    // This endpoint (catalog.roblox.com) may change or have limitations.
    // The "CreatorType=User" param ensures we're looking for user-owned items.
    // Subcategory=GamePass helps narrow it down.

    const limit = 30; // number of results to fetch (max limit can vary)
    const url = `https://catalog.roblox.com/v1/search/items/details?CreatorTargetId=${userId}&CreatorType=User&Limit=${limit}&Subcategory=GamePass`;

    // 3. Make a request to Roblox
    const response = await fetch(url, {
      method: "GET",
      headers: {
        // Some endpoints might need special headers or cookies for more results.
      },
    });

    if (!response.ok) {
      return res.status(500).json({ error: "Error contacting Roblox catalog" });
    }

    // 4. Parse the JSON
    const data = await response.json();

    // "data" may look like { data: [ {id, name, price, etc.}, ... ] }
    // We'll pass along "id", "name", "price" for each pass
    const result = [];
    if (data && data.data) {
      for (const item of data.data) {
        // Some items might not be on sale or might have no price
        // You can check item.priceStatus or item.price if you want only on-sale items
        result.push({
          id: item.id,
          name: item.name,
          price: item.price,
          priceStatus: item.priceStatus,
        });
      }
    }

    // 5. Return that list as JSON
    return res.json({ userId, passes: result });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
