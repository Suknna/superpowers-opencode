# 同步上游 superpowers v6.0.0 到 OpenCode fork

## 背景

本 fork 在上游 `obra/superpowers` 的 **v5.1.0** 处分叉，做了三项 OpenCode 专属改造：

1. **primary-agent bootstrap** —— `agents/superpowers.md` + `.opencode/plugins/superpowers.js` 取代上游的 `using-superpowers` 会话启动机制。
2. **goal-driven-development（GDD）** —— 取代上游默认的 `test-driven-development`（TDD）。
3. **OpenCode-only README** + 本地新增的 **grill-me 探询模式**（brainstorming）。

上游 v6.0.0 是一次大版本，混合了两类变更：对所有 harness 都有价值的核心技能改进，以及纯 harness 适配（新增 Kimi/Pi/Antigravity，更新 Codex/Cursor/Gemini）。本次同步只吸收前者，跳过后者。

## 目标

把上游 v6.0.0 中**与 harness 无关的核心技能改进**忠实同步进 fork，同时完整保留 fork 的三项专属改造。不引入任何其他 harness 的支持文件。

## 范围

### 采纳（与 harness 无关的核心技能改进）

| 区域 | 内容 |
|------|------|
| `subagent-driven-development` | 双 reviewer 合一为单 `task-reviewer-prompt.md`（两个 verdict）；diff/任务文本落文件；新增 `task-brief`、`review-package` 脚本；每次 dispatch 必须声明模型；禁止 controller 压制 findings/预判严重度；reviewer 只读且不被 rationale 说服；plan 预检；最终单次全分支 review；进度账本可恢复 |
| `writing-plans` | Global Constraints 块、per-task Interfaces 块、right-sizing 指引 |
| `brainstorming` | 视觉伴侣改为 just-in-time 提供（仅此语义） |
| `brainstorming/visual-companion` + `scripts/` | 每会话密钥鉴权、文件沙箱、重启续连、自动重连、4h 空闲超时、`stop-server.sh` 进程归属确认、Windows 启动加固 |
| `writing-skills` | "Match the Form to the Failure" 表、"Micro-Test Wording"、收紧 rationalization 段落、`anthropic-best-practices.md`/`persuasion-principles.md` 更新 |
| `systematic-debugging` | 修掉强制 extended-thinking 的关键词 bug（连字符断词） |
| `requesting-code-review/code-reviewer.md` | 上游对 reviewer 提示的改进 |
| `finishing-a-development-branch` | forge-neutral（不再硬编码 `gh pr create`） |
| `using-git-worktrees` | 弃用全局 `~/.config/superpowers/worktrees/`，worktree 落项目内 `.worktrees/` |
| `executing-plans`、`receiving-code-review` | 上游小幅措辞更新 |

### 跳过（与 OpenCode-only fork 无关）

- 新 harness 整体：`.kimi-plugin/`、`.pi/`、Antigravity，及其 `tests/`、`docs/README.kimi.md`
- Codex/Cursor/Gemini 的 `plugin.json`、`hooks/`、`gemini-extension.json`、`session-start-codex`
- `skills/using-superpowers/`（含 `references/*-tools.md` 多 harness 工具映射）—— fork 已用 primary agent 取代整个 using-superpowers 机制
- `evals/` 子模块、`docs/porting-to-a-new-harness.md`、`docs/testing.md` 的 drill/evals 重写
- `scripts/sync-to-codex-plugin.sh`、`scripts/lint-shell.sh`、`.pre-commit-config.yaml`（针对上游多 harness 工程）
- 上游 `tests/` 中针对被跳过 harness 的测试

## 三项关键决策（已与用户确认，均选 A）

### 决策 1：SDD ↔ TDD 耦合

上游重写后的 `subagent-driven-development/SKILL.md` 与 `implementer-prompt.md` 引用 `test-driven-development`。fork 走 GDD 路线。

**采纳上游 SDD 重写，但把其中所有 `test-driven-development`/TDD 引用改写为 `goal-driven-development`**，保持 fork 的实现纪律不变。具体改写点：
- `SKILL.md` 第 ~336 行 "Subagents follow TDD naturally"、第 ~413 行 "superpowers:test-driven-development - Subagents follow TDD for each task"
- `implementer-prompt.md` 中 "Write tests (following TDD if task says to)"、"Did I follow TDD if required?"、"TDD Evidence" 改为对应的 GDD 完成检查表语义（与 fork 现有 implementer-prompt 的 GDD 引用风格一致）

### 决策 2：brainstorming 合并

**保留 fork 的 grill-me 模式，只把视觉伴侣的 "just-in-time 提供" 语义合并进来。**
- 不删除 fork 在 SKILL.md 中的 grill-me 钩子（checklist 第 2 项之外的 Grill Me 激活/非激活段落、流程图节点、`grill-me.md` 引用）
- 采纳上游对视觉伴侣"不再 upfront 提供、首次出现真正可视化问题时才提供、`--open` 自动开浏览器"的措辞
- 注意上游把 checklist 第 2 项从"Offer visual companion (if topic will involve visual questions)"改为 just-in-time 版本——这一条采纳；但流程图中被上游删掉的 grill-me 节点必须保留 fork 版本

### 决策 3：using-superpowers / references

**整个 `skills/using-superpowers/` 目录跳过不同步**（含 `references/` 多 harness 工具映射）。fork 已用 primary agent 机制取代该启动机制。

## 风险与处理

- **TDD 引用改写遗漏**：同步后全仓搜索 `test-driven-development`、`TDD`，确认除 `tests/skill-triggering/prompts/test-driven-development.txt` 这类历史触发样本外，技能正文无残留。
- **brainstorming 三方合并冲突**：grill-me（fork 新增）与 just-in-time（上游新增）落在同一文件相邻区域，需手工合并而非整体覆盖。
- **视觉伴侣脚本兼容性**：`server.cjs`/`helper.js`/`start-server.sh`/`stop-server.sh` 是 harness 无关的 Node/shell，OpenCode 同样运行，可整体采纳；但需确认 fork 之前对这些脚本无本地改动（分叉点 v5.1.0 后 fork 未触碰 brainstorming 脚本，确认即可整取）。
- **`using-git-worktrees` 路径策略变更**：fork 的 `finishing-a-development-branch` 也引用 worktree 路径，两者需一起更新以保持一致。

## 验证

- 全量同步后运行 fork 现有相关 tests（`tests/opencode/`、`tests/brainstorm-server/` 中可在本机运行的部分）。
- 全仓搜索确认 TDD 引用已按决策 1 改写。
- 确认未引入任何 `.kimi-plugin/`、`.pi/`、`using-superpowers/`、`evals/` 等被跳过的文件。
- `git diff --stat` 复核改动文件集合落在"采纳"范围内。

## 交付

- 修改内容：上述"采纳"范围内的技能与脚本同步 + 决策 1/2 的本地改写
- 修改原因：吸收上游 v6.0.0 核心技能质量改进，保持 fork OpenCode 专属路线
- 验证方法：见上"验证"节
- 官方文档引用：上游 release notes https://github.com/obra/superpowers/releases/tag/v6.0.0（同步源），不涉及第三方 SDK
