# 🚀 Deployment & Testing Guide

> Complete guide for local development, testing, and production deployment of cf_ai_task_assistant

---

## 📋 Quick Reference

| Environment | Command | URL |
|-------------|---------|-----|
| **Worker (Dev)** | `npm run dev` | http://localhost:8787 |
| **Pages (Dev)** | `npm run pages:dev` | http://localhost:8788 |
| **Worker (Prod)** | `npm run deploy` | Your Worker URL |
| **Pages (Prod)** | `npm run pages:deploy` | Your Pages URL |

---

## ⚙️ Prerequisites

### Required Software

```bash
# Node.js 18 or higher
node --version  # Should show v18.0.0 or higher

# npm (comes with Node.js)
npm --version   # Should show 8.0.0 or higher

# Wrangler CLI (Cloudflare's tool)
npm install -g wrangler
wrangler --version
```

### Cloudflare Account

1. **Sign up** (if you don't have an account): https://dash.cloudflare.com/sign-up
2. **Free tier includes**:
   - Workers: 100,000 requests/day
   - Workers AI: 10,000 neurons/day
   - Durable Objects: 1GB storage
   - Pages: Unlimited sites

---

## 🏃 Quick Start (5 Minutes)

### 1. Clone and Install

```bash
# Clone repository
git clone https://github.com/Franckgou/cf_ai_task_assistant.git
cd cf_ai_task_assistant

# Install dependencies
npm install
```

**Expected output**:
```
added 45 packages, and audited 46 packages in 5s
```

### 2. Login to Cloudflare

```bash
wrangler login
```

**What happens**:
1. Opens browser
2. Asks you to authorize Wrangler
3. Click "Allow"
4. Returns to terminal with success message

**Troubleshooting**:
- If browser doesn't open: `wrangler login --copy-paste-url`
- Copy URL manually to browser

### 3. Run Locally

**Terminal 1** - Start Worker:
```bash
npm run dev
```

**Expected output**:
```
⛅️ wrangler 3.80.0
------------------
⬣ Listening on http://localhost:8787
Total Upload: XX KiB / gzip: XX KiB
Your worker has access to the following bindings:
- AI Bindings:
  - AI: AI
- Durable Objects:
  - TASK_AGENT: TaskAgent
```

**Terminal 2** - Start Pages (in new terminal):
```bash
npm run pages:dev
```

**Expected output**:
```
🚀 Wrangler Pages
Serving on http://localhost:8788
```

### 4. Test It!

1. **Open browser**: http://localhost:8788
2. **Try these commands**:
   - "Add task: Submit Cloudflare application"
   - "What are my tasks?"
   - "Complete task 1"
   - "Tell me about Cloudflare Workers"

**Success indicators**:
- ✅ Chat interface loads
- ✅ AI responds to messages
- ✅ Tasks appear in sidebar
- ✅ Tasks persist after page refresh

---

## 🧪 Comprehensive Testing

### Manual Testing Checklist

#### ✅ Task Management

```bash
# Test 1: Add Task
Type: "Add task: Buy groceries"
Expected: Task appears in sidebar with ID 1

# Test 2: Add Multiple Tasks
Type: "Create task: Finish homework"
Type: "New task: Call mom"
Expected: Now have 3 tasks numbered 1-3

# Test 3: Complete Task
Type: "Complete task 1"
Expected: Task 1 marked as completed

# Test 4: Delete Task
Type: "Delete task 2"
Expected: Task 2 removed from list

# Test 5: Query Tasks
Type: "What are my tasks?"
Expected: AI lists remaining tasks
```

#### ✅ Conversation Memory

```bash
# Test 1: Context Retention
Type: "Add task: Research edge computing"
Type: "What task did I just add?"
Expected: AI references "Research edge computing"

# Test 2: Multi-turn Conversation
Type: "Tell me about AI"
Type: "Can you be more specific?"
Expected: AI continues the AI topic
```

#### ✅ State Persistence

```bash
# Test 1: Page Refresh
1. Add some tasks
2. Refresh page (F5)
Expected: Tasks still appear

# Test 2: Worker Restart (Dev Only)
1. Add tasks
2. Stop Worker (Ctrl+C)
3. Restart Worker (npm run dev)
Expected: In dev, tasks reset (expected)
           In prod, tasks persist (Durable Objects)
```

#### ✅ Error Handling

```bash
# Test 1: Empty Message
Type: "" (just press Enter)
Expected: Nothing happens (input validation)

# Test 2: Very Long Message
Type: 500+ character message
Expected: Handles gracefully, response returned

# Test 3: Worker Offline
1. Stop Worker
2. Try sending message
Expected: "Failed to get response" error
```

### API Testing

Test the API endpoints directly:

```bash
# Test Chat Endpoint
curl -X POST http://localhost:8787/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Add task: Test task",
    "sessionId": "test_session_123"
  }'

# Expected Response:
# {
#   "role": "assistant",
#   "content": "I've added 'Test task' to your tasks!",
#   "tasks": [
#     {
#       "id": 1730476800000,
#       "title": "Test task",
#       "status": "pending",
#       "createdAt": 1730476800000
#     }
#   ]
# }

# Test Tasks Endpoint
curl http://localhost:8787/api/tasks?sessionId=test_session_123

# Expected Response:
# {
#   "tasks": [ ... ]
# }

# Test Health Endpoint
curl http://localhost:8787/api/health

# Expected Response:
# "AI Task Assistant API"
```

---

## 🌐 Production Deployment

### Step 1: Deploy Worker

```bash
npm run deploy
```

**What happens**:
1. Bundles your code
2. Uploads to Cloudflare
3. Creates Durable Objects
4. Binds Workers AI

**Expected output**:
```
Total Upload: XX KiB / gzip: XX KiB
Uploaded cf-ai-task-assistant (X.XX sec)
Published cf-ai-task-assistant (X.XX sec)
  https://cf-ai-task-assistant.YOUR-SUBDOMAIN.workers.dev
Current Deployment ID: XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
```

**Copy your Worker URL!** You'll need it next.

### Step 2: Update Frontend Configuration

Edit `public/index.html` (line 269):

**Before**:
```javascript
const API_BASE = 'http://localhost:8787';
```

**After**:
```javascript
const API_BASE = 'https://cf-ai-task-assistant.YOUR-SUBDOMAIN.workers.dev';
```

### Step 3: Deploy Pages

```bash
npm run pages:deploy
```

**What happens**:
1. Asks for project name: `cf-ai-task-assistant`
2. Uploads static files
3. Deploys to Cloudflare Pages

**Expected output**:
```
🌍 Uploading... (X/X)

✨ Success! Uploaded X files (X.XX sec)

✨ Deployment complete! Take a peek over at
   https://cf-ai-task-assistant.pages.dev
```

### Step 4: Verify Deployment

1. **Open Pages URL**: https://cf-ai-task-assistant.pages.dev
2. **Test features**:
   - Send a message
   - Add a task
   - Verify persistence
   - Test on mobile

**Success indicators**:
- ✅ UI loads globally
- ✅ API requests work
- ✅ Tasks persist across sessions
- ✅ Fast response times (<2s)

---

## 🔧 Configuration

### Wrangler Configuration

**File**: `wrangler.jsonc`

```jsonc
{
  "$schema": "./node_modules/wrangler/config-schema.json",
  "name": "cf-ai-task-assistant",        // Your Worker name
  "main": "src/index.js",                 // Entry point
  "compatibility_date": "2024-10-01",     // API version
  
  "ai": {
    "binding": "AI"                       // Workers AI binding
  },
  
  "durable_objects": {
    "bindings": [
      {
        "name": "TASK_AGENT",             // Binding name
        "class_name": "TaskAgent"         // Class to instantiate
      }
    ]
  },
  
  "migrations": [
    {
      "tag": "v1",
      "new_sqlite_classes": [
        "TaskAgent"                       // Enable SQLite storage
      ]
    }
  ]
}
```

### Package.json Scripts

```json
{
  "scripts": {
    "dev": "wrangler dev",                // Local Worker
    "deploy": "wrangler deploy",          // Deploy Worker
    "pages:dev": "wrangler pages dev public",  // Local Pages
    "pages:deploy": "wrangler pages deploy public"  // Deploy Pages
  }
}
```

---

## 🐛 Troubleshooting

### Common Issues

#### ❌ "Port 8787 already in use"

**Problem**: Another process using port 8787

**Solution**:
```bash
# On macOS/Linux
lsof -ti:8787 | xargs kill

# On Windows
netstat -ano | findstr :8787
taskkill /PID <PID> /F
```

#### ❌ "Failed to get response"

**Possible causes**:
1. Worker not running
2. Wrong API_BASE URL
3. CORS issues

**Solutions**:
```bash
# 1. Verify Worker is running
curl http://localhost:8787

# 2. Check API_BASE in index.html matches
# 3. Check CORS headers in src/index.js
```

#### ❌ "AI binding not found"

**Problem**: Workers AI not enabled

**Solution**:
1. Login: `wrangler login`
2. Verify AI binding in wrangler.jsonc
3. Restart Worker

#### ❌ "Durable Object error"

**Problem**: Durable Objects not properly configured

**Solution**:
```bash
# Verify binding in wrangler.jsonc
# Re-deploy with migrations
wrangler deploy
```

#### ❌ "Tasks not persisting in development"

**Expected behavior**: Tasks reset when Worker restarts in dev

**Solution**: This is normal. In production, tasks persist indefinitely.

#### ❌ "Slow LLM responses"

**Possible causes**:
1. Cold start (first request)
2. Large context window
3. Network latency

**Solutions**:
- Wait 30s after deploy for warm-up
- Reduce max_tokens if needed
- Check network connection

### Debug Mode

Enable verbose logging in `src/index.js`:

```javascript
const DEBUG = true;

if (DEBUG) {
  console.log('Incoming message:', message);
  console.log('Current state:', state);
  console.log('LLM context:', context);
  console.log('LLM response:', response);
}
```

View logs:
```bash
# Development
# Check terminal running npm run dev

# Production
wrangler tail
```

---

## 📊 Performance Monitoring

### Metrics to Track

```javascript
// Add timing to src/index.js
const startTime = Date.now();

// ... your code ...

const endTime = Date.now();
console.log(`Request took ${endTime - startTime}ms`);
```

### Expected Performance

| Metric | Development | Production |
|--------|-------------|------------|
| Cold start | ~800ms | ~500ms |
| Warm request | ~150ms | ~100ms |
| LLM inference | ~2s | ~1.5s |
| State write | ~100ms | ~50ms |
| Total request | ~2.2s | ~1.7s |

---

## 🔐 Security Best Practices

### Environment Variables

For sensitive data, use Wrangler secrets:

```bash
# Set a secret
wrangler secret put API_KEY

# Access in code
const apiKey = env.API_KEY;
```

### Rate Limiting (Future Enhancement)

```javascript
// Example rate limiting
const rateLimiter = {
  async limit(sessionId) {
    const key = `rate_${sessionId}`;
    const count = await this.state.storage.get(key) || 0;
    
    if (count > 100) {
      throw new Error('Rate limit exceeded');
    }
    
    await this.state.storage.put(key, count + 1, {
      expirationTtl: 3600 // 1 hour
    });
  }
};
```

---

## 📈 Scaling Considerations

### Current Architecture

- **Users**: Unlimited (Durable Objects auto-scale)
- **Requests**: 100,000/day (free tier)
- **Workers AI**: 10,000 neurons/day (free tier)
- **Storage**: 1GB total (free tier)

### Optimization Tips

1. **Reduce LLM Calls**: Cache common responses
2. **Optimize Context**: Send only necessary history
3. **Batch Operations**: Group multiple tasks
4. **Use AI Gateway**: Cache LLM responses (future)

---

## 🎯 Production Checklist

Before going live:

- [ ] Test all features locally
- [ ] Deploy Worker successfully
- [ ] Update API_BASE in index.html
- [ ] Deploy Pages successfully
- [ ] Test production deployment
- [ ] Verify on mobile devices
- [ ] Check error handling
- [ ] Monitor initial traffic
- [ ] Set up custom domain (optional)
- [ ] Add analytics (optional)

---

## 📚 Additional Resources

### Cloudflare Docs
- [Workers](https://developers.cloudflare.com/workers/)
- [Pages](https://developers.cloudflare.com/pages/)
- [Workers AI](https://developers.cloudflare.com/workers-ai/)
- [Durable Objects](https://developers.cloudflare.com/durable-objects/)

### Wrangler Commands
```bash
wrangler login          # Login to Cloudflare
wrangler whoami         # Check logged in user
wrangler dev            # Start local development
wrangler deploy         # Deploy to production
wrangler tail           # View live logs
wrangler logout         # Logout
```

---

## 🎉 You're Ready!

Your cf_ai_task_assistant is now:
- ✅ Tested locally
- ✅ Deployed to production
- ✅ Accessible globally
- ✅ Ready to impress

**Next steps**:
1. Add the live URL to your GitHub README
2. Include the demo link in your internship application
3. Test it one more time before submitting

Good luck! 🚀

---

<div align="center">

**Built with ❤️ on Cloudflare's Edge**

</div>