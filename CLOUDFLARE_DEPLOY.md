# Cloudflare Pages 部署说明

本项目已配置为 Cloudflare Pages 托管站点：

- 项目名：`resumegeneration`
- 构建命令：`npm run build`
- 输出目录：`dist`
- 本地域名：`resumegeneration.cc.cd`
- Cloudflare 配置文件：`wrangler.toml`

## 方式一：Wrangler 直接部署

Cloudflare 在当前非交互终端里要求使用 API Token。先在 Cloudflare 创建一个 API Token，然后在 PowerShell 中执行：

```powershell
$env:CLOUDFLARE_API_TOKEN = "你的 Cloudflare API Token"
npm.cmd run deploy:cloudflare
```

部署成功后会得到一个类似下面的地址：

```text
https://resumegeneration.pages.dev
```

## API Token 权限

建议创建 Custom token，权限至少包含：

- Account -> Cloudflare Pages -> Edit
- Account -> Account Settings -> Read
- Zone -> Zone -> Read

如果要让 Wrangler 或 Cloudflare 自动管理自定义域名 DNS，再额外给对应域名：

- Zone -> DNS -> Edit

## 方式二：Cloudflare Dashboard 手动上传

如果暂时不想配置 API Token，也可以：

1. 执行 `npm.cmd run build`。
2. 登录 Cloudflare Dashboard。
3. 进入 Workers & Pages。
4. Create application -> Pages -> Upload assets。
5. Project name 填 `resumegeneration`。
6. 上传本项目的 `dist` 目录。

这种方式也能使用 `functions/api/logo-search.js` 里的 Pages Functions。

## 绑定 DNSHE 域名

在 Cloudflare Pages 项目中：

1. 打开 `resumegeneration` 项目。
2. 进入 Custom domains。
3. 添加 `resumegeneration.cc.cd`。
4. Cloudflare 会提示添加一条 CNAME 记录。

然后在 DNSHE 的域名 DNS 设置中添加：

```text
类型: CNAME
主机记录/名称: resumegeneration
目标/记录值: resumegeneration.pages.dev
TTL: 自动或默认
```

如果 DNSHE 要求填写完整主机名，主机记录可以填：

```text
resumegeneration.cc.cd
```

等待 DNS 生效后，Cloudflare 会自动签发 HTTPS 证书。通常几分钟到几十分钟，少数情况下会更久。

## 可选环境变量

校徽搜索接口不配置密钥也能运行，但搜索能力会退化为页面内的公开候选和手动上传。需要更强搜索时，在 Cloudflare Pages 项目的 Settings -> Environment variables 中添加以下任意一组：

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

真实密钥不要提交到代码仓库。

## 方式三：GitHub Actions 自动部署

项目已添加 `.github/workflows/cloudflare-pages.yml`。你把项目上传到 GitHub 后，每次 push 到 `main` 分支都会自动构建并部署到 Cloudflare Pages。

### GitHub 仓库 Secrets

在 GitHub 仓库中进入 Settings -> Secrets and variables -> Actions -> New repository secret，添加：

```text
CLOUDFLARE_API_TOKEN=你的 Cloudflare API Token
CLOUDFLARE_ACCOUNT_ID=你的 Cloudflare Account ID
```

Account ID 可以在 Cloudflare Dashboard 右侧栏或账号页面找到。

API Token 建议使用 Custom token，权限至少包含：

```text
Account -> Cloudflare Pages -> Edit
Account -> Account Settings -> Read
```

如果后续希望自动管理 DNS，也可以额外给对应域名：

```text
Zone -> Zone -> Read
Zone -> DNS -> Edit
```

### 首次部署顺序

1. 在 Cloudflare Dashboard 先创建 Pages 项目，名称填 `resumegeneration`。
2. 上传项目到 GitHub，并确认默认分支是 `main`。
3. 在 GitHub 仓库添加上面的两个 Secrets。
4. 推送代码，或在 Actions 页面手动运行 `Deploy to Cloudflare Pages`。
5. 部署成功后，在 Cloudflare Pages 的 Custom domains 里添加 `resumegeneration.cc.cd`。
6. 去 DNSHE 添加 CNAME：

```text
类型: CNAME
主机记录: resumegeneration
记录值: resumegeneration.pages.dev
```

如果你想完全使用 Cloudflare Dashboard 的 Git 集成，也可以不使用这个 workflow：在 Workers & Pages 里连接 GitHub 仓库，构建命令填 `npm run build`，输出目录填 `dist`。
