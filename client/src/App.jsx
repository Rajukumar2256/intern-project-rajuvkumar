import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:3000"; // Change if your backend runs elsewhere

function App() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [summaryStatus, setSummaryStatus] = useState("");

  // Fetch todos on mount
  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    const res = await axios.get(`${API_BASE}/todos`);
    setTodos(res.data);
  };

  const addTodo = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    await axios.post(`${API_BASE}/todos`, { title: input });
    setInput("");
    fetchTodos();
  };

  const deleteTodo = async (id) => {
    await axios.delete(`${API_BASE}/todos/${id}`);
    fetchTodos();
  };

  const handleSummarize = async () => {
    setLoading(true);
    setSummaryStatus("");
    try {
      const res = await axios.post(`${API_BASE}/summarize`);
      setSummaryStatus(res.data.message || "Summary sent to Slack!");
    } catch (err) {
      setSummaryStatus("Failed to send summary.");
    }
    setLoading(false);
  };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'space-around' }}>
      <div
        style={{ maxWidth: 500, margin: "2rem auto", fontFamily: "sans-serif" }}
      >
        <h1>Todo Summary Assistant</h1>
        <form onSubmit={addTodo} style={{ display: "flex", gap: 8 }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Add a new todo"
            style={{ flex: 1, padding: 8 }}
          />
          <button type="submit">Add</button>
        </form>
        <ul style={{ marginTop: 24 }}>
          {todos.map((todo) => (
            <li
              key={todo.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <span>{todo.title}</span>
              <button
                onClick={() => deleteTodo(todo.id)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
        <button
          onClick={handleSummarize}
          disabled={loading}
          style={{ marginTop: 24, padding: "8px 16px" }}
        >
          {loading ? "Summarizing..." : "Summarize & Send to Slack"}
        </button>
        {summaryStatus && (
          <div
            style={{
              marginTop: 16,
              color: summaryStatus.includes("Failed") ? "red" : "green",
            }}
          >
            {summaryStatus}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
