# 从零上线 dotnet.org.cn

建议采用：GitHub 保存源码 → GitHub Actions 构建并验证 → Cloudflare Pages 发布。只配置一次 API Token，以后提交网站内容就能自动更新。

## 1. 创建 GitHub 仓库

在 https://github.com/new 创建仓库，例如 `hnlyf168/dotnetorgcn`，默认分支为 `main`。把当前项目上传进去，确保 `.github/workflows/deploy.yml` 和 `package-lock.json` 都包含在内。请勿上传 `.env`、`.dev.vars` 或任何密钥。首次 Actions 在 Secrets 未设置前会提示缺少部署配置，这是预期情况。

## 2. 创建 Cloudflare Pages 项目

1. 登录 https://dash.cloudflare.com ，选择管理域名的账号。
2. 进入 **Workers 和 Pages / Workers & Pages** → **创建应用 / Create application**。
3. 选择 **Pages**，再选 **上传资产 / Upload assets / Direct Upload**。界面可能先要求点击 **Get started**。选择 Pages 上传，不选 Workers 部署。
4. 项目名称填 `dotnet-org-cn`。
5. 本地执行 `npm ci`、`npm run build`，把生成的 **dist 文件夹** 上传，然后部署。不要上传整个源码文件夹。也可以先按第 6 节使用 API 创建项目，再让 Actions 做首次上传。
6. 首次部署成功后会出现 `https://dotnet-org-cn.pages.dev`（以控制台实际返回为准）。

本项目使用 Actions 直接上传，因此不必再配置 Cloudflare 的 Git 自动构建。首次创建时选择 Direct Upload，避免同一提交触发两套发布流程。

## 3. 创建 API Token

打开 https://dash.cloudflare.com/profile/api-tokens ，选择 **创建令牌 / Create Token** → **创建自定义令牌 / Create Custom Token**。

| 项目 | 填写 |
| --- | --- |
| 令牌名称 | `dotnet-org-cn-deploy` |
| 权限第一项 | **账户 / Account** |
| 权限第二项 | **Cloudflare Pages** |
| 权限第三项 | **编辑 / Edit** |
| 账户资源 | **包括 / Include → 特定账户 / Specific account → 你管理 Pages 的账户** |

确认并创建。Token 通常仅完整显示一次，下一步直接填入 GitHub Secret。使用 API Token 即可，不需要 Global API Key，也不需要把 Token 发在聊天里。此 Token 授予所选账户的 Pages 权限；Cloudflare 的该权限不是只限定一个 Pages 项目的权限。

## 4. 取得 Account ID 并填写 3 个 Secrets

打开 Cloudflare 的 `dotnet.org.cn` 域名概览，在 API 区域复制 **Account ID / 账户 ID**，不是 Zone ID / 区域 ID。Account ID 一般是 32 位字符串。

GitHub 网站仓库 → **Settings → Secrets and variables → Actions → New repository secret**，依次添加：

| Secret 名称（必须完全相同） | 值 |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | 第 3 步创建的 Token |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Account ID |
| `CLOUDFLARE_PAGES_PROJECT` | `dotnet-org-cn`，或你实际创建的 Pages 项目名 |

然后到 GitHub **Actions → Deploy to Cloudflare Pages → Run workflow → main → Run workflow**。等待 build 和 deploy 两个任务成功。

自动发布会先查找该账户里绑定 `dotnet.org.cn` 的现有 Pages 项目，找到时优先复用。没有域名匹配时使用 Secret 中填写的项目名；两者都不存在则停止并提示核对账户与项目名，不会自动新建一个无关站点。

流程会先同步项目元信息、构建网站、验证链接和数据，再运行桌面/手机浏览器测试，最后上传 `dist`。后续直接修改文件提交到 `main`，无需重新填写 Token。

## 5. 绑定 dotnet.org.cn

Cloudflare **Workers 和 Pages → dotnet-org-cn → 自定义域 / Custom domains → 设置域 / Set up a domain**，输入 `dotnet.org.cn`（不要带开头的点，也不要填 `https://`），按提示确认 DNS 记录。

根域名必须位于创建 Pages 项目的同一 Cloudflare 账户，并已使用 Cloudflare Nameservers。只有注册了域名但尚未把 DNS 托管到 Cloudflare 时，需要先按控制台指引完成域名接入。

必须先在 **Pages 的自定义域** 页面添加绑定，不能只手工添加 CNAME。Pages 会引导创建到实际 `<项目名>.pages.dev` 的 DNS 记录，并申请证书。已有同名 A/AAAA/CNAME 记录时先核对其用途，再按 Pages 的冲突提示处理。不要修改邮箱 MX 记录。待状态为 Active / 有效后，通过 `https://dotnet.org.cn` 验证。

需要 `www.dotnet.org.cn` 时，可另在自定义域中添加，再按偏好设置到根域名的重定向。

## 6. 直接用 Token 创建 / 检查 / 更新（可选）

项目内的脚本能从当前终端环境读取 Token，校验账号并创建 Direct Upload Pages 项目。不会把凭据写入源码文件。

Windows PowerShell：

```powershell
$secretToken = Read-Host '粘贴 Cloudflare API Token（输入隐藏）' -AsSecureString
$env:CLOUDFLARE_API_TOKEN = [System.Net.NetworkCredential]::new('', $secretToken).Password
$env:CLOUDFLARE_ACCOUNT_ID = Read-Host '粘贴 Account ID'
$env:CLOUDFLARE_PAGES_PROJECT = 'dotnet-org-cn'

# 只检查权限与项目状态
npm run cloudflare:setup

# 尚未创建时创建，已存在则复用
npm run cloudflare:setup -- --create

# 构建并上传；默认项目名 dotnet-org-cn
npm run deploy

# 首次发布后可关联目标域名，之后仍需按控制台完成 DNS / 证书验证
npm run cloudflare:setup -- --domain

# 使用完毕后清除当前进程中的 Token
Remove-Item Env:CLOUDFLARE_API_TOKEN
Remove-Variable secretToken
```

如果用了其他项目名称，发布命令改为：

```powershell
npm run build
npx wrangler@4 pages deploy dist --project-name=$env:CLOUDFLARE_PAGES_PROJECT --branch=main
```

## 日常如何更新

- **改项目介绍**：编辑 `content/projects.json` 后提交 `main`。
- **改首页标语**：编辑 `src/i18n.mjs` 中对应的中文与英文文案后提交。
- **改项目独立页面**：编辑 `content/project-details.json`，英文内容在 `content/projects.en.json`。
- **只刷新 Star 等数据**：GitHub Actions 手动 Run workflow，构建时会自动同步。
- **增加项目**：在 `content/projects.json` 新增记录，同时补齐 `content/project-details.json` 和 `content/projects.en.json`；使用现有 `ai`、`infra`、`connect`、`apps` 分类。Star 和 Fork 自动核对，双语介绍由人工审核。
- **本地用 Key 更新**：按第 6 节设置环境变量，改完内容执行 `npm run deploy`。Token 只负责部署授权，不会自动编辑文案。
- **撤销访问**：在 Cloudflare API Tokens 中撤销对应 Token；新建 Token 后只更新 GitHub Secret。

## 常见问题

| 现象 | 检查 |
| --- | --- |
| 403 / Authentication error | Token 是否有 Account → Cloudflare Pages → Edit，资源范围是否包含目标账户 |
| Project not found | 项目是否创建，`CLOUDFLARE_PAGES_PROJECT` 是否与实际名称一致 |
| 只有 pages.dev 能访问 | Pages 自定义域绑定、DNS 记录、Nameservers 和证书状态 |
| 域名显示 522 | 是否只建了 DNS、漏了 Pages 自定义域绑定 |
| 图片 / 样式 404 | 是否上传 dist 内的完整产物，不能只上传 index.html |
| Actions 提示缺少配置 | 3 项应是 Repository secrets，名称必须完全一致 |
| Fork PR 没有预览部署 | 设计如此：外部 Fork 仅测试，不接收部署凭据 |

官方参考：[持续集成直接上传](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/)、[Pages 自定义域名](https://developers.cloudflare.com/pages/configuration/custom-domains/)。
