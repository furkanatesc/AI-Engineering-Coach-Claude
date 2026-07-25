<h1 align="center">AI Engineer Coach</h1>

<p align="center">
<strong>better agentic engineering.</strong><br>
Analyze your AI coding assistant usage — any harness, one dashboard.
</p>

<p align="center">
<a href="LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-blue.svg"></a>
<img alt="VS Code 1.115+" src="https://img.shields.io/badge/VS%20Code-1.115%2B-007ACC">
</p>

<br>

<p align="center">
  
https://github.com/user-attachments/assets/9f0239bf-20e0-459f-b137-17cce0edd1b2

</p>

---

## What it does

AI Engineer Coach reads your local AI session logs and turns them into actionable insights — no data leaves your machine.

- **Track progress** -- practice scores, weekly trends, daily activity charts
- **Detect anti-patterns** -- 45 rules across prompt quality, session hygiene, code review, tool mastery, and context management
- **Measure output** -- AI-generated code volume by language, workspace, model, and harness
- **Discover skills** -- find repeated prompts and turn them into reusable skills
- **Score context health** — agentic readiness checks, instruction-file audits, workspace context maps

<details>
<summary><strong>Screenshots</strong></summary>
<br>
<p align="center"><img src="assets/screen-timeline.png" alt="Timeline" width="820"></p>
<p align="center"><img src="assets/screen-output.png" alt="Code Output" width="820"></p>
<p align="center"><img src="assets/screen-consumption.png" alt="Premium Request Consumption" width="820"></p>
<p align="center"><img src="assets/screen-patterns-projects.png" alt="Activity Patterns - Projects" width="820"></p>
<p align="center"><img src="assets/screen-patterns-workhours.png" alt="Activity Patterns - Work Hours" width="820"></p>
<p align="center"><img src="assets/screen-antipatterns.png" alt="Anti-Patterns" width="820"></p>
<p align="center"><img src="assets/screen-skill-finder.png" alt="Skill Finder" width="820"></p>
<p align="center"><img src="assets/screen-context-quality.png" alt="Context Quality" width="820"></p>
<p align="center"><img src="assets/screen-context-management.png" alt="Context Management" width="820"></p>
<p align="center"><img src="assets/screen-learning.png" alt="Learning Center" width="820"></p>
<p align="center"><img src="assets/screen-achievements.png" alt="Achievements" width="820"></p>
<p align="center"><img src="assets/screen-sdlc.png" alt="Agentic SDLC" width="820"></p>
<p align="center"><img src="assets/screen-share.png" alt="Share Your Stats" width="820"></p>
</details>

---

## Installation

The extension is not published to a marketplace or Releases page, so you build the `.vsix` yourself and install it. Pick whichever build path fits your setup.

### Path 1 -- Dev Container build (no local Node.js/npm)

Prerequisites:

- VS Code
- Dev Containers extension
- Docker or Podman

Steps:

1. Clone the repo and open it in VS Code.
2. Reopen in container.
3. Run:

```bash
npm ci
npm run package
```

4. Install the generated `.vsix` (see [Install the built VSIX](#install-the-built-vsix) below).

### Path 2 -- Local build

Prerequisites:

- VS Code
- Node.js and npm

Steps:

```bash
git clone https://github.com/microsoft/ai-engineering-coach.git
cd ai-engineering-coach
npm ci
npm run package
```

Then install the generated `.vsix` (see below).

### Install the built VSIX

**macOS / Linux**

```bash
code --install-extension ai-engineer-coach-*.vsix
```

**Windows / PowerShell**

```powershell
code --install-extension (Get-ChildItem . -Filter 'ai-engineer-coach-*.vsix' | Select-Object -First 1).FullName
```

If the CLI does not work, install it from the VS Code UI: press `Ctrl+Shift+P`, type **Install from VSIX**, then browse to the `.vsix` file and select it.

After install:

1. Open the command palette (`Cmd+Shift+P` / `Ctrl+Shift+P`)
2. Run **AI Engineer Coach: Open Dashboard**
3. Navigate pages from the sidebar, filter by workspace or harness

---

## Run as a canvas in the GitHub Copilot app

The same dashboard also runs as a canvas inside the GitHub Copilot app, so you do not need VS Code to use it.

A canvas is an interactive side panel in the GitHub Copilot app. Rather than replying only in chat, the agent can open a canvas to show rich, task-specific UI that you view and interact with directly while you keep working. Extensions register their own canvases, and this repo ships one named **AI Engineer Coach** under [`.github/extensions/ai-engineer-coach/`](.github/extensions/ai-engineer-coach/). It reuses the exact webview bundle from the VS Code extension and parses your local session logs in process, so nothing leaves your machine.

To open it:

1. Clone this repo and open it as a project in the GitHub Copilot app.
2. Build the project once:

```bash
npm install && npm run build
```

3. Open the **AI Engineer Coach** canvas. On a fresh clone it shows a setup card with the build command and reloads into the full dashboard once the build finishes. No manual reopen needed.

A few features depend on the local VS Code language model and are hidden in canvas mode: **Skill Finder**, **Learning Center**, the **Level Up** section, and the **Context Health** AI review. Everything driven by your on-disk logs (Dashboard, Timeline, Coding Moments, Output, Patterns, Anti-Patterns) works the same. App sessions show up as **GitHub Copilot App** and terminal sessions as **GitHub Copilot CLI** in the harness breakdown.

---

## Use from a terminal agent (MCP server)

The coach also ships a standalone [MCP](https://modelcontextprotocol.io) server, so terminal agents such as Claude Code or Copilot CLI can query your usage data directly — no VS Code and no dashboard. It runs in a plain Node process, parses your local logs in process, and speaks MCP over stdio.

### Setup

1. Clone the repo and build once:

```bash
npm install && npm run build
```

This produces `dist/mcp-server.cjs`.

2. Register it with your agent. For **Claude Code**, from anywhere:

```bash
claude mcp add ai-coach --scope user -- node /absolute/path/to/repo/dist/mcp-server.cjs
```

`--scope user` makes the server available in every project, which is usually what you want — your coaching data spans all your workspaces, not just this repo.

For any other MCP client, point it at the same command:

```json
{
  "mcpServers": {
    "ai-coach": {
      "command": "node",
      "args": ["/absolute/path/to/repo/dist/mcp-server.cjs"]
    }
  }
}
```

3. Verify the connection:

```bash
claude mcp list
```

Then just ask in natural language — _"show me my anti-patterns from the last 30 days"_, _"compare my Claude and Copilot usage"_, _"how is my flow state?"_ — and the agent picks the right tool.

### Tools

The server exposes the same twelve tools as the `@aicoach` chat participant, plus a reload:

| Tool                                | Returns                                                                       |
| ----------------------------------- | ----------------------------------------------------------------------------- |
| `aiEngineerCoach_summary`           | Session counts, practice recommendations, top anti-patterns. Good entry point |
| `aiEngineerCoach_activity`          | Daily requests, LOC, sessions, harness breakdown                              |
| `aiEngineerCoach_credits`           | AI credit usage per model, daily trend, most expensive requests               |
| `aiEngineerCoach_codeProduction`    | AI vs user LOC, language breakdown, workspace distribution                    |
| `aiEngineerCoach_flow`              | Deep work scores, best hours, follow-up latency, session continuity           |
| `aiEngineerCoach_patterns`          | Detected anti-patterns with severity, group scores, and trends                |
| `aiEngineerCoach_insights`          | Learning velocity, intent mix, prompt maturity, sustainable pace              |
| `aiEngineerCoach_wellbeing`         | Work-life balance score, weekend ratio, burnout risk                          |
| `aiEngineerCoach_workflows`         | Repeated workflow clusters worth automating, with draft skill suggestions      |
| `aiEngineerCoach_harnessComparison` | AI tools side by side: sessions, requests, LOC, models, cancel rates          |
| `aiEngineerCoach_sessions`          | Browse or search individual sessions, or fetch one by ID                       |
| `aiEngineerCoach_contextHealth`     | Compaction events, config health, agentic readiness, instruction quality       |
| `aiEngineerCoach_reload`            | Re-parse the logs when a long-running server has gone stale                    |

Every tool except `reload` accepts optional `fromDate`, `toDate`, `workspaceId`, and `harness` filters. `sessions` additionally takes `sessionId`, `page`, `pageSize`, and `search`.

### Notes

- The first tool call parses your logs and caches the result, so it is slower than the ones that follow. `aiEngineerCoach_reload` refreshes that cache after you have done more coding.
- The server writes diagnostics to stderr only — stdout belongs to the JSON-RPC stream.
- After changing anything under `src/`, re-run `npm run build`; the agent runs the bundle in `dist/`, not the sources.
- To remove it again: `claude mcp remove ai-coach --scope user`.

---

## Pages

### Observe

| Page               | Description                                                                           |
| ------------------ | ------------------------------------------------------------------------------------- |
| **Dashboard**      | Practice scores with week-over-week trends, daily activity chart, top workspace stats |
| **Timeline**       | Gantt-style session timeline with per-day drill-down and overlap detection            |
| **Coding Moments** | Screenshot gallery from AI coding sessions with story reels and workspace filtering   |

### Measure

| Page         | Description                                                                                 |
| ------------ | ------------------------------------------------------------------------------------------- |
| **Output**   | Generated code volume by language, model usage table _(token breakdown temporarily hidden)_ |
| **Burndown** | Monthly AI token budget progress with projections _(temporarily disabled)_                  |
| **Patterns** | 7×24 activity heatmap and work-life balance signals                                         |

### Improve

| Page                | Description                                                                                                                                |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Anti-Patterns**   | Five practice score cards with severity ratings, concrete actions, and example prompts. 45 editable markdown rules plus a coverage heatmap |
| **Rule Editor**     | Create, edit, and tune detection rules visually or as raw markdown. Live-test against your data                                            |
| **Rule Playground** | Interactive REPL for the rule DSL with field browser, function catalog, and metric list                                                    |
| **Data Explorer**   | Browse session fields, view distributions, run ad-hoc filters                                                                              |
| **Skill Finder**    | Discover repeated prompt patterns and matching community skills from the open-source catalog                                               |
| **Context Health**  | Overall context score, agentic readiness checklist, workspace context map, AI-powered instruction-file review                              |

### Level Up

| Page                | Description                                                                      |
| ------------------- | -------------------------------------------------------------------------------- |
| **Learning Center** | Personalized quizzes and code-comparison rounds generated from your actual usage |
| **Achievements**    | XP-based progression with Bronze → Silver → Gold → Diamond tiers                 |
| **Agentic SDLC**    | How you use AI across the full software-development lifecycle                    |
| **Share**           | Generate a shareable stat card and export Markdown/JSON summaries               |

---

## Privacy

- **Read-only** — the extension never modifies your session files
- **Local analysis** — all parsing and analytics run entirely on your machine
- **No proprietary telemetry** — the extension does not phone home or collect usage data
- **Optional AI features** — some features (rule compiler, skill finder, context review) use the VS Code built-in Copilot language model API when explicitly invoked by the user

---

## Code of Conduct

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

## Trademarks

This project may contain trademarks or logos for projects, products, or services. Authorized use of Microsoft
trademarks or logos is subject to and must follow
[Microsoft's Trademark & Brand Guidelines](https://www.microsoft.com/en-us/legal/intellectualproperty/trademarks/usage/general).
Use of Microsoft trademarks or logos in modified versions of this project must not cause confusion or imply Microsoft sponsorship.
Any use of third-party trademarks or logos are subject to those third-party's policies.

## License

[MIT](LICENSE)

## Disclaimer

This project is an open-source community effort by Microsoft employees. It is **not** an official Microsoft product and is not part of any Microsoft service or support offering. It is provided as-is with no warranties or guarantees.
