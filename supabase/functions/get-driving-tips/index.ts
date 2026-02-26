import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SHEET_ID = '15a3TdMn-Onn6B_rCnXgBD3M_L96CoGyhSskmMbjlqHw';
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Sheet1`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const response = await fetch(SHEET_URL);
    if (!response.ok) {
      throw new Error(`Google Sheets fetch failed [${response.status}]`);
    }

    const csvText = await response.text();
    
    // Parse CSV: skip header row, extract first column (DicasFrotaGPM)
    const lines = csvText.split('\n').filter(line => line.trim());
    const tips: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      // CSV values are quoted: "value"
      const match = lines[i].match(/"([^"]+)"/);
      if (match && match[1].trim()) {
        tips.push(match[1].trim());
      }
    }

    if (tips.length === 0) {
      throw new Error('No tips found in spreadsheet');
    }

    // Return a random tip
    const randomTip = tips[Math.floor(Math.random() * tips.length)];

    return new Response(JSON.stringify({ tip: randomTip }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching driving tips:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
