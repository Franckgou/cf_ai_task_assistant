# AI Prompts Used in cf_ai_task_assistant

This document contains all AI prompts and interactions used during the development of this project, as required by the internship application.

## 🤖 Prompts for Claude (Development Assistant)

### Initial Project Setup Prompt

```
Please help me start building this app I have to submit this application by midnight 
and it's already 1:00PM and I have no Idea of what to do

[Included job posting and requirements]
```

**Purpose**: To get help starting the project with proper architecture and meeting all requirements.

**Output**: Complete project structure, code files, and deployment instructions.

---

## 🧠 Prompts Sent to Workers AI (Llama 3.3)

### System Prompt (Context Building)

**Location**: `src/index.js`, `buildContext()` method

```javascript
context = "You are a helpful personal task assistant. ";

// If tasks exist:
context += `\n\nCurrent tasks:\n`;
// [Lists all tasks with status and due dates]

// If no tasks:
context += "The user currently has no tasks.";
```

**Purpose**: 
- Establishes the assistant's role and personality
- Provides context about the user's current tasks
- Enables the LLM to give relevant, context-aware responses

**Example Full System Prompt**:
```
You are a helpful personal task assistant. 

Current tasks:
1. [pending] Buy groceries (due: 2025-11-01)
2. [completed] Finish homework
3. [pending] Call mom tomorrow
```

### User Messages

User messages are sent directly from the chat interface. Examples:

```javascript
{
  role: "user",
  content: "Add task: Buy milk"
}
```

```javascript
{
  role: "user",
  content: "What are my current tasks?"
}
```

```javascript
{
  role: "user",
  content: "Tell me about quantum computing"
}
```

### Conversation History

**Location**: `src/index.js`, `callLLM()` method

```javascript
const messages = [
  { role: "system", content: context },
  ...history.map(h => ({ role: h.role, content: h.content }))
];
```

**Purpose**: 
- Maintains conversation continuity
- Allows for context-aware follow-up questions
- Enables the assistant to reference previous interactions

**Example Conversation Sequence**:
```javascript
[
  { role: "system", content: "You are a helpful personal task assistant..." },
  { role: "user", content: "Add task: Buy milk" },
  { role: "assistant", content: "I've added 'Buy milk' to your tasks!" },
  { role: "user", content: "When should I do that?" },
  { role: "assistant", content: "Based on your task list, you should buy milk soon..." }
]
```

---

## 🎯 LLM Configuration Parameters

**Location**: `src/index.js`, line 66-71

```javascript
const response = await this.env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
  messages: messages,
  max_tokens: 512,
  temperature: 0.7
});
```

**Parameters Explained**:

- **Model**: `@cf/meta/llama-3.3-70b-instruct-fp8-fast`
  - Latest Llama 3.3 model optimized for speed
  - 70B parameters for high-quality responses
  - FP8 quantization for efficiency

- **max_tokens**: `512`
  - Limits response length to ~400 words
  - Keeps responses concise and relevant
  - Reduces latency and cost

- **temperature**: `0.7`
  - Balanced creativity vs. consistency
  - 0.0 = fully deterministic
  - 1.0 = maximum creativity
  - 0.7 = good middle ground for assistant tasks

---

## 🔍 Natural Language Processing Patterns

The application uses pattern matching to detect task-related commands from natural language:

### Add Task Pattern

```javascript
if (lowerMessage.includes("add task") || 
    lowerMessage.includes("create task") || 
    lowerMessage.includes("new task")) {
  const taskMatch = message.match(/(?:add|create|new) task[:\s]+(.+)/i);
  // Extracts task description after "add task:" or similar
}
```

**Examples that trigger this**:
- "Add task: Buy groceries"
- "Create task: Finish homework"
- "New task: Call mom"
- "add task walk the dog"

### Complete Task Pattern

```javascript
if (lowerMessage.includes("complete") || lowerMessage.includes("done")) {
  const numberMatch = message.match(/\d+/);
  // Finds task number to mark as complete
}
```

**Examples**:
- "Complete task 1"
- "Mark task 2 as done"
- "Done with task 3"

### Delete Task Pattern

```javascript
if (lowerMessage.includes("delete task") || 
    lowerMessage.includes("remove task")) {
  const numberMatch = message.match(/\d+/);
  // Finds task number to delete
}
```

**Examples**:
- "Delete task 1"
- "Remove task 2"

---

## 💡 Prompt Engineering Insights

### What Worked Well

1. **Clear Role Definition**: Starting with "You are a helpful personal task assistant" immediately sets expectations

2. **Contextual Information**: Including current tasks in the system prompt allows for much more relevant responses

3. **Conversation History**: Keeping the last 10 messages provides enough context without overwhelming the model

4. **Temperature Setting**: 0.7 provides a good balance - creative enough to be conversational, but consistent enough for task management

### What Could Be Improved

1. **Few-Shot Examples**: Could add example conversations to the system prompt to improve response quality

2. **Structured Output**: Could use JSON mode or specific formatting instructions for more structured responses

3. **Tool Use**: Could extend the agent with function calling for external APIs (calendar, email, etc.)

4. **User Personalization**: Could learn user preferences over time and adjust responses accordingly

---

## 📊 Example Interaction Flow

### Complete Interaction Example

**User Input**: "Add task: Prepare presentation for Monday"

**1. System receives message**
```javascript
{
  message: "Add task: Prepare presentation for Monday",
  sessionId: "user_abc123"
}
```

**2. Task pattern detected**
```javascript
// Pattern match successful
taskMatch[1] = "Prepare presentation for Monday"
// Task added to state
```

**3. System prompt built**
```javascript
system_context = `You are a helpful personal task assistant.

Current tasks:
1. [pending] Prepare presentation for Monday`
```

**4. Conversation history included**
```javascript
messages = [
  { role: "system", content: "You are a helpful..." },
  { role: "user", content: "Add task: Prepare presentation for Monday" }
]
```

**5. LLM called with full context**
```javascript
AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
  messages: messages,
  max_tokens: 512,
  temperature: 0.7
})
```

**6. Response received**
```javascript
{
  response: "I've added 'Prepare presentation for Monday' to your task list! Would you like me to help you break this down into smaller steps, or set a reminder?"
}
```

**7. State updated and synced**
```javascript
{
  tasks: [
    {
      id: 1730476800000,
      title: "Prepare presentation for Monday",
      status: "pending",
      createdAt: 1730476800000
    }
  ],
  conversations: [
    { role: "user", content: "Add task: Prepare presentation for Monday", timestamp: ... },
    { role: "assistant", content: "I've added 'Prepare presentation for Monday'...", timestamp: ... }
  ]
}
```

---

## 🔧 Prompt Optimization Techniques Used

1. **Context Window Management**
   - Keep only last 50 total messages in storage
   - Send only last 10 messages to LLM
   - Prevents context length issues
   - Reduces latency and cost

2. **Task Context Injection**
   - Always include current tasks in system prompt
   - Enables task-aware responses
   - No need to repeat task list in every message

3. **Role-Based Prompting**
   - Clear separation of user/assistant roles
   - Helps model understand conversation flow
   - Improves response quality

4. **Implicit Command Detection**
   - Parse user intent from natural language
   - Extract commands without requiring specific syntax
   - More natural user experience

---

## 📚 Additional Resources

- [Cloudflare Workers AI Docs](https://developers.cloudflare.com/workers-ai/)
- [Llama 3.3 Model Card](https://developers.cloudflare.com/workers-ai/models/llama-3.3-70b-instruct-fp8-fast/)
- [Prompt Engineering Guide](https://www.promptingguide.ai/)
- [Agents SDK Documentation](https://developers.cloudflare.com/agents/)

---

## 🎓 Key Takeaways

1. **System prompts matter**: The initial context sets the tone for all responses
2. **History is important**: Even 10 messages of history dramatically improves coherence
3. **Pattern matching + LLM**: Combining simple regex with AI provides robust functionality
4. **State management**: Persistent state enables truly useful conversational agents
5. **Temperature tuning**: Small changes in temperature can significantly affect response quality

---

**Note**: All prompts and code in this project were developed with AI assistance (Claude by Anthropic), as encouraged by the assignment. The prompts and implementation demonstrate understanding of:
- LLM integration and configuration
- Conversational AI design
- State management in distributed systems
- Natural language interface design
