import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { fileURLToPath } from 'url';
import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

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
  app.post("/api/leads", async (req, res) => {
    try {
      const { name, email, phone, message, source, details, tag } = req.body;
      console.log(`New lead received: ${name} (${email}) from ${source} [Tag: ${tag || "None"}]`);

      // 1. Send Email Notification to r0504141516@gmail.com via Resend
      const adminEmail = "r0504141516@gmail.com";
      const resendApiKey = process.env.RESEND_API_KEY;
      let emailSent = false;

      if (resendApiKey) {
        try {
          const emailBody = `
            <div style="direction: rtl; text-align: right; font-family: sans-serif; padding: 20px; background-color: #f4f4f7; border-radius: 12px; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1a1a24; border-bottom: 3px solid #fee000; padding-bottom: 12px; margin-top: 0; font-size: 22px;">ליד חדש התקבל במערכת מרכז רייניץ!</h2>
              
              <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); margin-bottom: 20px;">
                <p style="margin: 8px 0; font-size: 16px; color: #333;"><strong style="color: #1a1a24;">שם מלא:</strong> ${name || "לא צוין"}</p>
                <p style="margin: 8px 0; font-size: 16px; color: #333;"><strong style="color: #1a1a24;">מספר טלפון:</strong> <a href="tel:${phone}" style="color: #0076ff; text-decoration: none; font-weight: bold;">${phone || "לא צוין"}</a></p>
                <p style="margin: 8px 0; font-size: 16px; color: #333;"><strong style="color: #1a1a24;">כתובת דוא"ל:</strong> ${email || "לא צוין"}</p>
                <p style="margin: 8px 0; font-size: 16px; color: #333;"><strong style="color: #1a1a24;">מקור הליד:</strong> <span style="background-color: #fee00020; padding: 3px 8px; border-radius: 4px; font-weight: bold; color: #333;">${source || "לא צוין"}</span></p>
                ${tag ? `
                <p style="margin: 8px 0; font-size: 16px; color: #333;"><strong style="color: #1a1a24;">תגית / פעולה:</strong> <span style="background-color: #ff572215; padding: 3px 8px; border-radius: 4px; font-weight: bold; color: #d32f2f;">${tag}</span></p>
                ` : ""}
              </div>

              ${message ? `
                <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); margin-bottom: 20px;">
                  <h4 style="margin: 0 0 10px 0; color: #1a1a24; font-size: 15px;">הודעה / הערות:</h4>
                  <p style="margin: 0; line-height: 1.6; color: #555; white-space: pre-wrap;">${message}</p>
                </div>
              ` : ""}

              ${details && Object.keys(details).length > 0 ? `
                <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); margin-bottom: 20px; direction: ltr; text-align: left;">
                  <h4 style="margin: 0 0 10px 0; color: #1a1a24; font-size: 15px; direction: rtl; text-align: right;">פרטי עסקת מחשבון נוספים:</h4>
                  <pre style="margin: 0; font-family: monospace; font-size: 13px; color: #444; background: #fafafa; padding: 10px; border-radius: 4px; overflow-x: auto;">${JSON.stringify(details, null, 2)}</pre>
                </div>
              ` : ""}
              
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 25px 0;" />
              <p style="font-size: 12px; color: #718096; text-align: center; margin: 0;">הודעה זו נשלחה אוטומטית ממערכת מרכז רייניץ נדל"ן וכלכלה נבונה.</p>
            </div>
          `;

          const emailResponse = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${resendApiKey}`
            },
            body: JSON.stringify({
              from: "מרכז רייניץ <onboarding@resend.dev>",
              to: adminEmail,
              subject: `ליד חדש: ${name || "לקוח"} (${source || "אתר"})`,
              html: emailBody
            })
          });

          if (emailResponse.ok) {
            emailSent = true;
            console.log(`Notification email sent successfully to ${adminEmail}`);
          } else {
            const errText = await emailResponse.text();
            console.error("Resend API returned an error:", errText);
          }
        } catch (e) {
          console.error("Failed to send email via Resend API:", e);
        }
      } else {
        console.log("RESEND_API_KEY environment variable is not defined. Skipping email dispatch.");
      }

      // 2. Forward lead details directly to Plando (via webhook/Zapier/Make URL)
      const plandoWebhookUrl = process.env.PLANDO_WEBHOOK_URL;
      let plandoSynced = false;

      if (plandoWebhookUrl) {
        try {
          const plandoPayload = {
            name,
            firstName: name ? name.split(" ")[0] : "",
            lastName: name ? name.split(" ").slice(1).join(" ") : "",
            email,
            phone,
            message: message || "",
            source: source || "Website Form",
            tag: tag || "",
            details: details || {},
            createdAt: new Date().toISOString()
          };

          const plandoResponse = await fetch(plandoWebhookUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(plandoPayload)
          });

          if (plandoResponse.ok) {
            plandoSynced = true;
            console.log("Successfully synchronized lead to Plando webhook.");
          } else {
            const errText = await plandoResponse.text();
            console.error("Plando webhook returned an error status:", plandoResponse.status, errText);
          }
        } catch (e) {
          console.error("Failed to forward lead to Plando webhook:", e);
        }
      } else {
        // Direct integration with Plando Lead Capture Form API using access key
        const plandoAccessKey = process.env.PLANDO_ACCESS_KEY || "597df96284d52e5dd3be33b6ff7afc68";
        console.log(`PLANDO_WEBHOOK_URL not defined. Attempting direct Plando contact registration using access key ending in ...${plandoAccessKey.slice(-6)}`);
        
        try {
          const params = new URLSearchParams();
          params.append("access_key", plandoAccessKey);
          params.append("no_redirect", "1");
          params.append("contact[customer_cat_id]", "0");
          
          const firstName = name ? name.split(" ")[0] : "";
          const lastName = name ? name.split(" ").slice(1).join(" ") : name || "לקוח";
          
          params.append("contact[first_name]", firstName);
          params.append("contact[last_name]", lastName);
          params.append("contact[primary_email]", email || "");
          params.append("contact[mobile1]", phone || "");
          
          if (tag) {
            params.append("contact[tags]", tag);
            params.append("contact[tag]", tag);
          }
          
          // Construct a detailed remark with source, tag, message, and transaction details
          let remarkText = "";
          if (tag) {
            remarkText += `תגית / פעולה: ${tag}\n`;
          }
          remarkText += `מקור: ${source || "לא צוין"}`;
          if (message) {
            remarkText += `\nהודעה: ${message}`;
          }
          if (details && Object.keys(details).length > 0) {
            remarkText += `\nפרטים נוספים: ${JSON.stringify(details, null, 2)}`;
          }
          params.append("contact[remark]", remarkText);
          
          const directPlandoUrl = "https://plando.co.il/contacts/lead_form1";
          
          const directResponse = await fetch(directPlandoUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded"
            },
            body: params.toString()
          });

          if (directResponse.ok) {
            const resText = await directResponse.text();
            try {
              const resultJson = JSON.parse(resText);
              if (resultJson && (resultJson.err === "0" || resultJson.err === 0)) {
                plandoSynced = true;
                console.log(`Successfully synchronized lead directly to Plando CRM. Contact ID: ${resultJson.contact_id}`);
              } else {
                console.error("Direct Plando CRM returned an application-level error:", resultJson);
              }
            } catch (jsonErr) {
              if (resText.includes("errdesc") || resText.includes("contact_id") || resText.includes('"err":0') || resText.includes('"err":"0"')) {
                plandoSynced = true;
                console.log("Direct Plando CRM succeeded (parsed via text substring search).");
              } else {
                console.error("Failed to parse Plando CRM response as JSON:", resText, jsonErr);
              }
            }
          } else {
            const errText = await directResponse.text();
            console.error("Direct Plando CRM returned error status:", directResponse.status, errText);
          }
        } catch (directErr) {
          console.error("Failed to sync lead directly to Plando CRM:", directErr);
        }
      }

      res.json({
        success: true,
        emailSent,
        plandoSynced,
        message: "Lead successfully recorded"
      });
    } catch (err: any) {
      console.error("General error processing lead in server:", err);
      res.status(500).json({ success: false, error: err?.message || "Internal server error" });
    }
  });

  // API Route to receive notifications when someone books/schedules an appointment on Plando
  app.post("/api/plando-webhook", async (req, res) => {
    try {
      console.log("Received Plando Webhook payload:", JSON.stringify(req.body, null, 2));
      const { name, email, phone, date, time, service, event } = req.body;

      // Send Email Notification to r0504141516@gmail.com via Resend
      const adminEmail = "r0504141516@gmail.com";
      const resendApiKey = process.env.RESEND_API_KEY;
      let emailSent = false;

      if (resendApiKey) {
        try {
          const emailBody = `
            <div style="direction: rtl; text-align: right; font-family: sans-serif; padding: 20px; background-color: #f0fdf4; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #bbf7d0;">
              <h2 style="color: #14532d; border-bottom: 3px solid #4ade80; padding-bottom: 12px; margin-top: 0; font-size: 22px;">פגישה חדשה נקבעה בפלאנדו (Plando)! 🎉</h2>
              
              <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); margin-bottom: 20px;">
                <p style="margin: 8px 0; font-size: 16px; color: #333;"><strong style="color: #14532d;">שם הלקוח:</strong> ${name || "לא צוין"}</p>
                <p style="margin: 8px 0; font-size: 16px; color: #333;"><strong style="color: #14532d;">טלפון:</strong> <a href="tel:${phone}" style="color: #16a34a; text-decoration: none; font-weight: bold;">${phone || "לא צוין"}</a></p>
                <p style="margin: 8px 0; font-size: 16px; color: #333;"><strong style="color: #14532d;">אימייל:</strong> ${email || "לא צוין"}</p>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 15px 0;" />
                <p style="margin: 8px 0; font-size: 16px; color: #333;"><strong style="color: #14532d;">תאריך פגישה:</strong> <span style="background-color: #f0fdf4; padding: 4px 10px; border-radius: 6px; font-weight: bold; color: #16a34a;">${date || "לא צוין"}</span></p>
                <p style="margin: 8px 0; font-size: 16px; color: #333;"><strong style="color: #14532d;">שעה:</strong> <span style="background-color: #f0fdf4; padding: 4px 10px; border-radius: 6px; font-weight: bold; color: #16a34a;">${time || "לא צוין"}</span></p>
                <p style="margin: 8px 0; font-size: 16px; color: #333;"><strong style="color: #14532d;">סוג השירות/שירות:</strong> ${service || "פגישת ייעוץ"}</p>
              </div>

              <p style="font-size: 12px; color: #718096; text-align: center; margin: 0;">הודעה זו נשלחה אוטומטית ממערכת מרכז רייניץ בעקבות קביעת תור ביומן של פלאנדו.</p>
            </div>
          `;

          const emailResponse = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${resendApiKey}`
            },
            body: JSON.stringify({
              from: "מרכז רייניץ <onboarding@resend.dev>",
              to: adminEmail,
              subject: `פגישה חדשה נקבעה: ${name || "לקוח"} - ${date || ""} ${time || ""}`,
              html: emailBody
            })
          });

          if (emailResponse.ok) {
            emailSent = true;
            console.log(`Appointment email notification sent successfully to ${adminEmail}`);
          } else {
            const errText = await emailResponse.text();
            console.error("Resend API error for webhook:", errText);
          }
        } catch (e) {
          console.error("Failed to send webhook notification email:", e);
        }
      }

      res.json({ success: true, message: "Webhook successfully received and processed", emailSent });
    } catch (err: any) {
      console.error("Error processing Plando webhook:", err);
      res.status(500).json({ success: false, error: err?.message || "Internal server error" });
    }
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
