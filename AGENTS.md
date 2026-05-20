# 项目工作指令

## 操作约束

禁止批量删除文件或目录。

不要使用：

- `del /s`
- `rd /s`
- `rmdir /s`
- `Remove-Item -Recurse`
- `rm -rf`

需要删除文件时，只能一次删除一个明确路径的文件。

正确示例：

```powershell
Remove-Item "C:\path\to\file.txt"
```

如果需要批量删除文件时，应停止操作，并向用户请求，让用户手动删除。

Python 环境使用 conda 下的 `pytorch` 环境。

## Markdown 简历生成器项目构思

### 项目目标

创建一个 GitHub 项目，用单一 `resume.md` 生成在线网页、PDF、亮色/暗色主题页面，并支持英文版简历输出。项目部署到 GitHub Pages 后，可作为个人简历展示页使用。

### 核心输入

- 使用 Markdown + Front Matter 维护简历资料。
- `resume.md` 包含个人信息、教育经历、工作经历、项目经历、技能、作品链接、语言版本等内容。
- 英文版可通过 `resume.en.md` 或多语言字段维护，保持模板结构一致。

### 生成能力

- 将 `resume.md` 构建为静态 HTML 页面。
- 提供响应式网页布局，适配桌面端和移动端展示。
- 提供可打印 CSS，支持浏览器打印和 PDF 导出。
- 支持 light/dark 主题切换，主题样式通过 CSS 变量维护。
- 支持生成英文版简历页面或 PDF。

### UI 资料收集

- 部署一个按步骤填写资料的网页表单。
- 表单逐步收集基本信息、教育经历、工作/项目经历、技能、链接等资料。
- UI 可导出或更新 Markdown 简历源文件，降低手写 `resume.md` 的门槛。

### GitHub Pages 部署

- 使用 GitHub Actions 自动构建静态站点。
- 将构建产物发布到 GitHub Pages。
- 默认输出适合展示的在线简历主页，并保留 PDF 下载入口。

### 推荐技术路线

- Markdown 解析：读取 `resume.md` 和 Front Matter。
- 静态站点生成：将简历内容渲染为 HTML。
- PDF 渲染：优先基于浏览器打印样式或无头浏览器生成。
- 主题系统：使用 CSS 变量维护亮色和暗色主题。
- 多语言模板：复用同一模板结构渲染中文和英文内容。
- 表单式 UI：用分步表单收集资料，并导出 Markdown。

### 后续里程碑

1. 实现 `resume.md -> HTML` 的最小可用版本。
2. 加入打印样式和 PDF 导出能力。
3. 加入亮色/暗色主题切换。
4. 加入英文版简历生成。
5. 实现分步资料收集 UI。
6. 配置 GitHub Actions 和 GitHub Pages 自动部署。
