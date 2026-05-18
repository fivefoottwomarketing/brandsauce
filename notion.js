const { Client } = require("@notionhq/client");

// Your Notion database IDs
const CORE_VALUES_DB = "42de464ed01d47eab2c9b88bc5d8efaa";
const VOICE_TRAITS_DB = "9e7ca4ac0c684321ad4d1b063cf08d5e";

const notion = new Client({ auth: "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" });
// Helper: extract plain text from rich text array
function richText(arr) {
  if (!arr || !arr.length) return "";
  return arr.map((t) => t.plain_text).join("");
}

// Helper: extract multi-select names
function multiSelect(arr) {
  if (!arr || !arr.length) return [];
  return arr.map((t) => t.name);
}

async function getCoreValues() {
  const pages = [];
  let cursor = undefined;
  do {
    const res = await notion.databases.query({
      database_id: CORE_VALUES_DB,
      start_cursor: cursor,
      page_size: 100,
    });
    pages.push(...res.results);
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);

  return pages
    .filter((p) => p.object === "page" && p.properties)
    .map((p) => {
      const props = p.properties;
      return {
        id: p.id,
        name: richText(props["Name"]?.title),
        description: richText(props["Description"]?.rich_text),
        altOption: richText(props["Alt Option"]?.rich_text),
        tags: multiSelect(props["Tags"]?.multi_select),
      };
    })
    .filter((v) => v.name);
}

async function getVoiceTraits() {
  const pages = [];
  let cursor = undefined;
  do {
    const res = await notion.databases.query({
      database_id: VOICE_TRAITS_DB,
      start_cursor: cursor,
      page_size: 100,
    });
    pages.push(...res.results);
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);

  return pages
    .filter((p) => p.object === "page" && p.properties)
    .map((p) => {
      const props = p.properties;
      return {
        id: p.id,
        name: richText(props["Name"]?.title),
        description: richText(props["Description"]?.rich_text),
        dos: richText(props["Do's"]?.rich_text),
        donts: richText(props["Don'ts"]?.rich_text),
        example: richText(props["Example"]?.rich_text),
        archetypes: multiSelect(props["Brand Archetype"]?.multi_select),
        keywords: multiSelect(props["Keywords"]?.multi_select),
      };
    })
    .filter((v) => v.name);
}

module.exports = async (req, res) => {
  // CORS headers so the browser can call this
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (!process.env.NOTION_TOKEN) {
    return res.status(500).json({ error: "NOTION_TOKEN environment variable not set." });
  }

  const { type } = req.query;

  try {
    if (type === "core-values") {
      const data = await getCoreValues();
      return res.status(200).json({ data });
    }

    if (type === "voice-traits") {
      const data = await getVoiceTraits();
      return res.status(200).json({ data });
    }

    if (type === "all") {
      const [coreValues, voiceTraits] = await Promise.all([
        getCoreValues(),
        getVoiceTraits(),
      ]);
      return res.status(200).json({ coreValues, voiceTraits });
    }

    return res.status(400).json({ error: "Invalid type. Use: core-values, voice-traits, or all" });
  } catch (err) {
    console.error("Notion API error:", err);
    return res.status(500).json({
      error: "Failed to fetch from Notion.",
      details: err.message,
    });
  }
};
