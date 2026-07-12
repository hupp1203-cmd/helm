# Helm 手动走查 (PR27)

## 跑命令

```bash
cd ~/projects-ai/helm/helm-dev
pnpm install && pnpm build
pnpm test                       # 全部测试
pnpm typecheck                  # 类型检查
pnpm repl                       # 启动 REPL
```

## 场景 1：README — 查看项目概览

```bash
cat README.md
```

**预期内容**：

- 项目名称和简介
- 16 个特性列表（带 emoji）
- Quick Start 命令
- 项目结构树
- Usage 代码示例
- 文档和示例链接

## 场景 2：Examples — 运行示例代码

**基础示例**：

```bash
npx tsx examples/basic/hello.ts
```

**预期输出**：

```
Agent: Hello! I am Helm, your AI agent harness.
Journal: /tmp/helm-xxx/run.jsonl
```

**工具示例**：

```bash
npx tsx examples/basic/tools.ts
```

**预期输出**：

```
Agent: The result of 2 + 3 * 4 is 14.
Tool calls: [ 'calculate' ]
```

**Checkpoint 示例**：

```bash
npx tsx examples/advanced/checkpoint.ts
```

**预期输出**：

```
Initial content: const x = 1;
Modified content: const x = 2;
Created checkpoint: cp-001
Created checkpoint: cp-002

Checkpoints:
  cp-001 [file_edit] initial version
  cp-002 [file_edit] updated x to 2

Restored to cp-001
Restored content: const x = 1;
```

## 场景 3：Docs — 浏览文档

```bash
ls docs/
```

**预期输出**：

```
api.md          architecture.md  checkpoint.md  hooks.md
memory.md       providers.md     telemetry.md   tools.md
```

**查看架构文档**：

```bash
cat docs/architecture.md
```

**预期内容**：

- 系统概览 ASCII 图
- 数据流说明
- 包依赖关系
- 关键抽象（Provider, Tool, Journal, RunEvent）

## 场景 4：Package info — 查看 package.json

```bash
cat package.json | head -20
```

**预期内容**：

- `name: "helm"`
- `version: "0.1.0"`（如果有）
- `license: "MIT"`
- `repository` 指向 GitHub
- `keywords` 包含 ai, agent, harness

## 场景 5：CHANGELOG — 查看变更日志

```bash
cat CHANGELOG.md
```

**预期内容**：

- 版本 0.1.0，日期 2026-07-12
- 所有 PR00-PR27 按类别列出
- Core Infrastructure、Runtime、Extensions、CLI、Operations、Polish 分类

## 场景 6：LICENSE — 查看许可证

```bash
cat LICENSE
```

**预期内容**：

- MIT License
- Copyright 2026 Helm Contributors

## 场景 7：最终验证 — 运行全量检查

```bash
# 全量检查
pnpm install
pnpm typecheck
pnpm test
pnpm build
```

**预期输出**：

```
packages/core typecheck: Done
packages/runtime typecheck: Done
packages/cli typecheck: Done
packages/checkpoint typecheck: Done
packages/memory typecheck: Done
...
All packages typecheck: Done

packages/runtime test: Tests  XX passed
packages/cli test: Tests  XX passed
packages/checkpoint test: Tests  64 passed
packages/memory test: Tests  70 passed
...
All tests passed

packages/core build: Done
packages/runtime build: Done
packages/cli build: Done
...
All packages build: Done
```

## 文档目录

| 文件 | 内容 |
|------|------|
| `docs/architecture.md` | 系统架构、数据流、包依赖 |
| `docs/api.md` | 公共 API 参考 |
| `docs/providers.md` | Provider 开发指南 |
| `docs/tools.md` | Tool 开发指南 |
| `docs/hooks.md` | Hook 系统指南 |
| `docs/memory.md` | Memory 系统指南 |
| `docs/checkpoint.md` | Checkpoint 系统指南 |
| `docs/telemetry.md` | Telemetry 系统指南 |

## 示例目录

| 文件 | 内容 |
|------|------|
| `examples/basic/hello.ts` | 最简单的 agent 示例 |
| `examples/basic/tools.ts` | 自定义工具注册 |
| `examples/basic/provider.ts` | 自定义 Provider |
| `examples/advanced/hooks.ts` | 生命周期 hooks |
| `examples/advanced/memory.ts` | 跨 session 记忆 |
| `examples/advanced/checkpoint.ts` | checkpoint/rewind |
| `examples/advanced/eval.ts` | 评估套件 |

## 发布文件

| 文件 | 用途 |
|------|------|
| `README.md` | 项目主页文档 |
| `CHANGELOG.md` | 变更日志 |
| `LICENSE` | MIT 许可证 |
| `package.json` | 包元数据（name, version, license, repository） |

## 改动文件

```
README.md                  项目概览文档
CHANGELOG.md               变更日志
LICENSE                    MIT 许可证
docs/
├── architecture.md        系统架构
├── api.md                 API 参考
├── providers.md           Provider 指南
├── tools.md               Tool 指南
├── hooks.md               Hook 指南
├── memory.md              Memory 指南
├── checkpoint.md          Checkpoint 指南
└── telemetry.md           Telemetry 指南
examples/
├── basic/
│   ├── hello.ts           基础示例
│   ├── tools.ts           工具示例
│   └── provider.ts        Provider 示例
└── advanced/
    ├── hooks.ts           Hook 示例
    ├── memory.ts          Memory 示例
    ├── checkpoint.ts      Checkpoint 示例
    └── eval.ts            Eval 示例
```
