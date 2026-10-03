import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, GenerateVideosOperation } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Use JSON middleware with increased limit for base64 images
  app.use(express.json({ limit: "50mb" }));

  // 1. Start generating video
  app.post("/api/generate-video", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not set.");
      }
      const ai = new GoogleGenAI({ apiKey });

      const { prompt, imageBytes, mimeType, aspectRatio = "16:9" } = req.body;
      
      const config: any = {
        numberOfVideos: 1,
        resolution: "720p",
        aspectRatio: aspectRatio
      };

      const generateParams: any = {
        model: "veo-3.1-fast-generate-preview",
        config
      };

      if (prompt) {
        generateParams.prompt = prompt;
      } else {
        generateParams.prompt = "A promotional video showcasing the product with dynamic movements";
      }

      if (imageBytes && mimeType) {
        generateParams.image = {
          imageBytes,
          mimeType
        };
      }

      const operation = await ai.models.generateVideos(generateParams);
      res.json({ operationName: operation.name });
    } catch (error: any) {
      console.error("Error generating video:", error);
      res.status(500).json({ error: error.message || "Failed to generate video" });
    }
  });

  // 2. Poll video status
  app.post("/api/video-status", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not set.");
      }
      const ai = new GoogleGenAI({ apiKey });

      const { operationName } = req.body;
      if (!operationName) return res.status(400).json({ error: "operationName is required" });

      const op = new GenerateVideosOperation();
      op.name = operationName;
      
      const updated = await ai.operations.getVideosOperation({ operation: op });
      res.json({ done: updated.done });
    } catch (error: any) {
      console.error("Error checking video status:", error);
      res.status(500).json({ error: error.message || "Failed to check status" });
    }
  });

  // 3. Download video
  app.post("/api/video-download", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not set.");
      }
      const ai = new GoogleGenAI({ apiKey });

      const { operationName } = req.body;
      if (!operationName) return res.status(400).json({ error: "operationName is required" });

      const op = new GenerateVideosOperation();
      op.name = operationName;
      const updated = await ai.operations.getVideosOperation({ operation: op });
      
      if (!updated.done) {
        return res.status(400).json({ error: "Operation is not complete" });
      }

      const uri = updated.response?.generatedVideos?.[0]?.video?.uri;
      if (!uri) {
        return res.status(404).json({ error: "Video URI not found in completed operation" });
      }

      const videoRes = await fetch(uri, {
        headers: { 'x-goog-api-key': apiKey },
      });

      if (!videoRes.ok) {
         throw new Error(`Failed to fetch video from google: ${videoRes.statusText}`);
      }

      res.setHeader("Content-Type", "video/mp4");
      
      // Node 18+ Web Streams API conversion
      // @ts-ignore
      const reader = videoRes.body?.getReader();
      if (!reader) throw new Error("Could not get response stream");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
      res.end();

    } catch (error: any) {
      console.error("Error downloading video:", error);
      res.status(500).json({ error: error.message || "Failed to download video" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
