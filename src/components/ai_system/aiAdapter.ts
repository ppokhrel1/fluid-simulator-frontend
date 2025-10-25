// Common types for all AI providers
export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIAdapterOptions {
  apiUrl?: string;
  apiKey?: string;
  model?: string;
}

// OpenAI-specific implementation
export async function sendToOpenAI(message: string, file?: File, model = 'gpt-4-turbo', opts?: AIAdapterOptions): Promise<string> {
  const apiKey = opts?.apiKey || process.env.REACT_APP_OPENAI_API_KEY;
  if (!apiKey) return '[OpenAI API key not configured]';

  try {
    let messages: AIMessage[] = [{ role: 'user', content: message }];
    
    // If there's a file, encode it as base64 and include in the message
    if (file) {
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      
      messages = [
        { role: 'system', content: 'The user is uploading a 3D model file for analysis.' },
        { role: 'user', content: `Analyzing file: ${file.name}\nBase64 data: ${base64}\n\nUser message: ${message}` }
      ];
    }

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7
      })
    });

    if (!res.ok) throw new Error(`OpenAI API returned ${res.status}`);
    const data = await res.json();
    return data.choices?.[0]?.message?.content || JSON.stringify(data);
  } catch (err: any) {
    console.error('OpenAI API error:', err);
    return `[OpenAI error] ${err?.message || String(err)}`;
  }
}

// Anthropic Claude-specific implementation
export async function sendToClaude(message: string, file?: File, model = 'claude-3-opus-20240229', opts?: AIAdapterOptions): Promise<string> {
  const apiKey = opts?.apiKey || process.env.REACT_APP_ANTHROPIC_API_KEY;
  if (!apiKey) return '[Claude API key not configured]';

  try {
    let messages: AIMessage[] = [{ role: 'user', content: message }];
    
    if (file) {
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      
      messages = [
        { role: 'system', content: 'You are analyzing 3D model files for CFD simulation.' },
        { role: 'user', content: `File: ${file.name}\nData: ${base64}\n\nQuery: ${message}` }
      ];
    }

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 1024
      })
    });

    if (!res.ok) throw new Error(`Claude API returned ${res.status}`);
    const data = await res.json();
    return data.content?.[0]?.text || JSON.stringify(data);
  } catch (err: any) {
    console.error('Claude API error:', err);
    return `[Claude error] ${err?.message || String(err)}`;
  }
}

// Google Gemini Pro implementation
export async function sendToGemini(message: string, file?: File, opts?: AIAdapterOptions): Promise<string> {
  const apiKey = opts?.apiKey || process.env.REACT_APP_GEMINI_API_KEY;
  if (!apiKey) return '[Gemini API key not configured]';

  try {
    const parts: any[] = [{ text: message }];
    
    if (file) {
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      
      parts.push({
        inlineData: {
          mimeType: file.type,
          data: base64.split(',')[1]
        }
      });
    }

    const res = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }]
      })
    });

    if (!res.ok) throw new Error(`Gemini API returned ${res.status}`);
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || JSON.stringify(data);
  } catch (err: any) {
    console.error('Gemini API error:', err);
    return `[Gemini error] ${err?.message || String(err)}`;
  }
}

// Main adapter function that routes to the appropriate provider
export async function sendMessageToAI(message: string, file?: File, model = 'gpt-4-turbo', opts?: AIAdapterOptions): Promise<string> {
  // If a custom API URL is provided, use the generic REST adapter
  if (opts?.apiUrl || process.env.REACT_APP_AI_API_URL) {
    return sendToCustomAPI(message, file, model, opts);
  }

  // Route to the appropriate provider based on the model
  if (model.startsWith('gpt-')) {
    return sendToOpenAI(message, file, model, opts);
  } else if (model.startsWith('claude-')) {
    return sendToClaude(message, file, model, opts);
  } else if (model === 'gemini-pro') {
    return sendToGemini(message, file, opts);
  } else if (model === 'openfoam') {
    // TODO: Implement OpenFOAM-specific handling
    return '[OpenFOAM integration not yet implemented]';
  }

  return `[Unknown model: ${model}] Please configure an AI provider`;
}

// Generic REST API adapter (used when REACT_APP_AI_API_URL is set)
async function sendToCustomAPI(message: string, file?: File, model?: string, opts?: AIAdapterOptions): Promise<string> {
  const apiUrl = opts?.apiUrl || process.env.REACT_APP_AI_API_URL;
  if (!apiUrl) return '[API URL not configured]';

  try {
    if (file) {
      const form = new FormData();
      form.append('message', message);
      form.append('file', file);
      if (model) form.append('model', model);

      const res = await fetch(apiUrl, { method: 'POST', body: form });
      if (!res.ok) throw new Error(`API returned ${res.status}`);
      const data = await res.json();
      return data?.reply || JSON.stringify(data);
    }

    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, model })
    });

    if (!res.ok) throw new Error(`API returned ${res.status}`);
    const data = await res.json();
    return data?.reply || JSON.stringify(data);
  } catch (err: any) {
    console.error('API error:', err);
    return `[API error] ${err?.message || String(err)}`;
  }
}
