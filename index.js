const express = require("express");
const fs = require("fs");
const loadDB = () => JSON.parse(fs.readFileSync("./db/db.json", "utf-8"));
const sharp = require("sharp");
const path = require("path");
const app = express();
const PORT = 3000;

const db = require("./db/db.json");

app.get("/api/:id", (req, res) => {
  const tokenId = parseInt(req.params.id);
  const db = loadDB();
  const froc = db.find((nft) => nft.tokenId === tokenId);
  if (!froc) return res.status(404).json({ error: "NFT not found" });

  const metadata = {
    name: `FROC #${tokenId}`,
    description: "Test FROC NFT with dynamic attributes",
    image: `http://localhost:${PORT}/api/image/${tokenId}`,
    attributes: [
      { trait_type: "Background", value: froc.back },
      { trait_type: "Body", value: froc.body },
      { trait_type: "Face", value: froc.face },
      { trait_type: "Item", value: froc.item },
      { trait_type: "FX", value: froc.fx },
      { trait_type: "Status", value: froc.status }
    ]
  };

  res.json(metadata);
});

app.get("/api/image/:id", async (req, res) => {
  const tokenId = parseInt(req.params.id);
  const db = loadDB();
  const froc = db.find((nft) => nft.tokenId === tokenId);
  if (!froc) return res.status(404).send("NFT not found");

  try {
    const layers = [
      `layers/1_back/${froc.back}.png`,
      `layers/2_body/${froc.body}.png`,
      `layers/3_face/${froc.face}.png`,
      `layers/4_item/${froc.item}.png`
    ];

    const base = sharp(layers[0]);
    const rest = layers.slice(1).map(file => ({ input: file }));

    const outputBuffer = await base.composite(rest).png().toBuffer();

    res.set("Content-Type", "image/png");
    res.send(outputBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).send("Image rendering error");
  }
});

app.listen(PORT, () => {
  console.log(`FROC Server running at http://localhost:${PORT}`);
});
