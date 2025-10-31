# cf_ai_task_assistant 🤖

An AI-powered personal task assistant built on Cloudflare's infrastructure, demonstrating the power of Workers AI, Agents SDK, and Durable Objects.

## 🎯 Project Overview

This application is a conversational AI assistant that helps users manage tasks through natural language. It showcases all required components:

- **LLM**: Uses Llama 3.3 70B on Workers AI for natural language understanding
- **Workflow/Coordination**: Built with Agents SDK and Durable Objects for state management
- **User Input**: Chat interface via Cloudflare Pages
- **Memory/State**: Persistent conversation history and task storage using Durable Objects SQL

## ✨ Features

- 💬 **Natural Language Chat**: Converse with an AI assistant that remembers context
- ✅ **Task Management**: Add, complete, and delete tasks via chat
- 🧠 **Memory**: Maintains conversation history and task state
- ⚡ **Real-time**: Instant responses powered by Cloudflare's global network
- 🔒 **Private**: Each session has isolated state (via Durable Objects)

## 🏗️ Architecture

```
┌─────────────────┐
│  Cloudflare     │
│  Pages (UI)     │
└────────┬────────┘
         │ HTTP/WebSocket
         ▼
┌─────────────────┐
│  Workers        │
│  (API Layer)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────┐
│  Agents SDK     │◄────►│  Workers AI  │
│  TaskAgent      │      │  (Llama 3.3) │
│  (Durable Obj)  │      └──────────────┘
└─────────────────┘
         │
         ▼
   [SQLite State]
   - Tasks
   - Conversations
   - Preferences
```

## 📋 Requirements Met

✅ **LLM**: Llama 3.3 70B on Workers AI (`@cf/meta/llama-3.3-70b-instruct-fp8-fast`)  
✅ **Workflow**: Agents SDK with Durable Objects for coordination  
✅ **User Input**: Web-based chat interface (Pages)  
✅ **Memory**: Durable Objects storage + conversation history  

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- A Cloudflare account (free tier works!)
- Wrangler CLI

### Installation

1. **Clone or download this repository**

```bash
cd cf_ai_task_assistant
```

2. **Install dependencies**

```bash
npm install
```

3. **Login to Cloudflare**

```bash
npx wrangler login
```

### Local Development

1. **Run the Worker locally**

```bash
npm run dev
```

This starts the Worker at `http://localhost:8787`

2. **In a new terminal, serve the Pages site**

```bash
npm run pages:dev
```

The UI will be available at `http://localhost:8788`

3. **Test the application**
   - Open http://localhost:8788 in your browser
   - Try these commands:
     - "Add task: Buy groceries"
     - "What are my current tasks?"
     - "Complete task 1"
     - "Tell me a joke"

### Deployment

1. **Deploy the Worker**

```bash
npm run deploy
```

After deployment, you'll see your Worker URL (e.g., `https://cf-ai-task-assistant.your-subdomain.workers.dev`)

2. **Update the API URL in index.html**

Edit `public/index.html` and update line 269:

```javascript
const API_BASE = 'https://cf-ai-task-assistant.YOUR-SUBDOMAIN.workers.dev';
```

3. **Deploy the Pages site**

```bash
npm run pages:deploy
```

Follow the prompts to create a new Pages project.

4. **Test your deployed app!**

Visit your Pages URL and interact with your AI assistant.

## 🎮 Usage Examples

### Task Management
- "Add task: Finish homework"
- "Add task: Call mom tomorrow"
- "Complete task 1"
- "Delete task 2"
- "What are my tasks?"

### General Conversation
- "Tell me a joke"
- "What's the weather like today?"
- "Help me brainstorm ideas for a birthday party"
- "Explain quantum computing simply"

### Context-Aware Responses
The assistant remembers your conversation history and tasks, so you can have natural follow-up conversations:
- User: "Add task: Buy milk"
- Assistant: [adds task]
- User: "When should I do that?"
- Assistant: [references the milk task from context]

## 🧪 Testing Components

### Test LLM Integration
```bash
curl -X POST http://localhost:8787/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello!", "sessionId": "test123"}'
```

### Test State Persistence
1. Add some tasks in the chat
2. Refresh the page
3. Your tasks should still be there (state is persisted!)

### Test Memory
1. Have a conversation
2. Reference something from earlier in the conversation
3. The assistant should remember and respond contextually

## 📁 Project Structure

```
cf_ai_task_assistant/
├── src/
│   └── index.js          # Worker + Agent implementation
├── public/
│   └── index.html        # Chat UI
├── wrangler.jsonc        # Cloudflare configuration
├── package.json          # Dependencies
├── README.md            # This file
└── PROMPTS.md           # AI prompts used
```

## 🛠️ Technical Details

### Agent Implementation (src/index.js)

The `TaskAgent` class extends the Agents SDK:
- **State Management**: Uses Durable Objects storage for persistence
- **LLM Integration**: Calls Workers AI with conversation context
- **Task Processing**: Parses natural language to extract task commands
- **Memory**: Maintains last 50 conversation messages

### State Schema

```javascript
{
  tasks: [
    {
      id: timestamp,
      title: string,
      status: "pending" | "completed",
      createdAt: timestamp,
      completedAt?: timestamp
    }
  ],
  conversations: [
    {
      role: "user" | "assistant",
      content: string,
      timestamp: timestamp
    }
  ],
  userPreferences: {}
}
```

## 🔧 Configuration

### Workers AI Model

Currently using: `@cf/meta/llama-3.3-70b-instruct-fp8-fast`

To change models, edit `src/index.js` line 66:

```javascript
const response = await this.env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
```

Available models: https://developers.cloudflare.com/workers-ai/models/

### Adjusting Memory

To change how many conversation messages are kept:
- Line 42: `conversations.slice(-50)` - total messages stored
- Line 56: `...history.slice(-10)` - messages sent to LLM

## 🐛 Troubleshooting

### "Failed to get response" error
- Make sure your Worker is deployed and running
- Check that the API_BASE URL in index.html matches your Worker URL
- Verify CORS is properly configured

### No tasks showing up
- Check browser console for errors
- Verify the sessionId is consistent
- Make sure Durable Objects binding is correctly configured in wrangler.jsonc

### LLM not responding
- Ensure you have Workers AI enabled in your Cloudflare account
- Check that the AI binding is configured in wrangler.jsonc
- Verify you're not hitting rate limits

## 🎓 Learning Resources

- [Cloudflare Agents SDK Documentation](https://developers.cloudflare.com/agents/)
- [Workers AI Models](https://developers.cloudflare.com/workers-ai/models/)
- [Durable Objects Guide](https://developers.cloudflare.com/durable-objects/)
- [Cloudflare Pages](https://developers.cloudflare.com/pages/)

## 📝 License

MIT License - feel free to use this as a starting point for your own projects!

## 🙋 About

Built for the Cloudflare Software Engineering Internship application.

This project demonstrates:
- ✅ Serverless AI application architecture
- ✅ State management with Durable Objects
- ✅ LLM integration with Workers AI
- ✅ Real-time chat interface
- ✅ Natural language processing for task management

---

**Note**: This is a demonstration project showing how to build AI-powered applications on Cloudflare's platform. The code is well-commented and designed to be educational.
