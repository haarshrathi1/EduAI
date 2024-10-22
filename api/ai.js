// api/ai.js

const axios = require('axios');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ error: 'No question provided' });
  }

  // Client-Side Input Validation (Optional)
  const forbiddenPatterns = [
    /write\s+code/i,
    /generate\s+code/i,
    /develop\s+code/i,
    /create\s+code/i,
    /code\s+for/i,
    /write\s+a\s+book/i,
    /recommend\s+a\s+book/i,
    /list\s+books/i
  ];

  const isForbidden = forbiddenPatterns.some(pattern => pattern.test(question));

  if (isForbidden) {
    return res.status(400).json({ error: 'Please ask a medical-related question.' });
  }

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [
          { 
            role: 'system', 
            content: "You are a professional medical assistant specialized in answering MBBS and medical-related questions. Your responses should be accurate, detailed, and focused solely on medical topics. If a user asks for non-medical assistance such as writing code, creating books, or any other unrelated tasks, politely decline and inform them that you can only assist with medical queries." 
          },
          { role: 'user', content: question }
        ],
        max_tokens: 1000,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        }
      }
    );

    const aiResponse = response.data.choices[0].message.content.trim();

    res.status(200).json({ answer: aiResponse });
  } catch (error) {
    console.error('Error with OpenAI API:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Error fetching response from GPT API' });
  }
};
