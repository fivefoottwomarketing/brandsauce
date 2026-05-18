const https = require("https");

const TOKEN = "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";
const CORE_VALUES_DB = "42de464ed01d47eab2c9b88bc5d8efaa";
const VOICE_TRAITS_DB = "9e7ca4ac0c684321ad4d1b063cf08d5e";

function notionRequest(path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: "api.notion.com",
      path,
      method: body ? "POST" : "GET",
      headers: {
        "Authorization": `Bearer ${TOKEN}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
        ...(data && { "Content-Length": Buffer.byteLength(data) }),
      },
    };
    const req = https.request(options, (res) => {
      let raw = "";
      res.on("data", (c) => raw += c);
      res.on("end", () => resolve(JSON.parse(raw)));
    });
    req.on("error", reject);
    if (data) req.write(data);
    req.end();
  });
}

function text(arr) { return (arr||[]).map(t => t.plain_text).join(""); }
function ms(arr) { return (arr||[]).map(t => t.name); }

async function queryDB(id) {
  const pages = [];
  let cursor;
  do {
    const res = await notionRequest(`/v1/databases/${id}/query`, cursor ? { start_cursor: cursor } : {});
    pages.push(...(res.results||[]));
    cursor = res.has_more ? res.next_cursor : null;
  } while (cursor);
  return pages;
}

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const [cvPages, vtPages] = await Promise.all([queryDB(CORE_VALUES_DB), queryDB(VOICE_TRAITS_DB)]);

    const coreValues = cvPages.map(p => ({
      id: p.id,
      name: text(p.properties?.Name?.title),
      description: text(p.properties?.Description?.rich_text),
      tags: ms(p.properties?.Tags?.multi_select),
    })).filter(v => v.name);

    const voiceTraits = vtPages.map(p => ({
      id: p.id,
      name: text(p.properties?.Name?.title),
      description: text(p.properties?.Description?.rich_text),
      dos: text(p.properties?.["Do's"]?.rich_text),
      donts: text(p.properties?.["Don'ts"]?.rich_text),
      example: text(p.properties?.Example?.rich_text),
      archetypes: ms(p.properties?.["Brand Archetype"]?.multi_select),
      keywords: ms(p.properties?.Keywords?.multi_select),
    })).filter(v => v.name);

    res.status(200).json({ coreValues, voiceTraits });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
};
