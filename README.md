# Markdown Resume Generator

一个面向中文简历场景的在线简历生成器。使用者可以通过分步骤表单填写资料，实时预览简历，并导出适合打印为 PDF 的简历页面。

## 在线使用

主站地址：

[https://resumegeneration.cc.cd](https://resumegeneration.cc.cd)

备用地址：

[https://resumegeneration.pages.dev](https://resumegeneration.pages.dev)

打开网页后即可使用，无需注册账号。

## 适合谁使用

- 需要快速制作中文简历的学生、求职者和实习申请者。
- 希望用结构化表单整理简历内容的人。
- 想在浏览器中直接预览、编辑并打印 PDF 的使用者。
- 想基于 Markdown/JSON 继续二次开发个人简历工具的开发者。

## 主要功能

- 分步骤填写基本信息、教育背景、科研经历、实践经历、技能特长。
- 上传个人照片。
- 上传校徽，或搜索候选校徽后手动选择。
- 在网页预览中直接编辑简历内容。
- 自动调整字号、行距和段间距，尽量让 PDF 输出保持一页。
- 选择内置模板，或导入 JSON 自定义模板。
- 使用浏览器打印功能导出 PDF。
- 下载当前简历 HTML 文件。

内置示例内容均为虚构占位信息，默认头像为 AI 生成的虚构证件照，仅用于演示版式。

## 使用步骤

1. 打开在线工具。
2. 按页面左侧步骤填写个人信息、教育经历、经历条目和技能。
3. 在右侧预览区检查排版。
4. 如有需要，直接在预览区微调文字。
5. 上传个人照片和校徽，或选择搜索到的校徽候选。
6. 选择模板或导入自定义模板。
7. 点击浏览器打印，将目标打印机选择为“另存为 PDF”。

## PDF 导出建议

推荐使用桌面浏览器导出 PDF：

- Chrome
- Edge
- Firefox

打印时建议：

- 纸张选择 A4。
- 边距选择默认或无。
- 勾选背景图形。
- 如果内容超过一页，先减少经历文字，或使用页面中的排版调整功能。

## 数据与隐私

简历内容主要在浏览器本地编辑和预览。请注意：

- 不要在公开仓库中提交自己的真实简历数据。
- 下载的 HTML 和导出的 PDF 会包含你填写的简历内容。
- 校徽搜索接口可能会调用第三方图片搜索服务，具体取决于部署者是否配置搜索 API Key。
- 如果不想使用在线版本，也可以在本地运行项目。

## 本地运行

需要安装 Node.js。然后在项目目录中运行：

```powershell
npm.cmd install
npm.cmd run dev
```

启动后访问：

```text
http://127.0.0.1:5173/
```

Windows 用户也可以双击本地启动器：

```powershell
tools\ResumeLauncher.exe
```

## 构建

生成生产环境静态文件：

```powershell
npm.cmd run build
```

构建产物位于：

```text
dist
```

## Cloudflare Pages 部署

本项目已支持 Cloudflare Pages。推荐设置：

```text
Framework preset: Vite
Build command: npm run build
Build output directory: dist
```

如果使用 GitHub Actions，仓库中已包含：

```text
.github/workflows/cloudflare-pages.yml
```

需要在 GitHub Actions Secrets 中配置：

```text
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID
```

## 可选环境变量

校徽搜索功能可以配置第三方搜索服务。至少配置其中一个即可：

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

如果不配置密钥，网站仍可使用，校徽可以通过手动上传完成。

## 自定义模板

页面中可以导入 JSON 模板。示例文件：

```text
templates/example-template.json
```

模板示例：

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

## 项目结构

```text
resume.md                    默认简历数据源
src/                         前端应用源码
public/                      静态资源
functions/api/logo-search.js Cloudflare Pages Function
scripts/build-resume.mjs     Markdown 简历数据构建脚本
templates/                   模板示例
```

## 许可证

当前项目未声明开源许可证。复用、分发或商用前请先确认授权。
