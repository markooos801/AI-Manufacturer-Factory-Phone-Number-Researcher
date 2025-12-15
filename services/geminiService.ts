import { GoogleGenAI } from "@google/genai";
import { CompanyRecord, SearchParams } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

// Helper to clean JSON string from Markdown code blocks
const extractJson = (text: string): string => {
  const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
  const match = text.match(jsonRegex);
  if (match && match[1]) {
    return match[1];
  }
  const start = text.indexOf('[');
  const end = text.lastIndexOf(']');
  if (start !== -1 && end !== -1) {
    return text.substring(start, end + 1);
  }
  return text;
};

// Helper to normalize company names for deduplication
const normalizeName = (name: string): string => {
  return name.toLowerCase()
    .replace(/co\.|ltd\.|inc\.|gmbh|s\.a\.|plc|corp\.|corporation|limited|company/g, '')
    .replace(/[^\w\s]/g, '')
    .trim();
};

export const searchManufacturers = async (
  params: SearchParams,
  onProgress: (step: string) => void
): Promise<CompanyRecord[]> => {
  const ai = getClient();
  const allRecords: CompanyRecord[] = [];
  const foundNames = new Set<string>();

  const SYSTEM_INSTRUCTION = `
    You are an INDUSTRIAL-LEVEL AI Manufacturer Researcher.
    Your mission is to build a COMPLETE and EXHAUSTIVE census of factories.
    
    RULES:
    1. Output strictly valid JSON arrays. No intro text.
    2. Normalize phone numbers to international format.
    3. 'verification_score' (0-10): Factory signals (machinery, ISO, plant address) = High score. Trader signals = Low score.
    4. Do not hallucinate. If data is missing, put "Not Found" or empty arrays.
    5. Prioritize FACTORIES over TRADERS.
  `;

  // We will perform 3 distinct search batches to ensure exhaustiveness
  const batches = [
    {
      id: 'batch_1',
      label: 'Major Manufacturers & Exporters',
      prompt: (p: SearchParams) => `
        PHASE 1: GLOBAL DISCOVERY
        Find the largest and most prominent manufacturers of "${p.product}" in "${p.country}" (Industry: ${p.industry}).
        
        Strategy:
        1. Search English and international directories.
        2. Look for "Top 20 manufacturers" lists, export data, and major industrial groups.
        3. Extract at least 5-8 major companies.
      `
    },
    {
      id: 'batch_2',
      label: 'Local SMEs & Industrial Zones',
      prompt: (p: SearchParams, existing: string) => `
        PHASE 2: LOCAL DEEP DIVE
        Search specifically using LOCAL LANGUAGE keywords for "${p.product}" in "${p.country}".
        
        Strategy:
        1. Look for industrial zone lists (IZ), local business registries, and yellow pages.
        2. Focus on Small and Medium Enterprises (SMEs) that might not speak English.
        3. IGNORE these companies already found: ${existing}.
        4. Find 5-8 NEW companies.
      `
    },
    {
      id: 'batch_3',
      label: 'Trade Fairs & Niche Specialists',
      prompt: (p: SearchParams, existing: string) => `
        PHASE 3: NICHE & EXHIBITORS
        Search for trade fair exhibitor lists (PDFs/Catalogs) and industry association members for "${p.industry}" in "${p.country}".
        
        Strategy:
        1. Search for "Exhibitor list", "Member list", "Association of manufacturers".
        2. Dig for specialized component manufacturers related to "${p.product}".
        3. IGNORE these companies already found: ${existing}.
        4. Find 5-8 NEW companies.
      `
    }
  ];

  try {
    for (const batch of batches) {
      onProgress(batch.id);

      // Construct exclusion list to prevent duplicates in the prompt
      const existingNamesList = Array.from(foundNames).slice(0, 50).join(", "); // Limit length to avoid token issues
      
      const promptText = `
        ${typeof batch.prompt === 'function' ? batch.prompt(params, existingNamesList) : ''}

        Return the result as a JSON array matching this structure:
        [{
          "company_name": "string",
          "manufacturer_type": "Factory | Manufacturer | Trader | Unknown",
          "industry": "string",
          "product_category": "string",
          "sub_category": "string",
          "country": "string",
          "city": "string",
          "phone_numbers": [{"number": "string", "type": "sales", "confidence": 0.9}],
          "emails": [{"email": "string", "role": "sales"}],
          "website": "string",
          "certifications": ["string"],
          "export_capability": "Yes | No | Unknown",
          "verification_score": 0.0,
          "data_sources": ["string (url)"],
          "notes": "string (brief summary of findings)"
        }]
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: promptText,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: [{ googleSearch: {} }],
        }
      });

      const text = response.text;
      if (!text) continue;

      // Grounding metadata
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const sourceMap = groundingChunks.map((chunk: any) => chunk.web?.uri).filter(Boolean);

      try {
        const cleanJson = extractJson(text);
        const parsedData: CompanyRecord[] = JSON.parse(cleanJson);

        let newCount = 0;
        parsedData.forEach(record => {
          const normName = normalizeName(record.company_name);
          if (!foundNames.has(normName) && normName.length > 2) {
            foundNames.add(normName);
            
            // Enrich with sources if missing
            if (!record.data_sources || record.data_sources.length === 0) {
              record.data_sources = sourceMap.slice(0, 3);
            }
            
            allRecords.push(record);
            newCount++;
          }
        });

        console.log(`[${batch.id}] Found ${newCount} new companies.`);
        
        // If a batch returns absolutely nothing, we might break early, 
        // but for "Exhaustive" we usually want to try all strategies unless 
        // the error is catastrophic. We continue here.

      } catch (e) {
        console.warn(`Failed to parse batch ${batch.id}`, e);
        // Continue to next batch even if one fails
      }
    }

    onProgress('finalizing');
    return allRecords;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};