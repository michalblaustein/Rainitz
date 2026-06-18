import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { fileURLToPath } from 'url';
import { GoogleGenAI } from "@google/genai";
import fs from "fs";

// Helper to resolve paths in a way that works in both ESM (tsx) and CJS (bundled esbuild)
const getPaths = () => {
  let filename = "";
  let dirname = "";
  try {
    if (typeof import.meta !== "undefined" && import.meta.url) {
      filename = fileURLToPath(import.meta.url);
      dirname = path.dirname(filename);
    }
  } catch (e) {}

  if (!filename) {
    filename = typeof __filename !== "undefined" ? __filename : "";
    dirname = typeof __dirname !== "undefined" ? __dirname : process.cwd();
  }

  return { filename, dirname };
};

const { filename: __filename, dirname: __dirname } = getPaths();

// Lazy Initialize Gemini Client to avoid module-load time crashes if GEMINI_API_KEY is missing
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Helper to fetch Google Drive/External images and convert them to Base64
async function fetchImageAsBase64(url: string): Promise<{ data: string; mimeType: string }> {
  let finalUrl = url;
  let fileId = "";

  const driveFileRegex = /\/file\/d\/([a-zA-Z0-9_-]+)/;
  const driveIdRegex = /[?&]id=([a-zA-Z0-9_-]+)/;

  const fileMatch = url.match(driveFileRegex);
  const idMatch = url.match(driveIdRegex);

  if (fileMatch) {
    fileId = fileMatch[1];
  } else if (idMatch) {
    fileId = idMatch[1];
  }

  // If a Google Drive link is parsed, get its high-resolution thumbnail
  if (fileId) {
    finalUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1600`;
  }

  const response = await fetch(finalUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const mimeType = response.headers.get("content-type") || "image/jpeg";
  const base64 = buffer.toString("base64");

  return { data: base64, mimeType };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Set payload size limits to allow base64 images
  app.use(express.json({ limit: "15mb" }));

  // API Routes
  app.post("/api/leads", (req, res) => {
    const { name, email, phone, source } = req.body;
    console.log(`New lead received: ${name} (${email}) from ${source}`);
    res.json({ success: true, message: "Lead received" });
  });

  // API route to get cached/backed-up articles when Firestore is down or blocked (Quota limit)
  app.get("/api/articles", (req, res) => {
    try {
      const backupPath = path.join(process.cwd(), "src", "data", "articles.json");
      if (fs.existsSync(backupPath)) {
        const data = fs.readFileSync(backupPath, "utf-8");
        return res.json(JSON.parse(data));
      }
      res.json([]);
    } catch (error) {
      console.error("Error reading articles backup JSON:", error);
      res.status(500).json({ error: "Failed to read backup articles" });
    }
  });

  // API route to sync/save current articles to server-side backup JSON file from the client
  app.post("/api/articles/sync", (req, res) => {
    try {
      const articles = req.body;
      if (!Array.isArray(articles)) {
        return res.status(400).json({ error: "Payload must be a valid array of articles" });
      }
      const backupPath = path.join(process.cwd(), "src", "data", "articles.json");
      fs.writeFileSync(backupPath, JSON.stringify(articles, null, 2), "utf-8");
      console.log(`Server-side articles backup updated successfully (count: ${articles.length})`);
      res.json({ success: true, count: articles.length });
    } catch (error: any) {
      console.error("Error synchronizing articles to backup JSON:", error);
      res.status(500).json({ error: error?.message || "Failed to update backup" });
    }
  });

  // AI OCR extraction endpoint for articles
  app.post("/api/articles/ocr", async (req, res) => {
    try {
      const { imageUrl, base64, mimeType } = req.body;
      let imgData = "";
      let imgMimeType = "image/jpeg";

      if (imageUrl) {
        console.log(`Fetching in-memory image from URL: ${imageUrl}`);
        const result = await fetchImageAsBase64(imageUrl);
        imgData = result.data;
        imgMimeType = result.mimeType;
      } else if (base64) {
        imgData = base64;
        imgMimeType = mimeType || "image/jpeg";
      } else {
        return res.status(400).json({ error: "No image source provided" });
      }

      console.log(`Invoking Gemini for Hebrew article OCR extraction...`);
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: imgMimeType,
                data: imgData,
              },
            },
            {
              text: "אנא בצע חילוץ טקסט (OCR) מלא ומדויק לעברית מתוך תמונת הכתבה הזו. חלץ את הכותרות המרכזיות, כותרות המשנה וכל גוף הכתבה במדויק. ספק תוצאה נקייה בלבד בפורמט Markdown קריא, ללא כל הסברים, הערות, או הוספות אישיות שלך כמודל בינה מלאכותית. הגש אך ורק את הטקסט המקורי בעימוד ופסקאות נכונים."
            }
          ]
        }
      });

      const extractedText = response.text || "";
      res.json({ success: true, text: extractedText });
    } catch (error: any) {
      console.error("Gemini OCR error:", error);
      res.status(500).json({ error: error?.message || "Failed to parse article image" });
    }
  });

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
