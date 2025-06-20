
const fs = require("fs");
const LIMIT = 20; // ← Сколько NFT ты хочешь взять

// Путь к исходному metadata от HashLips
const metadata = require("./_metadata.json");

const db = metadata.slice(0, LIMIT).map((item, index) => {
  const attrs = {};
  item.attributes.forEach(attr => {
    const key = attr.trait_type.toLowerCase();
    attrs[key] = attr.value;
  });

  return {
    tokenId: index,
    back: attrs["back"] || "unknown",
    body: attrs["body"] || "unknown",
    face: attrs["face"] || "unknown",
    item: attrs["item"] || "unknown",
    fx: "none",
    status: "normal"
  };
});

fs.writeFileSync("db.json", JSON.stringify(db, null, 2));
console.log("✅ db.json сгенерирован успешно!");
