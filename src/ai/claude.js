const axios = require('axios');

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY || process.env.OPEN_ROUTER_KEY;
const ANTHROPIC_KEY  = process.env.ANTHROPIC_API_KEY;

async function askAI(prompt, system = 'You are a world-class music industry expert and songwriter.') {
  if (OPENROUTER_KEY) {
    const r = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: 'anthropic/claude-sonnet-4-5',
      messages: [{ role: 'system', content: system }, { role: 'user', content: prompt }]
    }, { headers: { Authorization: `Bearer ${OPENROUTER_KEY}`, 'Content-Type': 'application/json' } });
    return r.data.choices[0].message.content;
  } else if (ANTHROPIC_KEY) {
    const r = await axios.post('https://api.anthropic.com/v1/messages', {
      model: 'claude-sonnet-4-5', max_tokens: 2048,
      system, messages: [{ role: 'user', content: prompt }]
    }, { headers: { 'x-api-key': ANTHROPIC_KEY, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' } });
    return r.data.content[0].text;
  }
  return `[MOCK AI] Processed: ${prompt.slice(0,80)}...`;
}

module.exports = { askAI };
