---
name: git-commit
description: "Analyze staged changes and generate a conventional commit message. Use before committing code. Triggers on: commit, git commit, 提交, 写commit, generate commit message."
user-invocable: true
---

# Git Commit Message Generator

Analyze staged changes and generate a well-structured conventional commit message.

---

## The Job

1. Run `git diff --cached --stat` and `git diff --cached` to see staged changes
2. Analyze what changed and why
3. Generate a commit message following conventional commits format
4. Present to user for approval; commit only when confirmed

**Important:** Do NOT run `git commit` without user confirmation. Show the message first.

---

## Conventional Commit Format

```
<type>(<scope>): <subject>

<body>
```

### Types

| Type | When to use |
|------|------------|
| `feat` | New feature or functionality |
| `fix` | Bug fix |
| `refactor` | Code restructuring without feature/fix changes |
| `perf` | Performance improvement |
| `style` | Formatting, missing semicolons, etc. (no code change) |
| `docs` | Documentation only |
| `test` | Adding or updating tests |
| `chore` | Build process, tooling, dependencies |
| `ci` | CI/CD changes |

### Scope

Derive from the part of the project changed. Look at file paths to determine scope. Common scopes for this project:

- `chat` - Chat components, chat store, chat service
- `knowledge` - Knowledge base, document management
- `creation` - Content creation panel
- `auth` - Authentication, login, register
- `rag` - RAG pipeline, embedding, retrieval
- `api` - API service layer
- `store` - Pinia stores
- `ui` - Shared/common UI components
- `router` - Vue Router

If changes span multiple scopes, pick the primary one.

### Subject Rules

- Use Chinese (this project's convention)
- Imperative mood: "添加消息编辑功能" not "添加了消息编辑功能"
- No period at end
- Keep under 50 characters
- Start with a verb: 添加, 修复, 优化, 重构, 移除

### Body (optional but recommended)

- Explain WHAT changed and WHY
- One paragraph max for small changes
- Use bullet points (`-`) for multi-change commits
- Reference issue numbers if applicable

---

## Examples

### Single change
```
feat(chat): 添加消息编辑功能

点击用户消息可进入编辑模式，修改后重新发送并丢弃后续回复。
```

### Multi-change
```
fix(rag): 修复 PDF 文档分块后中文乱码

- 在 pdfParser 中添加 UTF-8 编码检测
- 分块时保留原始换行符结构
```

### Refactor
```
refactor(store): 提取会话持久化逻辑为 composable

将会话的 localStorage 读写逻辑从 chat store 中提取到 useSessionStorage，
减少 store 文件行数并方便复用。
```

### Trivial
```
chore: 更新依赖版本
```

---

## Step-by-Step

1. **Check staged changes:**
   ```bash
   git diff --cached --stat
   ```
   If nothing staged, suggest `git add` and stop.

2. **Read the diff:**
   ```bash
   git diff --cached
   ```
   Understand what files changed and what the actual code changes are.

3. **Analyze:**
   - What area of the project is affected? → scope
   - Is it a feature, fix, refactor, etc.? → type
   - What's the one-sentence summary? → subject
   - What context would a future reader need? → body

4. **Generate the message** and present it to the user for confirmation.

5. **On confirmation**, run:
   ```bash
   git commit -m "<generated message>"
   ```

---

## Checklist

- [ ] Staged changes exist (non-empty diff)
- [ ] Correct type chosen
- [ ] Scope matches changed files
- [ ] Subject in Chinese, imperative, under 50 chars
- [ ] Body explains why, not just what
- [ ] User approved before committing
