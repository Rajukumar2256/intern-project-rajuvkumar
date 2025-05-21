// index.js
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { PrismaClient } = require('../generated/prisma');

const app = express();
const prisma = new PrismaClient();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

app.use(cors({
  origin: 'http://localhost:5173', // Change this if your frontend is hosted elsewhere
  credentials: true,
}));
app.use(express.json());

// --- CRUD Endpoints ---

// Get all todos
app.get('/todos', async (req, res) => {
  try {
    const todos = await prisma.todo.findMany({ orderBy: { id: 'desc' } });
    res.json(todos);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch todos.' });
  }
});

// Add a new todo
app.post('/todos', async (req, res) => {
  const { title } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ message: 'Title is required.' });
  }
  try {
    const todo = await prisma.todo.create({
      data: { title: title.trim(), completed: false },
    });
    res.status(201).json(todo);
  } catch (err) {
    res.status(500).json({ message: 'Failed to add todo.' });
  }
});

// Delete a todo
app.delete('/todos/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    await prisma.todo.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    res.status(404).json({ message: 'Todo not found.' });
  }
});

// (Optional) Edit a todo (title or completed status)
app.put('/todos/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { title, completed } = req.body;
  try {
    const todo = await prisma.todo.update({
      where: { id },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(completed !== undefined ? { completed } : {}),
      },
    });
    res.json(todo);
  } catch (err) {
    res.status(404).json({ message: 'Todo not found.' });
  }
});

// --- LLM + Slack Integration ---

// Helper: Summarize todos with Gemini
async function summarizeTodosWithGemini(todos) {
  const prompt = `Summarize these pending to-do items in a helpful, concise way:\n\n${todos.map((t, i) => `${i + 1}. ${t.title}`).join('\n')}`;
  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`;
  const body = {
    contents: [
      {
        parts: [{ text: prompt }]
      }
    ]
  };
  const res = await axios.post(url, body);
  return res.data.candidates?.[0]?.content?.parts?.[0]?.text || "No summary generated.";
}

// Helper: Send message to Slack
async function sendToSlack(message) {
  await axios.post(SLACK_WEBHOOK_URL, { text: message });
}

// POST /summarize
app.post('/summarize', async (req, res) => {
  try {
    const todos = await prisma.todo.findMany({ where: { completed: false } });
    if (!todos.length) {
      return res.status(400).json({ message: "No pending todos to summarize." });
    }
    // 1. Summarize with Gemini
    const summary = await summarizeTodosWithGemini(todos);

    // 2. Send to Slack
    await sendToSlack(`*Todo Summary:*\n${summary}`);

    res.json({ message: "Summary sent to Slack!", summary });
  } catch (err) {
    console.error(err?.response?.data || err.message);
    res.status(500).json({ message: "Failed to summarize and send to Slack." });
  }
});

// --- Start Server ---

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});

// Graceful shutdown for Prisma
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
