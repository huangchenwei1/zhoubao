export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'OPENAI_API_KEY not configured in Vercel' });
  }
  try {
    const { prompt, model = 'gpt-4o' } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'prompt required' });
    }
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      }),
    });
    const data = await resp.json();
    if (!resp.ok) {
      return res.status(resp.status).json({ error: data.error?.message || 'OpenAI request failed' });
    }
    const content = data.choices?.[0]?.message?.content || '未返回内容。';
    return res.status(200).json({ content });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Server error' });
  }
}
