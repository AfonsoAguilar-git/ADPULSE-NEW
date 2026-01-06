import { GoogleGenAI, Type, Schema } from "@google/genai";
import { VideoGenerationConfig, VideoAnalysisResult, VideoPlan, ImageSize } from "../types";

// Helper to convert File to Base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = (error) => reject(error);
  });
};

// Helper to extract JSON from Markdown code blocks or raw text
const extractJSON = (text: string): any => {
    try {
        // First try to parse as is
        return JSON.parse(text);
    } catch (e) {
        // Try to clean markdown code blocks
        const markdownJson = text.match(/```json\s*([\s\S]*?)\s*```/);
        if (markdownJson) {
            return JSON.parse(markdownJson[1]);
        }
        
        // Try to find the first opening brace and last closing brace
        const firstBrace = text.indexOf('{');
        const lastBrace = text.lastIndexOf('}');
        
        if (firstBrace !== -1 && lastBrace !== -1) {
             const jsonString = text.substring(firstBrace, lastBrace + 1);
             return JSON.parse(jsonString);
        }
        
        throw new Error("Failed to extract valid JSON from response");
    }
};

export const analyzeVideo = async (input: File | string): Promise<VideoAnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const analysisSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      is_ad: { type: Type.BOOLEAN, description: "True if video is classified as an ad" },
      confidence_score: { type: Type.NUMBER, description: "0.0 to 1.0 confidence" },
      classification_reason: { type: Type.STRING, description: "Cite visual evidence for classification" },
      structure: {
        type: Type.OBJECT,
        properties: {
          hook: {
            type: Type.OBJECT,
            properties: {
                detected: { type: Type.BOOLEAN },
                type: { type: Type.STRING, description: "Type of hook (e.g., Visual Shock, Question, Negative Hook)" },
                description: { type: Type.STRING, description: "Detailed description of the first 3 seconds visuals and audio" },
                effectiveness_score: { type: Type.NUMBER, description: "1-10 score of hook stopping power" }
            },
            required: ["detected", "type", "description", "effectiveness_score"]
          },
          flow: {
              type: Type.OBJECT,
              properties: {
                  pacing: { type: Type.STRING, description: "Speed of cuts (e.g., Fast/TikTok, Slow/Cinematic)" },
                  structure_type: { type: Type.STRING, description: "Overall format (e.g., PAS, Testimonial, Unboxing)" }
              },
              required: ["pacing", "structure_type"]
          },
          elements: {
              type: Type.OBJECT,
              properties: {
                  audio_style: { type: Type.STRING, description: "Voiceover, Trending Music, ASMR, etc." },
                  visual_style: { type: Type.STRING, description: "UGC, High Production, Animation, Green Screen" },
                  text_overlay_usage: { type: Type.STRING, description: "Heavy, Minimal, Key Points Only" }
              },
              required: ["audio_style", "visual_style", "text_overlay_usage"]
          },
          cta: {
              type: Type.OBJECT,
              properties: {
                  detected: { type: Type.BOOLEAN },
                  type: { type: Type.STRING, description: "Soft (Invitation) or Hard (Direct Command)" },
                  content: { type: Type.STRING, description: "The actual CTA text or spoken words" }
              },
              required: ["detected", "type", "content"]
          }
        },
        required: ["hook", "flow", "elements", "cta"]
      },
      metrics: {
        type: Type.OBJECT,
        properties: {
          commercial_intent_score: { type: Type.NUMBER, description: "0-10, return 0 if not an ad" },
          target_audience: { type: Type.STRING, description: "Target audience demographic" },
          pain_point: { type: Type.STRING, description: "The core problem addressed" },
          product_focus: { type: Type.STRING, description: "What is being sold or promoted" }
        },
        required: ["commercial_intent_score", "target_audience", "pain_point", "product_focus"]
      },
      strategies: {
        type: Type.ARRAY,
        description: "List of detailed creative strategies identified",
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "Name of the strategy (e.g., 'UGC Style', 'Price Anchoring')" },
            description: { type: Type.STRING, description: "Detailed explanation of how it is used in the video" },
            psychological_trigger: { type: Type.STRING, description: "The underlying psychological principle (e.g., FOMO, Social Proof)" }
          },
          required: ["name", "description", "psychological_trigger"]
        }
      }
    },
    required: ["is_ad", "confidence_score", "structure", "metrics"]
  };

  const auditorSystemPrompt = `
    Role: You are a Senior Ad Performance Auditor. 
    
    CRITICAL INSTRUCTION: Analyze the ACTUAL VIDEO CONTENT provided in the input. 
    Do NOT generate generic responses. Do NOT hallucinate.
    
    Task:
    1. **AD MARKER SCAN**: Look for specific visual frames containing CTAs, product demos, brand overlays.
    2. **CLASSIFY**: Is this an Ad, Organic Content, or Invalid?
    3. **DEEP STRUCTURAL ANALYSIS**:
       - **HOOK**: Describe the first 3 seconds of THIS VIDEO. What exactly happens? 
       - **FLOW & PACING**: Count the cuts roughly. Is it fast? Slow?
       - **ELEMENTS**: Listen to the audio. Is it music? Spoken word? Read the text on screen.
       - **CTA**: Quote the exact CTA text if present.
    4. **METRICS**: Infer the target audience based on the actors and style.
    5. **STRATEGIES**: Identify 3 specific creative strategies used.

    If the content is NOT an ad, or if you cannot see the video clearly, return metrics as 0/null where applicable and set confidence_score low.

    OUTPUT FORMAT (JSON ONLY) matching the provided schema.
  `;

  try {
    let contents = {};
    let tools = [];

    if (input instanceof File) {
      // FILE MODE: Multimodal Analysis
      const base64Data = await fileToBase64(input);
      contents = {
        parts: [
          {
            inlineData: {
              mimeType: input.type,
              data: base64Data,
            },
          },
          {
            text: auditorSystemPrompt
          }
        ],
      };
    } else {
      // URL MODE: Search Grounding Analysis
      tools = [{ googleSearch: {} }];
      contents = {
        parts: [
          {
             text: `
             ${auditorSystemPrompt}
             
             I am providing a URL to a video ad: ${input}.
             Use Google Search to find detailed transcripts, frame descriptions, or reviews of this specific video content to perform the analysis. 
             If you cannot find specific details about the video visual content, assume confidence_score = 0 and is_ad = false.
             `
          }
        ]
      };
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        tools: tools,
      }
    });

    if (!response.text) {
      throw new Error("No analysis generated");
    }

    return extractJSON(response.text) as VideoAnalysisResult;

  } catch (error) {
    console.error("Video analysis error:", error);
    throw error;
  }
};

export const generateEditDecisionList = async (
  assets: File[],
  analysisData: VideoAnalysisResult | null,
  mode: 'COMPETITOR_REPLICA' | 'CUSTOM_PROMPT',
  customPrompt: string,
  brandInfo: string
): Promise<VideoPlan> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Map assets to JSON context
  const userAssetsJson = assets.map((file, index) => ({
    id: file.name,
    type: file.type,
    tags: ["brand_asset", file.type.split('/')[0]] 
  }));

  const systemPrompt = `
    ROLE
    You are the "AdPulse Creative Director Engine". Your goal is to generate a precise "Edit Decision List" (EDL) in JSON format for a Generative Video workflow. 
    You do NOT select existing video files. You generate "visual_prompt" strings that will be sent to an Image Generation AI (like DALL-E or Midjourney) and then animated.

    INPUT CONTEXT
    User Context Assets: ${JSON.stringify(userAssetsJson)}
    Analysis Data: ${analysisData ? JSON.stringify(analysisData) : "NULL"}
    User Intent: Mode=${mode}, Prompt=${customPrompt || "NULL"}
    Brand Info: ${brandInfo}

    LOGIC RULES
    1. **Visual Prompts over Asset IDs**: 
       - Instead of "asset_source": "vid_01", you must generate "visual_prompt": "Description of the scene".
       - The prompt must be highly descriptive (lighting, angle, subject, texture).
       - Example: "Cinematic close-up of a premium sneaker floating in a neon-lit void, 8k resolution, cyberpunk style."

    2. **Visual Consistency**:
       - Ensure all segments (Hook, Body, CTA) share a consistent artistic style (e.g., "Photorealistic", "Minimalist 3D", or "Vintage Film").
       - Use the 'User Context Assets' and 'Brand Info' to determine this style.

    3. **Mode Logic**:
       - **COMPETITOR_REPLICA**: Follow the *pacing* and *content structure* of the Analysis Data (e.g., if competitor used a "Shocked Face Hook", generate a prompt for a "Shocked Face" consistent with the user's brand).
       - **CUSTOM_PROMPT**: Generate a sequence based purely on the user's prompt.

    OUTPUT INSTRUCTIONS:
    You MUST strictly output a JSON object with a "timeline" array.
    Do not add any markdown formatting (like \`\`\`json).
  `;

  const edlSchema: Schema = {
      type: Type.OBJECT,
      properties: {
          project_title: { type: Type.STRING },
          aspect_ratio: { type: Type.STRING },
          total_duration_sec: { type: Type.NUMBER },
          background_music_keyword: { type: Type.STRING },
          timeline: {
              type: Type.ARRAY,
              items: {
                  type: Type.OBJECT,
                  properties: {
                      sequence_id: { type: Type.NUMBER },
                      segment_type: { type: Type.STRING },
                      visual_prompt: { type: Type.STRING, description: "Detailed prompt for AI image generator" },
                      start_time: { type: Type.NUMBER },
                      duration: { type: Type.NUMBER },
                      text_overlay: {
                          type: Type.OBJECT,
                          properties: {
                              content: { type: Type.STRING },
                              position: { type: Type.STRING },
                              style: { type: Type.STRING }
                          },
                          required: ["content"]
                      },
                      transition: { type: Type.STRING }
                  },
                  required: ["sequence_id", "segment_type", "visual_prompt", "duration", "start_time"]
              }
          }
      },
      required: ["project_title", "aspect_ratio", "total_duration_sec", "timeline", "background_music_keyword"]
  };

  try {
      const response = await ai.models.generateContent({
          model: 'gemini-3-pro-preview',
          contents: { parts: [{ text: systemPrompt }] },
          config: {
              responseMimeType: "application/json",
              responseSchema: edlSchema,
          }
      });
      
      if (!response.text) {
          throw new Error("Failed to generate EDL");
      }
      return extractJSON(response.text) as VideoPlan;
  } catch (error) {
    console.error("EDL Generation error", error);
    throw error;
  }
};

export const generateVideo = async (config: VideoGenerationConfig): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const payload: any = {
      model: 'veo-3.1-fast-generate-preview',
      prompt: config.prompt || "Cinematic movement, high quality, 4k", 
      config: {
        numberOfVideos: 1,
        aspectRatio: config.aspectRatio, 
      }
    };

    // Only add image payload if provided
    if (config.imageBase64 && config.mimeType) {
        payload.image = {
            imageBytes: config.imageBase64,
            mimeType: config.mimeType,
        };
    }

    let operation = await ai.models.generateVideos(payload);

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;

    if (!downloadLink) {
      throw new Error("Failed to generate video URI.");
    }

    return `${downloadLink}&key=${process.env.API_KEY}`;

  } catch (error) {
    console.error("Video generation error:", error);
    throw error;
  }
};

export const generateImage = async (prompt: string, aspectRatio: string = "9:16", referenceImageBase64?: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const parts: any[] = [];
    
    // Append reference image if provided to maintain consistency
    if (referenceImageBase64) {
        parts.push({
            inlineData: {
                data: referenceImageBase64,
                mimeType: 'image/png' 
            }
        });
    }

    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: parts
      },
      config: {
          imageConfig: {
              aspectRatio: aspectRatio === "9:16" ? "9:16" : "1:1",
          }
      }
    });

    let imageUrl = '';
    // Iterate through parts to find the image
    if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64EncodeString = part.inlineData.data;
                imageUrl = `data:${part.inlineData.mimeType};base64,${base64EncodeString}`;
                break;
            }
        }
    }

    if (!imageUrl) {
        throw new Error("No image generated by AI");
    }

    return imageUrl;

  } catch (error) {
    console.error("Image generation error:", error);
    throw error;
  }
}