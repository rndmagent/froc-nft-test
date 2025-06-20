
const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "db", "db.json");

function loadDB() {
  return JSON.parse(fs.readFileSync(dbPath));
}

function saveDB(db) {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

function getRandomEligibleNFT(db) {
  const eligible = db.filter((nft) => nft.status === "normal");
  if (eligible.length === 0) return null;
  return eligible[Math.floor(Math.random() * eligible.length)];
}

function getRandomValue(arr, exclude) {
  const filtered = arr.filter((val) => val !== exclude);
  return filtered[Math.floor(Math.random() * filtered.length)];
}

const options = {
  back: ["background_common1", "background_common2", "background_common3"],
  body: ["body_common1", "body_common2", "body_common3"],
  face: ["face_common1", "face_common2", "face_common3"],
  item: ["item_common1", "item_common2", "item_common3"]
};

function evolveOneLayer(nft) {
  const layers = ["back", "body", "face", "item"];
  const chosenLayer = layers[Math.floor(Math.random() * layers.length)];
  const newValue = getRandomValue(options[chosenLayer], nft[chosenLayer]);

  const oldValue = nft[chosenLayer];
  nft[chosenLayer] = newValue;
  nft.status = "normal"; // цикл продолжается

  return { tokenId: nft.tokenId, layer: chosenLayer, oldValue, newValue };
}

function runCycle() {
  let db = loadDB();
  const evolving = db.find((nft) => nft.status === "evolution");

  if (evolving) {
    const result = evolveOneLayer(evolving);
    console.log(`✨ FROC #${result.tokenId} эволюционировал: ${result.layer} ${result.oldValue} → ${result.newValue}`);
  } else {
    const next = getRandomEligibleNFT(db);
    if (next) {
      next.status = "evolution";
      console.log(`⏳ FROC #${next.tokenId} получил статус evolution...`);
    } else {
      console.log("⚠️ Нет доступных FROC для мутации.");
    }
  }

  saveDB(db);
}

// ⏱ Запускаем цикл каждую минуту
console.log("🧬 Запущен evolve-цикл. Проверка каждую минуту...");
runCycle(); // первый запуск сразу

setInterval(() => {
  runCycle();
}, 60 * 1000); // 60 секунд
