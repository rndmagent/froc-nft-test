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


// ==== EVOLUTION CYCLE ====

const EVOLUTION_INTERVAL = 60 * 1000; // каждые 60 секунд

setInterval(() => {
  try {
    const dbPath = path.join(__dirname, "db", "db.json");
    let dbData = JSON.parse(fs.readFileSync(dbPath));

    // 1. Ищем NFT со статусом normal
    const normalTokens = dbData.filter(nft => nft.status === "normal");
    if (normalTokens.length === 0) return;

    // 2. Выбираем одну случайную
    const randomNFT = normalTokens[Math.floor(Math.random() * normalTokens.length)];
    randomNFT.status = "evolving";

    // 3. Сохраняем новое состояние
    fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2));
    console.log(`FROC #${randomNFT.tokenId} получил статус evolving`);

    // 4. Таймер для завершения эволюции через 60 секунд
    setTimeout(() => {
      let updatedData = JSON.parse(fs.readFileSync(dbPath));
      const evolvingNFT = updatedData.find(n => n.tokenId === randomNFT.tokenId);
      if (!evolvingNFT) return;

      // Возможные поля для изменения
      const fields = ["back", "body", "face", "item"];
      const fieldToChange = fields[Math.floor(Math.random() * fields.length)];

      // Находим список всех доступных значений для этого поля
      const currentValue = evolvingNFT[fieldToChange];
      const options = [...new Set(updatedData.map(nft => nft[fieldToChange]))]
        .filter(val => val !== currentValue);

      if (options.length > 0) {
        const newValue = options[Math.floor(Math.random() * options.length)];
        evolvingNFT[fieldToChange] = newValue;
        console.log(`FROC #${evolvingNFT.tokenId} обновил ${fieldToChange} на ${newValue}`);
      }

      evolvingNFT.status = "normal";
      fs.writeFileSync(dbPath, JSON.stringify(updatedData, null, 2));
    }, 60 * 1000);

  } catch (err) {
    console.error("Evolution error:", err);
  }
}, EVOLUTION_INTERVAL);
