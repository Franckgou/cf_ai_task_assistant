// AI Task Assistant - Cloudflare Workers + Durable Objects
// Requirements Met: LLM (Workers AI), Workflow (Durable Objects), Input (HTTP), Memory (DO Storage)

// TaskAgent - Durable Object for state management and coordination
export class TaskAgent {
  constructor(state, env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request) {
    if (request.method === "POST") {
      const body = await request.json();

      if (body.action === "message") {
        const result = await this.handleMessage(body.content);
        return new Response(JSON.stringify(result), {
          headers: { "Content-Type": "application/json" },
        });
      }

      if (body.action === "getTasks") {
        const state = await this.getState();
        return new Response(JSON.stringify({ tasks: state.tasks }), {
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    return new Response("TaskAgent Ready");
  }

  async handleMessage(message) {
    const state = await this.getState();

    // Add user message to history
    state.conversations = state.conversations || [];
    state.conversations.push({
      role: "user",
      content: message,
      timestamp: Date.now(),
    });

    // Process task commands
    await this.processTaskCommands(message, state);

    // Build context
    const context = this.buildContext(state);

    // Call LLM
    const aiResponse = await this.callLLM(
      message,
      context,
      state.conversations.slice(-10)
    );

    // Add AI response to history
    state.conversations.push({
      role: "assistant",
      content: aiResponse,
      timestamp: Date.now(),
    });

    // Keep last 50 messages
    state.conversations = state.conversations.slice(-50);

    // Save state
    await this.setState(state);

    return {
      role: "assistant",
      content: aiResponse,
      tasks: state.tasks,
    };
  }

  buildContext(state) {
    let context = "You are a helpful personal task assistant. ";

    if (state.tasks && state.tasks.length > 0) {
      context += "\n\nCurrent tasks:\n";
      state.tasks.forEach((task, idx) => {
        context += `${idx + 1}. [${task.status}] ${task.title}\n`;
      });
    } else {
      context += "The user currently has no tasks.";
    }

    return context;
  }

  async callLLM(userMessage, context, history) {
    try {
      const messages = [
        { role: "system", content: context },
        ...history.map((h) => ({ role: h.role, content: h.content })),
      ];

      const response = await this.env.AI.run(
        "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
        {
          messages: messages,
          max_tokens: 512,
          temperature: 0.7,
        }
      );

      return response.response || "I'm here to help!";
    } catch (error) {
      console.error("AI Error:", error);
      return "I apologize, I encountered an error. Please try again.";
    }
  }

  async processTaskCommands(message, state) {
    const lower = message.toLowerCase();

    if (!state.tasks) state.tasks = [];

    // Add task
    if (lower.includes("add task") || lower.includes("create task")) {
      const match = message.match(/(?:add|create|new) task[:\s]+(.+)/i);
      if (match) {
        state.tasks.push({
          id: Date.now(),
          title: match[1].trim(),
          status: "pending",
          createdAt: Date.now(),
        });
      }
    }
    // Complete task
    else if (lower.includes("complete") || lower.includes("done")) {
      const numMatch = message.match(/\d+/);
      if (numMatch && state.tasks.length > 0) {
        const idx = parseInt(numMatch[0]) - 1;
        if (idx >= 0 && idx < state.tasks.length) {
          state.tasks[idx].status = "completed";
        }
      }
    }
    // Delete task
    else if (lower.includes("delete task") || lower.includes("remove task")) {
      const numMatch = message.match(/\d+/);
      if (numMatch && state.tasks.length > 0) {
        const idx = parseInt(numMatch[0]) - 1;
        if (idx >= 0 && idx < state.tasks.length) {
          state.tasks.splice(idx, 1);
        }
      }
    }
  }

  async getState() {
    const state = await this.state.storage.get("agentState");
    return state || { tasks: [], conversations: [] };
  }

  async setState(newState) {
    await this.state.storage.put("agentState", newState);
  }
}

// Worker Handler
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // Chat endpoint
    if (url.pathname === "/api/chat" && request.method === "POST") {
      try {
        const { message, sessionId } = await request.json();
        const id = env.TASK_AGENT.idFromName(sessionId || "default");
        const agent = env.TASK_AGENT.get(id);

        const response = await agent.fetch(request.url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "message", content: message }),
        });

        const data = await response.json();
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Tasks endpoint
    if (url.pathname === "/api/tasks") {
      try {
        const sessionId = url.searchParams.get("sessionId") || "default";
        const id = env.TASK_AGENT.idFromName(sessionId);
        const agent = env.TASK_AGENT.get(id);

        const response = await agent.fetch(request.url, {
          method: "POST",
          body: JSON.stringify({ action: "getTasks" }),
        });

        const data = await response.json();
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response("AI Task Assistant API", { headers: corsHeaders });
  },
};
