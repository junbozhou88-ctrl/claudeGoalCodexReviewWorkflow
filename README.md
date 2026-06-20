# Table 增删改查（纯前端 + Mock）

一个基于 **React + Vite** 的基础数据管理页面，实现表格数据的查看、新增、编辑、删除（CRUD）。
本项目**不依赖真实后端**：所有数据请求由内存中的 Mock 数据层模拟（含网络延迟与字段校验），便于本地开发与自动化测试。

需求来源见 [`doc/table-prd.md`](doc/table-prd.md)。

---

## ✨ 功能特性

- **列表查询**：进入页面默认展示全部记录，含加载态与**空状态**提示
- **新增**：点击「+ 新增」打开表单弹窗，校验通过后保存并刷新列表
- **编辑**：每行「编辑」打开弹窗并回填当前数据，修改后保存
- **删除**：每行「删除」需**二次确认**，确认后移除记录
- **统一反馈**：操作成功 / 失败均有 Toast 轻提示
- **表单校验**：`name`、`type` 为必填，错误项即时高亮
- **健壮交互**：保存 / 删除请求在途时，遮罩点击不可关闭弹窗，避免丢失输入

## 🧱 技术栈

| 用途 | 选型 |
| --- | --- |
| 框架 | React 18 |
| 构建 | Vite 6 |
| 测试 | Vitest + Testing Library + jsdom |
| 后端 | 无（`src/api/mockApi.js` 内存 Mock） |

## 📁 目录结构

```
src/
├─ api/
│  ├─ mockApi.js        # 模拟后端的内存数据层（list/create/update/remove）
│  └─ mockApi.test.js   # 数据层单元测试
├─ components/
│  ├─ DataTable.jsx     # 表格 + 操作列 + 空状态
│  ├─ FormModal.jsx     # 新增 / 编辑共用表单弹窗
│  ├─ ConfirmDialog.jsx # 删除二次确认弹窗
│  └─ Toast.jsx         # 成功 / 失败轻提示
├─ test/setup.js        # 测试环境初始化
├─ App.jsx              # 页面装配与 CRUD 流程编排
├─ App.test.jsx         # 完整交互流程测试
├─ index.css            # 样式
└─ main.jsx             # 入口
```

## 🚀 快速开始

```bash
npm install      # 安装依赖
npm run dev      # 启动开发服务器，浏览器打开提示的地址
npm run build    # 生产构建（输出到 dist/）
npm run preview  # 预览生产构建
```

> 运行环境：Node 18+（`jsdom` 已固定在兼容 Node 18 的 `^25`）。

## 🧪 测试（Mock 驱动）

由于没有真实后端，全部测试都跑在 `mockApi` 之上，覆盖数据层与 UI 交互两层：

```bash
npm test         # 单次运行全部测试
npm run test:watch  # 监听模式
```

- `mockApi.test.js`：增删改查、必填校验、不存在记录报错、列表返回副本等
- `App.test.jsx`：渲染列表、弹窗新增、表单校验、编辑回填、删除二次确认、取消删除、请求在途时遮罩不关闭

当前共 **15 个用例全部通过**。

---

## 🤖 开发工作流：`/goal` + Stop Hook + Codex Review

本项目的实现过程使用了 Claude Code 的 **`/goal` 目标驱动模式**，并配合一个 **Stop Hook** 形成「写代码 → 自动评审 → 修复」的闭环。

### `/goal`：目标驱动

通过 `/goal <目标描述>` 设定一个会话级目标（本项目目标为「实现该 PRD，纯前端 + Mock 测试」）。设定后会注册一个**会话级 Stop Hook**，在 Claude 每次准备结束时进行校验：只有当目标条件被满足时才允许停止，否则会把反馈回灌给 Claude 继续工作。目标达成后 Hook 自动清除。

### Stop Hook：停止前自动 Codex Review

仓库根目录的 `codex-review/` 目录由一个 **Stop Hook**（`~/.claude/hooks/codex-review-on-stop.js`）生成。其工作方式：

1. 当 Claude 认为任务完成、准备停止时，Hook 被触发；
2. Hook 调用 **Codex** 对当前改动做一轮独立代码评审；
3. 评审结果写入 `codex-review/review-<时间戳>.md`：
   - **判决**：`BLOCK`（发现问题，拦截本次停止）或通过；
   - **理由 + 原始输出**：逐条列出问题，标注优先级（如 `P1` / `P2`）与具体文件行号；
4. 若判决为 `BLOCK`，会话不会结束，问题会回灌给 Claude 修复，修复后再次触发评审，直至通过。

### `codex-review/` 评审记录说明

`codex-review/` 下每个 `.md` 即一次评审快照，**作为开发过程留痕保留在仓库中**，便于日后回顾「当时发现了什么问题、如何修复」。本项目过程中产生的记录示例：

| 文件 | 发现的问题（摘要） |
| --- | --- |
| `review-20260620-222058.md` | P1：`jsdom@29` 抬高了 Node 最低版本，破坏 Node 18 安装；P2：保存在途时点击遮罩仍可关闭弹窗 |
| `review-20260620-222913.md` | P2：保存成功后 `submitting` 标志在列表刷新期间未及时复位，会泄漏到下一次交互 |
| `review-20260620-223552.md` | 上述问题修复后的复评记录 |

> 这些问题均已在对应提交中修复（详见 `src/App.jsx`、`src/components/FormModal.jsx` 等）。

---

## 📌 版本边界

本期仅包含基础增删改查，不含：批量操作、导入导出、复杂筛选、权限细分、操作日志。
