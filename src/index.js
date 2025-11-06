// AI Task Assistant - Cloudflare Workers + Durable Objects

// Natural Language Date Parser
function parseNaturalDate(text) {
  const now = new Date();
  const lower = text.toLowerCase();

  // Today
  if (lower.includes('today')) {
    return now.setHours(23, 59, 59, 999);
  }

  // Tomorrow
  if (lower.includes('tomorrow')) {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.setHours(23, 59, 59, 999);
  }

  // Days of the week
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  for (let i = 0; i < days.length; i++) {
    if (lower.includes(days[i])) {
      const targetDay = i;
      const currentDay = now.getDay();
      const daysUntil = (targetDay - currentDay + 7) % 7 || 7;
      const targetDate = new Date(now);
      targetDate.setDate(targetDate.getDate() + daysUntil);
      return targetDate.setHours(23, 59, 59, 999);
    }
  }

  // Next week
  if (lower.includes('next week')) {
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek.setHours(23, 59, 59, 999);
  }

  // Specific number of days (e.g., "in 3 days")
  const daysMatch = lower.match(/in (\d+) days?/);
  if (daysMatch) {
    const daysCount = parseInt(daysMatch[1]);
    const futureDate = new Date(now);
    futureDate.setDate(futureDate.getDate() + daysCount);
    return futureDate.setHours(23, 59, 59, 999);
  }

  return null;
}

// TaskAgent - Durable Object for state management and coordination
export class TaskAgent {
  constructor(state, env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request) {
    if (request.method === "POST") {
      const body = await request.json();

      if (body.action === "stream") {
        return this.handleStreamMessage(body.content);
      }

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

  async handleStreamMessage(message) {
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

    // Create streaming response
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    // Start streaming in background
    (async () => {
      try {
        const stream = await this.callLLM(
          message,
          context,
          state.conversations.slice(-10),
          true
        );

        let fullResponse = '';

        // Send tasks first
        await writer.write(
          encoder.encode(`data: ${JSON.stringify({ type: 'tasks', tasks: state.tasks })}\n\n`)
        );

        // Stream AI response
        for await (const chunk of stream) {
          if (chunk.response) {
            fullResponse += chunk.response;
            await writer.write(
              encoder.encode(`data: ${JSON.stringify({ type: 'token', content: chunk.response })}\n\n`)
            );
          }
        }

        // Add AI response to history
        state.conversations.push({
          role: "assistant",
          content: fullResponse,
          timestamp: Date.now(),
        });

        // Keep last 50 messages
        state.conversations = state.conversations.slice(-50);

        // Save state
        await this.setState(state);

        // Send completion
        await writer.write(
          encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`)
        );
      } catch (error) {
        await writer.write(
          encoder.encode(`data: ${JSON.stringify({ type: 'error', message: error.message })}\n\n`)
        );
      } finally {
        await writer.close();
      }
    })();

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
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

  extractPriority(text) {
    const lower = text.toLowerCase();
    if (lower.includes('urgent') || lower.includes('asap') || lower.includes('critical')) {
      return 'high';
    } else if (lower.includes('important')) {
      return 'medium';
    }
    return 'normal';
  }

  buildContext(state) {
    let context = "You are a helpful personal task assistant. You can help manage tasks, provide insights, and offer proactive suggestions. ";

    if (state.tasks && state.tasks.length > 0) {
      // Analytics
      const completed = state.tasks.filter(t => t.status === 'completed').length;
      const pending = state.tasks.filter(t => t.status === 'pending').length;
      const highPriority = state.tasks.filter(t => t.priority === 'high' && t.status === 'pending').length;

      const now = Date.now();
      const dueSoon = state.tasks.filter(t => {
        if (!t.dueDate || t.status !== 'pending') return false;
        const diffMs = t.dueDate - now;
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        return diffDays >= 0 && diffDays <= 2;
      }).length;

      const overdue = state.tasks.filter(t => {
        if (!t.dueDate || t.status !== 'pending') return false;
        return t.dueDate < now;
      }).length;

      context += `\n\n📊 Task Overview: ${state.tasks.length} total (${completed} completed, ${pending} pending)`;
      if (highPriority > 0) context += `, ${highPriority} high priority`;
      if (dueSoon > 0) context += `, ${dueSoon} due soon`;
      if (overdue > 0) context += `, ⚠️ ${overdue} overdue`;

      context += "\n\nCurrent tasks:\n";
      state.tasks.forEach((task, idx) => {
        let taskStr = `${idx + 1}. [${task.status}] ${task.title}`;
        if (task.dueDate) {
          const dueStr = new Date(task.dueDate).toLocaleDateString();
          const diffMs = task.dueDate - now;
          const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
          if (diffDays < 0) {
            taskStr += ` (⚠️ OVERDUE: ${dueStr})`;
          } else if (diffDays === 0) {
            taskStr += ` (🔥 due TODAY)`;
          } else if (diffDays === 1) {
            taskStr += ` (due tomorrow)`;
          } else {
            taskStr += ` (due: ${dueStr})`;
          }
        }
        if (task.priority && task.priority !== 'normal') {
          taskStr += ` [${task.priority} priority]`;
        }
        context += taskStr + '\n';
      });

      // Add smart suggestions hint
      context += "\n💡 Provide helpful insights about task priorities, time management, or completion suggestions when appropriate.";
    } else {
      context += "The user currently has no tasks. Encourage them to add tasks and explain the features available (due dates, priorities, natural language).";
    }

    return context;
  }

  async callLLM(userMessage, context, history, stream = false) {
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
          stream: stream,
        }
      );

      if (stream) {
        return response; // Return stream directly
      }

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
        const fullText = match[1].trim();
        const dueDate = parseNaturalDate(fullText);

        // Extract task title (remove date phrases)
        let title = fullText
          .replace(/\b(by|on|for|until)\s+(today|tomorrow|next week|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/gi, '')
          .replace(/\bin\s+\d+\s+days?\b/gi, '')
          .trim();

        state.tasks.push({
          id: Date.now(),
          title: title || fullText,
          status: "pending",
          createdAt: Date.now(),
          dueDate: dueDate,
          priority: this.extractPriority(fullText),
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

    // Streaming chat endpoint
    if (url.pathname === "/api/chat/stream" && request.method === "POST") {
      try {
        const { message, sessionId } = await request.json();
        const id = env.TASK_AGENT.idFromName(sessionId || "default");
        const agent = env.TASK_AGENT.get(id);

        const response = await agent.fetch(request.url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "stream", content: message }),
        });

        return new Response(response.body, {
          headers: {
            ...corsHeaders,
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
          },
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
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
