import axios from 'axios';

const OPENROUTER_API_KEY = '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';
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  choices: {
    message: {
      content: string;
      role: string;
    };
  }[];
}

export const sendChatMessage = async (messages: Array<{ role: string; content: string }>) => {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct',
        messages: messages,
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('OpenRouter API Error:', error);
    throw error;
  }
};

// Available models - can be expanded based on OpenRouter offerings
export const AVAILABLE_MODELS = {
  'mistralai/mistral-7b-instruct': 'Mistral 7B (Fast)',
  'openai/gpt-3.5-turbo': 'GPT-3.5 Turbo',
  'anthropic/claude-3-haiku': 'Claude 3 Haiku',
  'google/gemma-7b-it': 'Gemma 7B'
} as const;

export type ModelKey = keyof typeof AVAILABLE_MODELS;