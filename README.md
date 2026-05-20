# Markdown Resume Generator

一个本地可双击启动、也可部署到 GitHub Pages 的中文简历生成器。

内置示例内容均为虚构占位信息，默认头像为 AI 生成的虚构证件照，仅用于演示版式。

## 本地使用

双击：

```powershell
tools\ResumeLauncher.exe
```

启动后会自动打开：

```text
http://127.0.0.1:5173/
```

也可以用命令启动：

```powershell
$env:npm_config_cache = ".npm-cache"
npm.cmd install
npm.cmd run dev
```

## 生成能力

- 分步骤填写基本信息、教育背景、科研经历、实践经历、技能特长。
- 上传个人照片。
- 上传校徽，或使用公开数据源搜索候选校徽后手动选择。
- 网页预览可直接编辑。
- 自动调整字号、行距和段间距，尽量让 PDF 输出保持一页。
- 选择内置模板，或导入 JSON 自定义模板。
- 浏览器打印可导出 PDF。
- 可下载当前简历 HTML。

## GitHub Pages 部署

1. 将项目上传到 GitHub。
2. 仓库默认分支使用 `main`。
3. 在 GitHub 仓库设置里启用 Pages，Source 选择 GitHub Actions。
4. 推送代码后，`.github/workflows/pages.yml` 会自动构建并发布 `dist`。

静态部署不依赖 API Key 或后端服务，校徽建议使用“上传校徽”获得最稳定效果。

## Cloudflare Pages 部署

Cloudflare Pages 可以同时部署前端和后台函数。部署后，前端会调用：

```text
/api/logo-search?school=学校名称
```

后台函数位于 `functions/api/logo-search.js`，用于代理图片搜索 API，避免把 API Key 暴露在浏览器代码里。

### 推荐部署方式

1. 将项目上传到 GitHub。
2. 在 Cloudflare Dashboard 进入 Workers & Pages。
3. 创建 Pages 项目并连接该 GitHub 仓库。
4. 构建设置：
   - Framework preset: Vite
   - Build command: `npm run build`
   - Build output directory: `dist`
5. 在 Pages 项目的 Settings -> Environment variables 里添加密钥。

### 可选搜索密钥

至少配置其中一个。可以同时配置多个，后台会聚合候选图片并去重。

```text
BING_IMAGE_SEARCH_KEY=你的 Bing Image Search Key
BING_IMAGE_SEARCH_ENDPOINT=https://api.bing.microsoft.com/v7.0/images/search
```

```text
SERPAPI_KEY=你的 SerpAPI Key
```

```text
SEARCHAPI_KEY=你的 SearchAPI.io Key
```

```text
BRAVE_SEARCH_API_KEY=你的 Brave Search API Key
```

如果不配置密钥，网站仍可使用：校徽会退回到公开数据源候选和手动上传。

### 本地测试 Cloudflare Functions

安装 Wrangler 后可运行：

```powershell
copy .dev.vars.example .dev.vars
# 在 .dev.vars 中填入真实 Key
npx wrangler pages dev dist
```

真实 Key 不要提交到 GitHub。

## 自定义模板

页面左侧可以导入 JSON 模板。示例文件：

```text
templates/example-template.json
```

模板字段：

```json
{
  "id": "custom-template-id",
  "name": "模板名称",
  "description": "模板说明",
  "className": "template-custom",
  "variables": {
    "template-accent": "#1f5f9c",
    "template-accent-dark": "#17446f",
    "template-heading-font": "\"STSong\", \"Songti SC\", \"SimSun\", serif",
    "template-body-font": "\"Microsoft YaHei\", \"PingFang SC\", Arial, sans-serif",
    "template-section-rule": "4px",
    "template-title-size": "32px",
    "template-section-title-size": "20px"
  }
}
```
