# Contributing to cf_ai_task_assistant 🤝

First off, thank you for considering contributing to cf_ai_task_assistant! This project was created as part of a Cloudflare internship application, but improvements and suggestions are always welcome.

---

## 📋 Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Process](#development-process)
4. [Coding Standards](#coding-standards)
5. [Commit Messages](#commit-messages)
6. [Pull Request Process](#pull-request-process)
7. [Areas for Contribution](#areas-for-contribution)

---

## 📜 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for everyone. Please be respectful and constructive in all interactions.

### Expected Behavior

- Be kind and courteous
- Respect differing viewpoints
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards others

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Cloudflare account (free tier)
- Git

### Local Setup

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/Franckgou/cf_ai_task_assistant.git
   cd cf_ai_task_assistant
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/Franckgou/cf_ai_task_assistant.git
   ```

4. **Install dependencies**
   ```bash
   npm install
   ```

5. **Run locally**
   ```bash
   # Terminal 1
   npm run dev
   
   # Terminal 2
   npm run pages:dev
   ```

---

## 🔄 Development Process

### Branch Strategy

- `main`: Production-ready code
- `develop`: Active development
- `feature/*`: New features
- `bugfix/*`: Bug fixes
- `docs/*`: Documentation updates

### Creating a Feature Branch

```bash
# Update your local main
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/amazing-feature
```

### Making Changes

1. **Make your changes** in your feature branch
2. **Test thoroughly** - ensure all features work
3. **Add tests** if applicable
4. **Update documentation** if needed
5. **Run linting** (if configured)

### Testing Your Changes

```bash
# Start development environment
npm run dev
npm run pages:dev

# Test in browser at http://localhost:8788

# Manual test checklist:
# - [ ] Add task works
# - [ ] Complete task works
# - [ ] Delete task works
# - [ ] Conversation works
# - [ ] State persists
# - [ ] UI responsive
# - [ ] No console errors
```

---

## 📝 Coding Standards

### JavaScript Style

```javascript
// Use const for immutable variables
const API_BASE = 'http://localhost:8787';

// Use let for mutable variables
let taskCount = 0;

// Use meaningful variable names
const userMessage = messageInput.value;

// Use template literals
console.log(`Processing message: ${userMessage}`);

// Use arrow functions where appropriate
const processTask = (task) => {
  // ...
};

// Add comments for complex logic
// Extract task title from message using regex pattern
const match = message.match(/(?:add|create) task[:\s]+(.+)/i);
```

### File Organization

```
src/
├── index.js           # Main Worker logic
│   ├── TaskAgent      # Durable Object class
│   ├── Handlers       # Request handlers
│   └── Utilities      # Helper functions
```

### Code Quality Principles

1. **DRY** (Don't Repeat Yourself): Extract repeated code into functions
2. **KISS** (Keep It Simple, Stupid): Prefer simple solutions
3. **YAGNI** (You Aren't Gonna Need It): Don't add features you don't need yet
4. **Separation of Concerns**: Each function should do one thing well

### Error Handling

```javascript
// Always handle errors gracefully
try {
  const response = await this.callLLM(message);
  return response;
} catch (error) {
  console.error('Error calling LLM:', error);
  return 'I apologize, I encountered an error. Please try again.';
}
```

### Documentation

```javascript
/**
 * Process a user message and generate AI response
 * @param {string} message - The user's message
 * @returns {Promise<Object>} Response with AI content and updated tasks
 */
async handleMessage(message) {
  // Implementation
}
```

---

## 💬 Commit Messages

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
# Feature
feat(tasks): add task priority levels

Allow users to set priority (high, medium, low) when creating tasks.
Updates TaskAgent schema and UI to display priorities.

Closes #123

# Bug fix
fix(state): prevent duplicate tasks

Fixed issue where tasks were being duplicated when quickly
clicking the add button. Added debouncing to prevent race condition.

# Documentation
docs(readme): add deployment troubleshooting section

Added common deployment issues and solutions to help new contributors.
```

### Best Practices

- Use present tense: "add feature" not "added feature"
- Keep subject line under 50 characters
- Capitalize subject line
- No period at end of subject
- Separate subject and body with blank line
- Use body to explain what and why, not how
- Reference issues and pull requests

---

## 🔀 Pull Request Process

### Before Submitting

1. **Update from upstream**
   ```bash
   git checkout main
   git pull upstream main
   git checkout your-feature-branch
   git rebase main
   ```

2. **Test everything**
   - Run the app locally
   - Test all affected features
   - Check for console errors
   - Test on mobile if UI changes

3. **Update documentation**
   - Update README.md if needed
   - Add to CHANGELOG.md
   - Update code comments

### Submitting a Pull Request

1. **Push your branch**
   ```bash
   git push origin feature/your-feature
   ```

2. **Create Pull Request on GitHub**
   - Click "New Pull Request"
   - Select your branch
   - Fill out the template

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactoring

## Testing
- [ ] Tested locally
- [ ] Added new tests
- [ ] All tests passing
- [ ] Tested on mobile

## Screenshots (if applicable)
[Add screenshots of UI changes]

## Checklist
- [ ] Code follows project style guidelines
- [ ] Documentation updated
- [ ] No console errors
- [ ] Tested all affected features
```

### Review Process

1. **Maintainer Review**: A project maintainer will review your PR
2. **Feedback**: Address any requested changes
3. **Approval**: Once approved, your PR will be merged
4. **Thank You**: You'll be credited as a contributor!

---

## 🎯 Areas for Contribution

### High Priority

1. **Voice Input**
   - Implement Web Speech API
   - Add voice-to-text button
   - Handle voice commands

2. **Task Scheduling**
   - Add due dates to tasks
   - Implement reminders
   - Use Cloudflare Workflows

3. **Advanced AI Features**
   - Task breakdown (decompose complex tasks)
   - Smart suggestions
   - Proactive reminders

### Medium Priority

1. **UI/UX Improvements**
   - Dark mode toggle
   - Custom themes
   - Animation enhancements
   - Accessibility improvements

2. **Task Features**
   - Task categories/tags
   - Priority levels
   - Subtasks
   - Task notes

3. **Data Management**
   - Export tasks (JSON, CSV)
   - Import tasks
   - Task search
   - Filtering options

### Low Priority

1. **Integrations**
   - Calendar sync (Google Calendar, Outlook)
   - Email notifications
   - Slack integration
   - Mobile app

2. **Analytics**
   - Task completion stats
   - Productivity insights
   - Usage analytics
   - Performance monitoring

### Documentation

1. **Tutorials**
   - Video walkthrough
   - Step-by-step guides
   - Common use cases

2. **API Documentation**
   - OpenAPI spec
   - Example requests
   - Error codes reference

3. **Architecture**
   - System diagrams
   - Data flow diagrams
   - Component interactions

---

## 🐛 Bug Reports

### Before Reporting

1. **Check existing issues** - Your bug might already be reported
2. **Try latest version** - Bug might be fixed already
3. **Reproduce consistently** - Can you make it happen reliably?

### Creating a Bug Report

Use this template:

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. Type '...'
4. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g. macOS 14]
- Browser: [e.g. Chrome 120]
- Node version: [e.g. 18.17.0]

**Additional context**
Any other relevant information.
```

---

## 💡 Feature Requests

### Before Requesting

1. **Check existing requests** - Might already exist
2. **Consider scope** - Does it fit the project goals?
3. **Think it through** - How would it work?

### Creating a Feature Request

Use this template:

```markdown
**Problem to Solve**
What problem does this feature solve?

**Proposed Solution**
How would you like it to work?

**Alternatives Considered**
What other solutions did you consider?

**Additional Context**
Any other relevant information.

**Would you like to implement this?**
- [ ] Yes, I can work on this
- [ ] No, just suggesting
```

---

## 🙏 Recognition

Contributors will be:
- Listed in README.md
- Credited in release notes
- Acknowledged in the project

### Current Contributors

- [Your Name] - Original creator
- [Contributor Name] - Feature contribution
- [Contributor Name] - Bug fix

---

## 📚 Resources

### Learning Cloudflare
- [Workers Documentation](https://developers.cloudflare.com/workers/)
- [Durable Objects Guide](https://developers.cloudflare.com/durable-objects/)
- [Workers AI Documentation](https://developers.cloudflare.com/workers-ai/)

### JavaScript Resources
- [MDN JavaScript Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide)
- [JavaScript.info](https://javascript.info/)

### Git Resources
- [Pro Git Book](https://git-scm.com/book/en/v2)
- [Git Flow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow)

---

## ❓ Questions?

If you have questions:

1. **Check documentation** first (README.md, docs/)
2. **Search issues** on GitHub
3. **Ask in discussions** on GitHub
4. **Open an issue** if it's a new question

---

## 🎉 Thank You!

Every contribution, no matter how small, helps make this project better. Whether it's:

- Fixing a typo
- Reporting a bug
- Suggesting a feature
- Writing documentation
- Contributing code

**You're awesome!** 🌟

---

<div align="center">

**Happy Contributing!** 🚀

[⬆ Back to Top](#contributing-to-cf_ai_task_assistant-)

</div>