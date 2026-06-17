# 同步上游 superpowers v6.0.0 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Explicitly invoke/load superpowers:goal-driven-development before implementation tasks. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把上游 v6.0.0 中与 harness 无关的核心技能改进忠实同步进本 OpenCode fork，同时完整保留 fork 的三项专属改造（primary-agent bootstrap、goal-driven-development、grill-me）。

**Architecture:** 以上游 `v6.0.0` tag 为同步源（已 fetch 到本地）。每个任务用 `git show v6.0.0:<path>` 取上游原文，套用 fork 的 OpenCode 适配规则后落盘，再验证。不新增任何其它 harness（Kimi/Pi/Antigravity/Codex/Cursor/Gemini）的支持文件。

**Tech Stack:** Markdown 技能文档、Node.js（`server.cjs`/`helper.js`）、Bash（`start-server.sh`/`stop-server.sh`/`task-brief`/`review-package`）。

---

## Global Constraints

每个任务都隐含包含以下全局约束（从设计文档逐字带入）：

- **同步源唯一**：上游内容一律取自本地 `v6.0.0` tag（`git show v6.0.0:<path>`）。不从网络重新抓取。
- **OpenCode 适配词表**（套用到所有从上游同步的技能正文）：
  - `Task tool (general-purpose):` 或 `Subagent (general-purpose):` → `OpenCode subagent:`
  - `TodoWrite` / `Create todos` / 裸 `todos`（指工具时）→ `todowrite`
  - `test-driven-development` / "follow TDD" / "Subagents follow TDD" → `goal-driven-development` 及其语义（与 fork 现有 implementer-prompt 的 GDD 引用风格一致）
  - `CLAUDE.md` / "your instructions file"（指项目约定时）→ `AGENTS.md 或项目 OpenCode instructions`
- **跳过 using-superpowers**：不同步 `skills/using-superpowers/` 整个目录（含 `references/*-tools.md`）。任何上游新增的指向 `../using-superpowers/references/*` 的链接都必须改写为 OpenCode 适配文本或删除，绝不留下悬空链接。
- **保留 fork 三项改造**：primary-agent bootstrap、goal-driven-development 取代 TDD、grill-me 模式。同步上游改动时不得覆盖这三项。
- **不引入被跳过的文件**：同步后仓库不得出现 `.kimi-plugin/`、`.pi/`、`evals/`、`docs/porting-to-a-new-harness.md`、`docs/README.kimi.md`、`using-superpowers/`、`scripts/lint-shell.sh`、`.pre-commit-config.yaml` 等被跳过项。
- **start-server.sh 本地改造保留**：fork 已删除 `CODEX_CI` 自动前台分支，本次同步不得重新引入。
- **commit 粒度**：每个任务独立 commit，message 用祈使句，说明同步了哪部分上游改进。

---

## File Structure

| 文件 | 责任 | 任务 |
|------|------|------|
| `skills/subagent-driven-development/SKILL.md` | SDD 控制流（单 reviewer、文件交接、进度账本、模型选择） | T1 |
| `skills/subagent-driven-development/implementer-prompt.md` | implementer 派发模板（文件交接 + GDD） | T1 |
| `skills/subagent-driven-development/task-reviewer-prompt.md` | 新增：单 reviewer 双 verdict 模板 | T1 |
| `skills/subagent-driven-development/scripts/task-brief` | 新增：抽取单任务文本到文件 | T1 |
| `skills/subagent-driven-development/scripts/review-package` | 新增：生成 review diff 包文件 | T1 |
| `skills/subagent-driven-development/spec-reviewer-prompt.md` | 删除（合并进 task-reviewer） | T1 |
| `skills/subagent-driven-development/code-quality-reviewer-prompt.md` | 删除（合并进 task-reviewer） | T1 |
| `skills/writing-plans/SKILL.md` | 新增 Task Right-Sizing / Global Constraints / Interfaces 块 | T2 |
| `skills/brainstorming/SKILL.md` | 视觉伴侣 just-in-time + 保留 grill-me | T3 |
| `skills/brainstorming/visual-companion.md` | 密钥鉴权 / 重启续连 / 4h 超时（OpenCode 适配） | T4 |
| `skills/brainstorming/scripts/*` | 服务端安全硬化（保留 fork 的 CODEX_CI 删除） | T4 |
| `skills/writing-skills/SKILL.md` | 摘取 Match the Form / Micro-Test 两个新块 | T5 |
| `skills/using-git-worktrees/SKILL.md` | 弃用全局 worktree 路径 + 步骤重编号 | T6 |
| `skills/finishing-a-development-branch/SKILL.md` | forge-neutral + worktree 路径策略对齐 | T6 |
| 多个小技能文件 | 措辞同步 | T7 |

---

## Task 1: subagent-driven-development 重写（核心）

**Files:**
- Modify: `skills/subagent-driven-development/SKILL.md`
- Modify: `skills/subagent-driven-development/implementer-prompt.md`
- Create: `skills/subagent-driven-development/task-reviewer-prompt.md`
- Create: `skills/subagent-driven-development/scripts/task-brief`
- Create: `skills/subagent-driven-development/scripts/review-package`
- Delete: `skills/subagent-driven-development/spec-reviewer-prompt.md`
- Delete: `skills/subagent-driven-development/code-quality-reviewer-prompt.md`

**Interfaces:**
- Consumes: 无（同步源是 `v6.0.0` tag）
- Produces: `task-brief PLAN_FILE N [OUTFILE]` 脚本、`review-package BASE HEAD [OUTFILE]` 脚本；`task-reviewer-prompt.md` 模板。后续任务无依赖。

- [ ] **Step 1: Confirm goal and acceptance criteria**

Goal: SDD 技能采用上游单 reviewer + 文件交接 + 进度账本架构，所有 harness 词汇按 Global Constraints 适配为 OpenCode，TDD 引用改写为 goal-driven-development，fork 不丢失既有 GDD 纪律。
Acceptance evidence:
- `skills/subagent-driven-development/SKILL.md` 含 "Pre-Flight Plan Review"、"Model Selection"、"File Handoffs"、"Durable Progress" 四节
- 全文无 `Task tool`、`Subagent (general-purpose):`、`TodoWrite`、`test-driven-development`、`Subagents follow TDD` 残留
- `task-brief`、`review-package` 可执行且 `bash -n` 通过
- `spec-reviewer-prompt.md` 与 `code-quality-reviewer-prompt.md` 已删除

- [ ] **Step 2: 同步两个脚本**

上游脚本与 harness 无关，逐字采纳（内容见设计调研，已确认无 Claude/Codex 专有词）。执行：

```bash
cd /Users/suknna/code/superpowers-opencode
mkdir -p skills/subagent-driven-development/scripts
git show v6.0.0:skills/subagent-driven-development/scripts/task-brief \
  > skills/subagent-driven-development/scripts/task-brief
git show v6.0.0:skills/subagent-driven-development/scripts/review-package \
  > skills/subagent-driven-development/scripts/review-package
chmod +x skills/subagent-driven-development/scripts/task-brief \
         skills/subagent-driven-development/scripts/review-package
```

- [ ] **Step 3: 同步 SKILL.md，套用 OpenCode 适配**

取上游原文后套用 Global Constraints 词表。关键改写点（逐一确认）：

```bash
git show v6.0.0:skills/subagent-driven-development/SKILL.md \
  > skills/subagent-driven-development/SKILL.md
```

然后手工编辑套用以下精确替换（上游 → fork）：

1. 流程图与正文中 `create todos` → `create todowrite entries`；`Mark task complete in todo list and progress ledger` 保留（"todo list" 在此是叙述性短语，但把裸工具引用 `todos` 统一为 `todowrite`，与 fork 现有风格一致 §73§）。具体：`"Read plan, note context and global constraints, create todos"` → `"Read plan, note context and global constraints, create todowrite entries"`；example workflow 中 `[Create todos for all tasks]` → `[Create todowrite entries for all tasks]`。
2. "Advantages" 节 `- Subagents follow TDD naturally` → `- Subagents work goal-first and verify before completion`（与 fork 旧版 §54§ 一致）。
3. "Integration" 节 `**superpowers:test-driven-development** - Subagents follow TDD for each task` → `**superpowers:goal-driven-development** - Subagents define goals, implement minimally, and complete tests before reporting done`（与 fork 旧版 §54§ 一致）。
4. 全文无其它 `Task tool` / `Subagent (general-purpose):` 字样（上游 SDD SKILL.md 正文不含这些，确认即可）。
5. 保留上游所有新增章节原文：Narration、Continuous execution、Pre-Flight Plan Review、Model Selection、Handling Implementer Status、Handling Reviewer ⚠️ Items、Constructing Reviewer Prompts、File Handoffs、Durable Progress、Prompt Templates（指向 `implementer-prompt.md` + `task-reviewer-prompt.md` + `../requesting-code-review/code-reviewer.md`）。

- [ ] **Step 4: 同步 implementer-prompt.md，三方合并 GDD**

上游重写了 implementer-prompt（文件交接、model 必填、报告落文件、TDD Evidence）。fork 在此文件有 GDD 改造（§55§）。需要把上游的结构改进 + fork 的 GDD 纪律合并：

```bash
git show v6.0.0:skills/subagent-driven-development/implementer-prompt.md \
  > skills/subagent-driven-development/implementer-prompt.md
```

然后套用以下适配：

1. 模板首行 `Subagent (general-purpose):` → `OpenCode subagent:`（fork 统一词 §56§）。保留上游新增的 `model:` 必填行。
2. "Your Job" 编号列表：把上游的步骤与 fork 的 GDD 第一步合并为：
```
    Once you're clear on requirements:
    1. Before reading or editing implementation files, explicitly invoke/load `superpowers:goal-driven-development` and follow its checklist for this task. If your environment cannot load skills, say so in your report and list the `goal-driven-development` checklist items you followed.
    2. Implement exactly what the task specifies.
    3. Write or update tests before reporting DONE. Tests must cover the accepted behavior and must not preserve stale architecture or implementation details.
    4. Verify implementation works.
    5. Commit your work.
    6. Self-review (see below).
    7. Report back.
```
（即用 fork §55§ 的 GDD 步骤替换上游的 `2. Write tests (following TDD if task says to)` 版本，但保留上游在 "Your Job" 之后新增的 "run the focused test… full suite once before committing" 段落。）
3. Self-review "Completeness" 区保留 fork 的 `- Did I satisfy the superpowers:goal-driven-development completion checklist before reporting DONE?`（§55§），删除上游遗留的 `- Did I follow TDD if required?`。"Testing" 区把上游 `- Did I follow TDD if required?` 改为 fork 的 `- Do tests cover the goal, and did I avoid keeping old code only to satisfy stale tests?`，并保留上游新增的 `- Is the test output pristine (no stray warnings or noise)?`。
4. "Report Format" 区：保留上游的报告落文件结构（`Write your full report to [REPORT_FILE]` + 15 行回报契约）。把上游的 `**TDD Evidence** (if TDD was required for this task):` 改为 `**Goal Evidence** (acceptance evidence per goal-driven-development):`，下属两条 RED/GREEN 行改写为目标导向证据：
```
    - **Goal Evidence** (acceptance evidence per goal-driven-development):
      - The target behavior or structural outcome this task accepted
      - Command run and relevant passing output proving the goal is met
```
5. 保留上游新增的 "After Review Findings" 段落原文。

- [ ] **Step 5: 创建 task-reviewer-prompt.md，套用 OpenCode 适配**

```bash
git show v6.0.0:skills/subagent-driven-development/task-reviewer-prompt.md \
  > skills/subagent-driven-development/task-reviewer-prompt.md
```

适配：模板首行 `Subagent (general-purpose):` → `OpenCode subagent:`。其余原文保留（该模板无 TDD/CLAUDE/references 词汇，"The implementer already ran the tests and reported results with TDD evidence" 一句改为 "…reported results with goal evidence for exactly this code"）。

- [ ] **Step 6: 删除被合并的两个旧 reviewer 模板**

```bash
git rm skills/subagent-driven-development/spec-reviewer-prompt.md \
       skills/subagent-driven-development/code-quality-reviewer-prompt.md
```

- [ ] **Step 7: 验证**

```bash
cd /Users/suknna/code/superpowers-opencode
bash -n skills/subagent-driven-development/scripts/task-brief && echo "task-brief OK"
bash -n skills/subagent-driven-development/scripts/review-package && echo "review-package OK"
test -x skills/subagent-driven-development/scripts/task-brief && echo "task-brief executable"
test -x skills/subagent-driven-development/scripts/review-package && echo "review-package executable"
# 残留扫描（应无输出）
grep -rn "Task tool\|Subagent (general-purpose):\|TodoWrite\|test-driven-development\|Subagents follow TDD" \
  skills/subagent-driven-development/ || echo "CLEAN: no forbidden tokens"
test ! -f skills/subagent-driven-development/spec-reviewer-prompt.md && echo "spec-reviewer deleted"
test ! -f skills/subagent-driven-development/code-quality-reviewer-prompt.md && echo "code-quality-reviewer deleted"
```
Expected: 全部打印 OK / CLEAN / deleted，无 forbidden token。

- [ ] **Step 8: 功能性验证 task-brief/review-package**

用本仓库自身做冒烟测试：

```bash
cd /Users/suknna/code/superpowers-opencode
./skills/subagent-driven-development/scripts/task-brief \
  docs/superpowers/plans/2026-06-17-sync-upstream-v6.0.0.md 1 /tmp/sdd-smoke-brief.md
head -1 /tmp/sdd-smoke-brief.md   # 应是 "## Task 1: subagent-driven-development 重写（核心）"
./skills/subagent-driven-development/scripts/review-package HEAD~1 HEAD /tmp/sdd-smoke-review.diff
grep -q "# Review package:" /tmp/sdd-smoke-review.diff && echo "review-package output OK"
rm -f /tmp/sdd-smoke-brief.md /tmp/sdd-smoke-review.diff
```
Expected: task-brief 抽出 Task 1 标题行，review-package 生成含 "# Review package:" 的文件。

- [ ] **Step 9: Commit**

```bash
git add skills/subagent-driven-development/
git commit -m "sync(sdd): adopt v6.0.0 single-reviewer rewrite, adapt to OpenCode + GDD"
```

---

## Task 2: writing-plans 结构块

**Files:**
- Modify: `skills/writing-plans/SKILL.md`

**Interfaces:**
- Consumes: 无
- Produces: 无（纯文档增强）

- [ ] **Step 1: Confirm goal and acceptance criteria**

Goal: writing-plans 技能新增上游的 Task Right-Sizing 节、plan header 的 Global Constraints 块、task 模板的 Interfaces 块。
Acceptance evidence:
- SKILL.md 含 `## Task Right-Sizing`、`## Global Constraints`、`**Interfaces:**` 三处新内容
- 无 harness 专有词引入

- [ ] **Step 2: 应用三处新增**

fork 的 writing-plans 与上游 v5.1.0 基线一致（fork 未改过此文件），上游 diff（§42§）可直接套用。三处插入：

1. 在 `## Bite-Sized Task Granularity` 之前插入：
```markdown
## Task Right-Sizing

A task is the smallest unit that carries its own test cycle and is worth a
fresh reviewer's gate. When drawing task boundaries: fold setup,
configuration, scaffolding, and documentation steps into the task whose
deliverable needs them; split only where a reviewer could meaningfully
reject one task while approving its neighbor. Each task ends with an
independently testable deliverable.

```

2. 在 plan header 模板里 `**Tech Stack:**` 之后、`---` 之前插入：
```markdown

## Global Constraints

[The spec's project-wide requirements — version floors, dependency limits,
naming and copy rules, platform requirements — one line each, with exact
values copied verbatim from the spec. Every task's requirements implicitly
include this section.]
```

3. 在 Task 模板 `**Files:**` 块（`- Test: ...` 行）之后插入：
```markdown

**Interfaces:**
- Consumes: [what this task uses from earlier tasks — exact signatures]
- Produces: [what later tasks rely on — exact function names, parameter
  and return types. A task's implementer sees only their own task; this
  block is how they learn the names and types neighboring tasks use.]
```

注意：上游 diff 的 task 模板上下文用的是 `Step 1: Write the failing test`（TDD 风格）。fork 的 task 模板已是 goal 风格 `Step 1: Confirm goal and acceptance criteria`（§71§）。**只插入 Interfaces 块，不要把 fork 的 goal 风格步骤改回 TDD failing-test 风格。**

- [ ] **Step 3: 验证**

```bash
cd /Users/suknna/code/superpowers-opencode
grep -q "## Task Right-Sizing" skills/writing-plans/SKILL.md && echo "right-sizing OK"
grep -q "## Global Constraints" skills/writing-plans/SKILL.md && echo "global-constraints OK"
grep -q "^\*\*Interfaces:\*\*" skills/writing-plans/SKILL.md && echo "interfaces OK"
grep -n "Write the failing test" skills/writing-plans/SKILL.md && echo "WARN: TDD step leaked" || echo "goal-style preserved"
```
Expected: 前三行 OK，最后一行 "goal-style preserved"。

- [ ] **Step 4: Commit**

```bash
git add skills/writing-plans/SKILL.md
git commit -m "sync(writing-plans): add right-sizing, global constraints, interfaces blocks from v6.0.0"
```

---

## Task 3: brainstorming SKILL.md — just-in-time 视觉伴侣 + 保留 grill-me

**Files:**
- Modify: `skills/brainstorming/SKILL.md`

**Interfaces:**
- Consumes: 无
- Produces: 无

- [ ] **Step 1: Confirm goal and acceptance criteria**

Goal: 采纳上游"视觉伴侣 just-in-time 提供"语义，同时完整保留 fork 的 grill-me 模式（checklist、流程图节点、激活段落、`grill-me.md` 引用）。
Acceptance evidence:
- checklist 第 2 项为 just-in-time 版本
- 视觉伴侣"Offering"段为 just-in-time 措辞 + `--open` 说明
- grill-me 的所有钩子仍在：`grep -c "Grill Me" SKILL.md` ≥ 4，且 `grill-me.md` 引用仍在、流程图含 grill-me 节点

- [ ] **Step 2: 三方合并（手工，逐块）**

这是三方合并：fork 新增了 grill-me，上游删了 grill-me 钩子并改了视觉伴侣。**只取上游的视觉伴侣 just-in-time 改动，拒绝上游对 grill-me 的删除。** 上游 diff 见 §20§。

只应用上游 diff 中以下 hunk（视觉伴侣相关），且需手工拣选避免触及 grill-me：

1. checklist 第 2 项（§20§ 第一个 hunk 的第 2 行）：
   - 现状（fork）：`2. **Offer visual companion** (if topic will involve visual questions) — this is its own message, not combined with a clarifying question. See the Visual Companion section below.`
   - 改为（上游）：`2. **Offer the visual companion just-in-time** — NOT upfront. The first time a question would genuinely be clearer shown than described, offer it then (its own message); on approval its browser tab opens for you. If no visual question ever arises, never offer it. See the Visual Companion section below.`
   - **不要**把 checklist 第 3 项 `Ask clarifying or probing questions` 改成上游的 `Ask clarifying questions` —— 保留 "or probing" 因为 grill-me 用到。

2. **拒绝**上游对流程图的改动（§20§ 删除 `Visual questions ahead?` / `Starting plan provided?` / `Load Grill Me support doc` 节点的 hunk）。fork 流程图保留这些 grill-me 节点不动。

3. **拒绝**上游删除 "Understanding the idea" 中 grill-me 激活段落（§20§ 删 4 行 `If the user already has a concrete plan…` 等）与 "Exploring approaches" 中两行 grill-me baseline 段。fork 全部保留。

4. 视觉伴侣 "Offering the companion" 段（§20§ 最后两个 hunk）采纳上游措辞：
   - `**Offering the companion:**` 段改为：
```markdown
**Offering the companion (just-in-time):** Do NOT offer it upfront. Wait until a question would genuinely be clearer shown than told — a real mockup / layout / diagram question, not merely a UI *topic*. The first time that happens, offer it then, as its own message:
> "This next part might be easier if I show you — I can put together mockups, diagrams, and comparisons in a browser tab as we go. It's still new and can be token-intensive. Want me to? I'll open it for you."
```
   - 下一段改为：
```markdown
**This offer MUST be its own message.** Only the offer — no clarifying question, summary, or other content. Wait for the user's response. If they accept, start the server with `--open` so their browser opens to the first screen automatically. If they decline, continue text-only and don't offer again unless they raise it.
```

- [ ] **Step 3: 验证**

```bash
cd /Users/suknna/code/superpowers-opencode
grep -q "Offer the visual companion just-in-time" skills/brainstorming/SKILL.md && echo "JIT checklist OK"
grep -q "Offering the companion (just-in-time)" skills/brainstorming/SKILL.md && echo "JIT offer OK"
grep -q "start the server with \`--open\`" skills/brainstorming/SKILL.md && echo "--open OK"
# grill-me 保留检查
test "$(grep -c 'Grill Me' skills/brainstorming/SKILL.md)" -ge 4 && echo "grill-me hooks preserved"
grep -q "grill-me.md" skills/brainstorming/SKILL.md && echo "grill-me.md ref preserved"
grep -q "Load Grill Me support doc" skills/brainstorming/SKILL.md && echo "grill-me flowchart node preserved"
grep -q "Ask clarifying or probing questions" skills/brainstorming/SKILL.md && echo "probing preserved"
```
Expected: 全部 OK / preserved。

- [ ] **Step 4: Commit**

```bash
git add skills/brainstorming/SKILL.md
git commit -m "sync(brainstorming): adopt just-in-time visual companion, preserve grill-me"
```

---

## Task 4: visual-companion.md + 服务端脚本安全硬化

**Files:**
- Modify: `skills/brainstorming/visual-companion.md`
- Modify: `skills/brainstorming/scripts/server.cjs`
- Modify: `skills/brainstorming/scripts/helper.js`
- Modify: `skills/brainstorming/scripts/frame-template.html`
- Modify: `skills/brainstorming/scripts/start-server.sh`
- Modify: `skills/brainstorming/scripts/stop-server.sh`

**Interfaces:**
- Consumes: 无
- Produces: 服务端密钥鉴权（URL 携带 `?key=`）、`--open` 选项、4h 空闲超时、同端口重启续连。brainstorming SKILL.md / visual-companion.md 引用这些行为。

- [ ] **Step 1: Confirm goal and acceptance criteria**

Goal: 采纳上游视觉伴侣的安全硬化（每会话密钥、文件沙箱、`--open`、4h 超时、重启续连、stop-server 进程归属确认），脚本整体取上游版本，但**保留 fork 对 start-server.sh 删除 CODEX_CI 自动前台的本地改造**。
Acceptance evidence:
- `node -c server.cjs`、`node -c helper.js` 通过；`bash -n start-server.sh`、`bash -n stop-server.sh` 通过
- `start-server.sh` 不含 `CODEX_CI`
- `server.cjs` 含密钥鉴权逻辑（`key` 相关）
- visual-companion.md 平台启动段为 OpenCode 单段（不含 Claude/Codex/Gemini/Copilot 分节），且含密钥 URL 说明与 4h 超时

- [ ] **Step 2: 确认 fork 对脚本的本地改动范围**

fork 自 v5.1.0 起只改过 `start-server.sh`（删 CODEX_CI，§66§）与 `visual-companion.md`（OpenCode 适配，§63§）。`server.cjs`/`helper.js`/`frame-template.html`/`stop-server.sh` 与 v5.1.0 一致，无本地改动 → 可整取上游。

```bash
cd /Users/suknna/code/superpowers-opencode
for f in server.cjs helper.js frame-template.html stop-server.sh; do
  if git diff --quiet v5.1.0 -- skills/brainstorming/scripts/$f; then
    echo "$f: no local change, safe to take upstream wholesale"
  else
    echo "$f: HAS local change — manual merge required"
  fi
done
```
Expected: 四个文件都打印 "no local change"。若有 "HAS local change"，停下改为手工合并该文件。

- [ ] **Step 3: 整取四个无本地改动的脚本**

```bash
cd /Users/suknna/code/superpowers-opencode
git show v6.0.0:skills/brainstorming/scripts/server.cjs > skills/brainstorming/scripts/server.cjs
git show v6.0.0:skills/brainstorming/scripts/helper.js > skills/brainstorming/scripts/helper.js
git show v6.0.0:skills/brainstorming/scripts/frame-template.html > skills/brainstorming/scripts/frame-template.html
git show v6.0.0:skills/brainstorming/scripts/stop-server.sh > skills/brainstorming/scripts/stop-server.sh
```

- [ ] **Step 4: start-server.sh 三方合并（保留 CODEX_CI 删除）**

start-server.sh 同时有上游硬化（`--open`、4h 超时、密钥）与 fork 的本地改造（删 CODEX_CI，§66§/§70§）。先取上游版本，再重新套用 fork 的本地删除：

```bash
git show v6.0.0:skills/brainstorming/scripts/start-server.sh > skills/brainstorming/scripts/start-server.sh
```

然后手工删除上游版本中的 CODEX_CI 自动前台块（§70§ 第 98 行附近）：
```bash
# 删除这段（上游有，fork 不要）：
# # Some environments reap detached/background processes. Auto-foreground when detected.
# if [[ -n "${CODEX_CI:-}" && "$FOREGROUND" != "true" && "$FORCE_BACKGROUND" != "true" ]]; then
#   FOREGROUND="true"
# fi
```
并把注释行 `#   --background          Force background mode (overrides Codex auto-foreground).` 改回 fork 的 `#   --background          Force background mode.`（§66§）。

- [ ] **Step 5: visual-companion.md 三方合并**

fork 已把平台启动段改写为 OpenCode 单段（§63§），上游则新增了密钥 URL 说明、4h 超时、重启续连、`--open`、并把 "Write tool" 改为通用措辞，但上游仍是多 harness 分节（Claude/Codex/Gemini/Copilot，§48§）。

合并策略：**以 fork 的 OpenCode 单段结构为骨架，注入上游与 harness 无关的语义改进**：

1. "Starting a Session" 代码块注释采纳上游 `--open` 说明与密钥 URL 返回示例（§48§）：
   - 启动命令示例加 `--open`
   - 返回 JSON 的 `url` 改为含 `?key=ab12…` 形式
2. 紧随其后的说明段采纳上游密钥说明整段：
```markdown
**The URL contains a session key (`?key=…`).** The server rejects any request
without it, so always give the user the **complete** URL from the `url` field —
never strip the query string, and never hand out a bare `http://host:port`. The
key gates HTTP and WebSocket access so a stray browser tab or another machine on
the network can't read the screens or inject events. After the first load the
browser remembers the key via a cookie, so reloads and `/files/*` assets work
without repeating it.
```
3. "Launching the server in OpenCode" 段保留 fork 的 OpenCode 单段（§63§），但启动命令加 `--open`，并在段尾说明 headless/remote 下用 `url` 字段作 fallback。**不要**引入上游的 Claude/Codex/Gemini/Copilot 分节。
4. "The Loop" 第 1 步采纳上游的"先确认服务存活 + 同 `--project-dir` 重启同端口续连 + 4h 超时"措辞（§48§），但把 "Use your file-creation tool" 落地为 fork 的 "Use OpenCode's file editing tools"（§63§ 现状）。把 "30 minutes" 改为 "4 hours idle (configurable with `--idle-timeout-minutes`)"。
5. frame-template 相关：把正文里 "selection indicator" → "connection status"（§48§ 两处）。
6. Multi-select 段采纳上游措辞（§48§ 末 hunk）。

- [ ] **Step 6: 验证**

```bash
cd /Users/suknna/code/superpowers-opencode
node -c skills/brainstorming/scripts/server.cjs && echo "server.cjs OK"
node -c skills/brainstorming/scripts/helper.js && echo "helper.js OK"
bash -n skills/brainstorming/scripts/start-server.sh && echo "start-server OK"
bash -n skills/brainstorming/scripts/stop-server.sh && echo "stop-server OK"
# CODEX_CI 必须不存在
grep -q "CODEX_CI" skills/brainstorming/scripts/start-server.sh && echo "FAIL: CODEX_CI leaked" || echo "CODEX_CI absent OK"
# 密钥鉴权存在
grep -qi "key" skills/brainstorming/scripts/server.cjs && echo "server key logic present"
# visual-companion 无多 harness 分节
grep -q "^\*\*Codex:\*\*\|^\*\*Gemini CLI:\*\*\|^\*\*Copilot CLI:\*\*" skills/brainstorming/visual-companion.md && echo "FAIL: multi-harness sections leaked" || echo "OpenCode single-section OK"
grep -q "4 hours idle" skills/brainstorming/visual-companion.md && echo "4h timeout doc OK"
grep -q "session key" skills/brainstorming/visual-companion.md && echo "key URL doc OK"
```
Expected: 全部 OK，无 FAIL。

- [ ] **Step 7: 运行 brainstorm-server 测试中可在本机跑的部分**

```bash
cd /Users/suknna/code/superpowers-opencode/tests/brainstorm-server
ls *.test.js *.test.sh 2>/dev/null
# 若有 package.json 且本机有 node test runner，跑 JS 测试：
node --test 2>&1 | tail -20 || echo "node --test 不可用或测试需调整，记录实际结果"
```
Expected: 记录实际通过/失败情况。若上游测试依赖被跳过的文件或 harness，记录为已知差异，不强行通过。

- [ ] **Step 8: Commit**

```bash
git add skills/brainstorming/
git commit -m "sync(visual-companion): adopt v6.0.0 session-key auth + restart resilience, keep OpenCode adaptation"
```

---

## Task 5: writing-skills — 摘取两个新内容块

**Files:**
- Modify: `skills/writing-skills/SKILL.md`

**Interfaces:**
- Consumes: 无
- Produces: 无

- [ ] **Step 1: Confirm goal and acceptance criteria**

Goal: 把上游 writing-skills 中**真正新增**的两块内容（"Match the Form to the Failure" 表、"Micro-Test Wording Before Full Scenarios"）摘取进 fork 已大幅适配的 writing-skills，并补充 checklist 两条新项。**不**回退 fork 已做的 TDD→baseline-driven、CSO→SDO、删除 anthropic-best-practices 引用等适配（§61§）。
Acceptance evidence:
- SKILL.md 含 `## Match the Form to the Failure` 表
- SKILL.md 含 `### Micro-Test Wording Before Full Scenarios`
- 不含 `anthropic-best-practices`、不含 `Claude Search Optimization`、不含 `TDD Mapping`（fork 已删/改，确认未被回退）
- 不含指向 `using-superpowers/references/*` 的链接

- [ ] **Step 2: 插入 "Match the Form to the Failure" 块**

在 `## Bulletproofing Skills Against Rationalization` 之前插入（上游原文，§49§，无 harness 词需适配）：
```markdown
## Match the Form to the Failure

Before writing guidance, classify the baseline failure. The form that bulletproofs one failure type measurably backfires on another.

| Baseline failure | Right form | Wrong form |
|---|---|---|
| Skips/violates a rule under pressure (knows better, does it anyway) | Prohibition + rationalization table + red flags (see Bulletproofing below) | Soft guidance ("prefer...", "consider...") |
| Complies, but output has the wrong shape (bloated prompt, buried verdict, restated spec) | Positive recipe or contract: state what the output IS — its parts, in order | Prohibition list ("don't restate", "never narrate") |
| Omits a required element from something they already produce | Structural: REQUIRED field or slot in the template they fill in | Prose reminders near the template |
| Behavior should depend on a condition | Conditional keyed to an observable predicate ("if the brief exists, reference it") | Unconditional rule + exemption clauses |

**Why prohibitions backfire on shaping problems:** under a competing incentive ("make the prompt self-contained"), agents negotiate with "don't X". In head-to-head wording tests on dispatch-prompt guidance, the prohibition arm produced clearly more of the unwanted content than the recipe arm (fully separated distributions), and trended worse than even the no-guidance control — micro-test your own case rather than assuming, but never reach for the prohibition by default. A recipe leaves nothing to negotiate: the output matches the stated shape or it doesn't.

**Rules for whichever form you pick:**
- **No nuance clauses.** "Don't X unless it matters" reopens the negotiation — appending a single nuance clause to a winning recipe degraded it from consistent to noisy in the same wording tests. Express a real exception as its own conditional on an observable predicate.
- **Exemption clauses don't scope.** "This limit doesn't apply to code blocks" still suppresses code blocks. If part of the output must be exempt, restructure so the rule can't reach it.

```

- [ ] **Step 3: 在 Bulletproofing 开头插入 scope 提示**

`## Bulletproofing Skills Against Rationalization` 标题下、"Skills that enforce discipline…" 段之后插入上游新增的 Scope 行（§49§）：
```markdown
**Scope:** this toolkit is for discipline failures — an agent that knows the rule and skips it under pressure. For wrong-shaped output or omitted elements, prohibition-based bulletproofing backfires; use the forms in Match the Form to the Failure instead.
```

- [ ] **Step 4: 插入 "Micro-Test Wording" 块**

在 fork 现有的 "Testing methodology" 引用之前插入上游新增块（§49§）。注意上游该处把 `@testing-skills-with-subagents.md` 改为 `[testing-skills-with-subagents.md](testing-skills-with-subagents.md)` —— 确认 fork 是否有该文件，若有则采纳链接写法，若无则用纯文本提及不留悬空链接：
```markdown
### Micro-Test Wording Before Full Scenarios

Full pressure-scenario runs are the final gate, but they are slow and expensive per iteration. Verify the wording itself first with micro-tests:

1. **One fresh-context sample per call** — a raw API call, or a single-shot subagent if you don't have API access. System prompt = the realistic context the guidance will live in (the full skill or prompt template, not the guidance in isolation); user message = a task that tempts the failure.
2. **Always include a no-guidance control.** If the control doesn't exhibit the failure, there is nothing to fix — stop, don't author the guidance.
3. **5+ reps per variant.** Single samples lie.
4. **Manually read every flagged match.** Score programmatically if you like, but template echoes and quoted counter-examples masquerade as hits; automated counts alone overstate both failure and success.
5. **Variance is a metric.** When guidance lands, reps converge on the same shape. Five different interpretations across five reps means the wording isn't binding — tighten the form before adding words.

Micro-tests verify wording; they do not replace pressure scenarios for discipline skills.
```

- [ ] **Step 5: 补 checklist 两条新项**

在 fork 的 "Skill Creation Checklist" 的 GREEN 阶段（`Address specific baseline failures` 附近）补上上游新增两条（§49§）：
```markdown
- [ ] Guidance form matches the failure type (see Match the Form to the Failure)
- [ ] For behavior-shaping guidance: wording micro-tested against a no-guidance control (5+ reps, every flagged match read manually) — N/A for pure reference skills
```

- [ ] **Step 6: 检查 testing-skills-with-subagents.md 链接目标**

```bash
cd /Users/suknna/code/superpowers-opencode
test -f skills/writing-skills/testing-skills-with-subagents.md \
  && echo "target exists, use markdown link" \
  || echo "target missing, use plain reference (no link)"
```
据结果调整 Step 4 中的链接写法，确保不留悬空链接。

- [ ] **Step 7: 验证**

```bash
cd /Users/suknna/code/superpowers-opencode
grep -q "## Match the Form to the Failure" skills/writing-skills/SKILL.md && echo "match-form OK"
grep -q "### Micro-Test Wording Before Full Scenarios" skills/writing-skills/SKILL.md && echo "micro-test OK"
grep -q "Guidance form matches the failure type" skills/writing-skills/SKILL.md && echo "checklist OK"
# fork 适配未被回退
grep -q "anthropic-best-practices" skills/writing-skills/SKILL.md && echo "FAIL: anthropic ref leaked" || echo "no anthropic ref OK"
grep -q "Claude Search Optimization" skills/writing-skills/SKILL.md && echo "FAIL: CSO leaked" || echo "SDO preserved OK"
grep -q "using-superpowers/references" skills/writing-skills/SKILL.md && echo "FAIL: dangling ref" || echo "no dangling ref OK"
```
Expected: 前三行 OK，后三行无 FAIL。

- [ ] **Step 8: Commit**

```bash
git add skills/writing-skills/SKILL.md
git commit -m "sync(writing-skills): add Match-the-Form table and Micro-Test Wording from v6.0.0"
```

---

## Task 6: worktree 路径策略（using-git-worktrees + finishing-a-development-branch）

**Files:**
- Modify: `skills/using-git-worktrees/SKILL.md`
- Modify: `skills/finishing-a-development-branch/SKILL.md`

**Interfaces:**
- Consumes: 无
- Produces: 两文件共享的 worktree 路径策略（弃用 `~/.config/superpowers/worktrees/`，只认 `.worktrees/` 或 `worktrees/`）。必须一致。

- [ ] **Step 1: Confirm goal and acceptance criteria**

Goal: 同步上游弃用全局 worktree 目录的改动 —— `using-git-worktrees` 删除全局路径检测并把步骤从 Step 0/1/3/4 重编号为 0/1/2/3；`finishing-a-development-branch` 同步路径判定并采纳 forge-neutral（删除硬编码 `gh pr create`）。
Acceptance evidence:
- 两文件均无 `~/.config/superpowers/worktrees/`
- `using-git-worktrees` 的 "Project Setup" 为 Step 2、"Verify Clean Baseline" 为 Step 3
- `finishing-a-development-branch` 无 `gh pr create` 硬编码块

- [ ] **Step 2: using-git-worktrees 应用上游 diff**

fork 此文件与 v5.1.0 基线一致（§71§ 显示 fork 仍是旧的 Step 3/4 与全局路径），上游 diff（§42§）可直接套用。逐 hunk 应用：
- 三处 `Skip to Step 3` → `Skip to Step 2`
- 删除 "3. Check for an existing global directory" 整块，把后续 "4. If there is no other guidance" 改为 "3."
- 删除 "Global directories (...) need no verification." 行
- "Create the Worktree" 代码块按上游简化为 `path="$LOCATION/$BRANCH_NAME"`
- `## Step 3: Project Setup` → `## Step 2: Project Setup`；`## Step 4: Verify Clean Baseline` → `## Step 3: Verify Clean Baseline`
- 表格删除 `| Global path exists | Use it (backward compat) |` 行
- 两处 priority 描述 `existing > global legacy > instruction file > default` → `explicit instructions > existing project-local directory > default`
- "Assuming directory location" Fix 行同步更新

- [ ] **Step 3: finishing-a-development-branch 应用上游 diff**

上游 diff（§42§）：
- 删除 PR 创建块（`# Create PR` 到 `gh pr create ... EOF )"` 整段），只保留 `git push -u origin <feature-branch>`
- 两处 `.worktrees/`, `worktrees/`, or `~/.config/superpowers/worktrees/` → `.worktrees/` or `worktrees/`

- [ ] **Step 4: 验证**

```bash
cd /Users/suknna/code/superpowers-opencode
grep -rn "config/superpowers/worktrees" skills/using-git-worktrees/SKILL.md skills/finishing-a-development-branch/SKILL.md \
  && echo "FAIL: global path leaked" || echo "global path removed OK"
grep -q "## Step 2: Project Setup" skills/using-git-worktrees/SKILL.md && echo "step2 OK"
grep -q "## Step 3: Verify Clean Baseline" skills/using-git-worktrees/SKILL.md && echo "step3 OK"
grep -q "gh pr create" skills/finishing-a-development-branch/SKILL.md && echo "FAIL: gh pr create leaked" || echo "forge-neutral OK"
```
Expected: 无 FAIL，step2/step3 OK。

- [ ] **Step 5: Commit**

```bash
git add skills/using-git-worktrees/SKILL.md skills/finishing-a-development-branch/SKILL.md
git commit -m "sync(worktrees): drop legacy global worktree dir, forge-neutral finishing from v6.0.0"
```

---

## Task 7: 小幅措辞同步

**Files:**
- Modify: `skills/systematic-debugging/SKILL.md`
- Modify: `skills/requesting-code-review/code-reviewer.md`
- Modify: `skills/receiving-code-review/SKILL.md`
- Modify: `skills/executing-plans/SKILL.md`
- Modify: `skills/dispatching-parallel-agents/SKILL.md`
- Modify: `skills/writing-skills/persuasion-principles.md`

**Interfaces:**
- Consumes: 无
- Produces: 无

- [ ] **Step 1: Confirm goal and acceptance criteria**

Goal: 同步上游一批小幅措辞改进，全部按 OpenCode 适配词表处理。
Acceptance evidence: 见各 Step 的精确改动 + Step 8 残留扫描。

- [ ] **Step 2: systematic-debugging — 修 extended-thinking bug**

§45§：`- "Ultrathink this" - Question fundamentals, not just symptoms` → `- "Ultra-think this" - Question fundamentals, not just symptoms`（连字符断词，避免触发关键词）。

- [ ] **Step 3: requesting-code-review/code-reviewer.md — read-only + 占位符**

fork 此文件首行已是 `OpenCode subagent:`（§56§），**不要**改回 `Subagent`。只采纳上游两处与 harness 无关的改进（§45§）：
1. 占位符风格 `{DESCRIPTION}`/`{PLAN_OR_REQUIREMENTS}`/`{BASE_SHA}`/`{HEAD_SHA}` → `[DESCRIPTION]` 等方括号风格（正文与底部 Placeholders 段一致替换）。
2. 在 "Git Range to Review" 之后插入上游新增的 "Read-Only Review" 段：
```markdown
    ## Read-Only Review

    Your review is read-only on this checkout. Do not mutate the working tree, the index, HEAD, or branch state in any way. Use tools like `git show`, `git diff`, and `git log` to inspect history. If you need a working copy of a different revision, check it out into a separate temporary directory (e.g. `git worktree add /tmp/review-[SHA] [SHA]`) — never move HEAD on this checkout.
```

- [ ] **Step 4: receiving-code-review — 两处措辞**

fork 现状（§59§）：第 30 行已是 `(explicit instruction violation)`，但上游用 `(explicit instruction-file violation)`。第 129 行仍是 Circle K 旧措辞。改：
1. 第 30 行 `(explicit instruction violation)` → `(explicit instruction-file violation)`（与上游一致）。
2. Circle K 行（§45§）：`**Signal if uncomfortable pushing back out loud:** "Strange things are afoot at the Circle K"` → `**If you're uncomfortable pushing back out loud:** Name that tension, then tell your partner about the issue you've seen. They'll appreciate your honesty.`

- [ ] **Step 5: executing-plans — todowrite + subagent 措辞**

§46§ + fork 现状（§67§ 已是 `Create todowrite entries and proceed`）。只改一处：上游把 "Note" 段的平台举例扩展并指向 `using-superpowers/references/`。**fork 跳过 references**，故改为 OpenCode 适配的中性措辞：
```markdown
**Note:** Tell your human partner that Superpowers works much better with access to subagents. The quality of its work will be significantly higher on a platform with subagent support. If subagents are available, use superpowers:subagent-driven-development instead of this skill.
```
（即采纳上游"扩展说明"的意图，但删去指向 references 的悬空链接与具体 harness 清单。）

- [ ] **Step 6: dispatching-parallel-agents — 并行派发措辞**

fork 此文件已用 `Dispatch three OpenCode subagents in parallel:`（§56§/§59§）。上游 diff（§45§）把 Claude `Task(...)` 示例改为 harness 中性的 `Subagent (general-purpose): "..."` 块并加一句 "Multiple dispatch calls in one response = parallel execution."。采纳该语义但用 fork 的 OpenCode 词：
1. 确认 "Dispatch in Parallel" 代码块为 OpenCode 措辞（若 fork 已是 OpenCode subagent 形式则保留）。
2. 在该代码块后补一行（若尚无）：`Multiple dispatch calls in one response = parallel execution. One per response = sequential.`

先读现状再决定是否需要补这一行：
```bash
grep -n "in one response = parallel\|run concurrently" skills/dispatching-parallel-agents/SKILL.md
```

- [ ] **Step 7: persuasion-principles.md — TodoWrite → todos**

§67§ 上游 diff：`Use tracking: TodoWrite for checklists` → `Use tracking: todos for checklists`；示例两行 `TodoWrite` → `todo tracking` / `a todo list`。按 fork 词表统一为 `todowrite`：
- `Use tracking: todowrite for checklists`
- `✅ Checklists without todowrite tracking = steps get skipped. Every time.`
- `❌ Some people find todowrite helpful for checklists.`

- [ ] **Step 8: 验证（全仓残留扫描）**

```bash
cd /Users/suknna/code/superpowers-opencode
grep -q 'Ultra-think this' skills/systematic-debugging/SKILL.md && echo "ultrathink fix OK"
grep -q "## Read-Only Review" skills/requesting-code-review/code-reviewer.md && echo "read-only OK"
grep -q "Circle K" skills/receiving-code-review/SKILL.md && echo "FAIL: Circle K leaked" || echo "circle-k removed OK"
grep -q "using-superpowers/references" skills/executing-plans/SKILL.md && echo "FAIL: dangling ref" || echo "no dangling ref OK"
# 全仓最终残留扫描（技能正文不应有这些；tests/ 历史样本除外）
grep -rn "Task tool (general-purpose)\|Subagent (general-purpose):\|TodoWrite" skills/ && echo "FAIL: tokens leaked" || echo "CLEAN tokens"
grep -rln "test-driven-development\|follow TDD" skills/ | grep -v "tests/" || echo "CLEAN: no TDD refs in skills"
```
Expected: 无 FAIL，CLEAN。

- [ ] **Step 9: Commit**

```bash
git add skills/systematic-debugging/SKILL.md skills/requesting-code-review/code-reviewer.md \
  skills/receiving-code-review/SKILL.md skills/executing-plans/SKILL.md \
  skills/dispatching-parallel-agents/SKILL.md skills/writing-skills/persuasion-principles.md
git commit -m "sync(skills): minor prose updates from v6.0.0 (ultrathink, read-only review, todowrite)"
```

---

## 最终验证（全部任务完成后）

- [ ] **Step 1: 确认未引入被跳过的文件**

```bash
cd /Users/suknna/code/superpowers-opencode
for p in .kimi-plugin .pi evals docs/porting-to-a-new-harness.md docs/README.kimi.md \
         skills/using-superpowers scripts/lint-shell.sh .pre-commit-config.yaml; do
  test -e "$p" && echo "FAIL: skipped artifact present: $p" || echo "absent OK: $p"
done
```
Expected: 全部 "absent OK"。

- [ ] **Step 2: 全仓 TDD/harness 残留终扫**

```bash
cd /Users/suknna/code/superpowers-opencode
echo "=== skills 正文 TDD 残留（应只剩 tests/ 历史样本，skills/ 内应为空）==="
grep -rln "test-driven-development\|follow TDD\|Subagents follow TDD" skills/ || echo "CLEAN"
echo "=== harness 派发词残留 ==="
grep -rn "Task tool (general-purpose)\|Subagent (general-purpose):" skills/ || echo "CLEAN"
echo "=== 悬空 references 链接 ==="
grep -rn "using-superpowers/references" skills/ || echo "CLEAN"
```
Expected: 全部 CLEAN。

- [ ] **Step 3: git 改动集合复核**

```bash
cd /Users/suknna/code/superpowers-opencode
git log --oneline v5.1.0..HEAD | head -20
git diff --stat v5.1.0..HEAD -- skills/ | tail -5
# 确认改动只落在采纳范围的 skills 子目录
git diff --name-only v5.1.0..HEAD | grep -v "^docs/superpowers/" | sort
```
Expected: 改动文件全部落在"采纳"范围（skills/subagent-driven-development、writing-plans、brainstorming、writing-skills、using-git-worktrees、finishing-a-development-branch、systematic-debugging、requesting-code-review、receiving-code-review、executing-plans、dispatching-parallel-agents）+ docs/superpowers 计划与设计文档。无 using-superpowers / kimi / pi / evals。

- [ ] **Step 4: 跑可在本机运行的 fork 测试**

```bash
cd /Users/suknna/code/superpowers-opencode
ls tests/opencode/ tests/brainstorm-server/ 2>/dev/null
# 按各测试目录的运行方式执行本机可跑部分，记录实际输出（通过/失败/跳过原因）
```
Expected: 记录实际结果。被跳过 harness 相关的测试失败属已知差异，需显式标注，不强行使其通过。

---

## 交付物

- **修改内容**：上述 7 个任务范围内的技能与脚本同步 + 决策 1/2 的本地三方合并
- **修改原因**：吸收上游 v6.0.0 与 harness 无关的核心技能质量改进，保持 fork 的 OpenCode 专属路线与三项改造
- **验证方法**：见各任务 Step 验证 + 最终验证四步
- **官方文档引用**：同步源 https://github.com/obra/superpowers/releases/tag/v6.0.0（本地 `v6.0.0` tag）；不涉及第三方 SDK，无需 ctx7
