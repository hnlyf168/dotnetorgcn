# .NET 中文开源社区 · dotnet.org.cn

面向中文开发者的 .NET 与 AI 开源社区官网。页面预渲染，动态数据使用 Cloudflare Pages Functions，无生产环境 npm 依赖。

采用炭黑、薄荷绿与紫色的统一视觉，首页以可点击项目网络、重点项目展示、代码工作台和社区成员组织内容。包含项目下拉菜单、15 个真实仓库、分类与搜索、独立项目介绍页、成员目录、Star 支持者分页、NuGet 数据和图标下载。首页、项目、关于我们、成员及品牌页面提供完整中英双语，共 38 个页面。

社区组织为 [donet-org-cn](https://github.com/donet-org-cn)，交流入口为 [Community Discussions](https://github.com/donet-org-cn/community/discussions)，贡献说明见 [组织贡献指南](https://github.com/donet-org-cn/.github/blob/main/CONTRIBUTING.md)。[关于我们](https://dotnet.org.cn/about/)明确说明社区方向、参与方式和项目归属。

首次访问默认网址时按浏览器首选语言选择：中文系统显示中文，其余显示英文。导航栏可手动切换并记住选择，项目切换语言后仍停留在同一项目。显式的 `/en/` 链接保留英文，便于跨语言分享。浏览器禁用存储时仍可切换语言。

支持键盘操作、减少动态效果偏好、SEO、双语站点地图、`hreflang`、404 和基础安全响应头。浏览器只请求同源数据与头像接口，无外部字体或浏览器端 GitHub 请求。动态接口不可用时保留预渲染介绍和最近成功同步的数据。项目路径例如 `/projects/funasrnet/` 与 `/en/projects/funasrnet/`，支持直接打开和刷新。

## 本地运行

安装 Node.js 24 LTS，然后执行：

```sh
npm ci
npm run dev
```

打开 http://127.0.0.1:4321 。修改源文件后重新运行开发命令更新输出。

```sh
npm run build       # 输出 dist；动态功能需一并部署根目录 functions
npm run check       # 检查静态内容与部署产物
npx playwright install chromium
npm run test:e2e    # 桌面与移动端浏览器验证
npm run data        # 同步 GitHub Star / Fork 状态，保留人工介绍
npm run brand:generate # 从 SVG 原稿重新生成网站、GitHub、NuGet 图标与分享卡片
```

## 内容更新

| 文件 | 用途 |
| --- | --- |
| `content/projects.json` | 项目中文介绍、功能、限制、分类、安装命令 |
| `content/project-details.json` | 中文项目概况、适用场景、准备条件与步骤 |
| `content/projects.en.json` | 完整英文项目介绍与入门内容 |
| `content/members.json` | 明确收录的成员、双语简介与技术方向 |
| `content/live-snapshot.json` | 接口失败时使用的公开数据快照 |
| `src/i18n.mjs` | 中英文页面文案 |
| `src/home.mjs`、`src/project.mjs` | 首页和独立项目页结构 |
| `src/layout.mjs` | 共用导航、语言切换、SEO 与页脚 |
| `src/about.mjs`、`src/config.mjs` | 双语关于页面与社区组织配置 |
| `public/style.css` | 配色与响应式布局 |
| `public/app.js`、`public/shared.js` | 首页交互、粒子、代码示例与共用行为 |
| `public/locale.js` | 首选语言检测和手动语言偏好 |
| `public/live.js`、`functions/api/`、`src/data-service.mjs` | 同源动态接口、支持者与 NuGet 数据 |
| `.github/workflows/deploy.yml` | 构建、校验、浏览器测试、自动发布 |

提交到 GitHub 的 `main` 分支即自动发布；PR 在相同仓库内生成预览部署，Fork PR 只运行检查。每次正式发布自动按固定 GitHub 仓库 ID 查询当前归属、Star 和 Fork 状态，因此支持个人与组织仓库同时展示，以及转移后的归属更新。新仓库需要在 `content/projects.json`、`content/project-details.json` 和 `content/projects.en.json` 添加完整双语资料再发布，不会自动生成未经核实的能力声明。

项目按真实维护者链接。FunAsrNet、SimdYolo、PureDb、SimdSkia、Serein、yunsevo 已转入组织；sdcb 的 6 个项目仍链接其个人仓库。原有 `hnlyf168/SimdPaddleOCR` Fork 与新增的上游介绍 `/projects/sdcb-simdpaddleocr/` 分开保留。官网为独立社区展示，不代表微软官方。详见 [仓库转移说明](docs/REPOSITORY-TRANSFER.md)。

## 动态数据如何更新

无需创建额外 GitHub Token，也无需 `PROJECT_DATA_GITHUB_TOKEN` Secret。已为维护者自己的 9 个项目安装 `scripts/community-data-workflow.txt` 中的工作流，使用每次任务自动签发的、仅该仓库有效的 `GITHUB_TOKEN`。新增 Star 会触发同步，每 6 小时还会校准取消 Star 等变化；GitHub 任务排队和网站缓存会带来延迟。

任务只向项目的 `community-data` 分支写入公开统计和支持者的公开用户名、ID，不包含凭据或邮箱。官网后端读取该分支并校验固定仓库 ID。名单最多同步 1,000 人；超出时仍显示总数并链接 GitHub。未授权的第三方仓库仅展示公开统计与介绍，不虚构 Star 名单。

成员目录合并 `content/members.json` 中明确收录的成员和 GitHub 的公开组织成员，按需同步公开头像、显示名称和简介。GitHub 公开简介明确提到 Microsoft MVP 时，会显示相应标识及来源链接；简介变化后的下一次成功同步会更新标识。社区整理的双语项目简介与 GitHub 原文分别保留。每次正式构建也会刷新公开资料快照，供接口不可用时使用；无需新增 Secret。不修改任何人的成员可见性，新项目的双语说明仍需人工审核后添加。

NuGet 接口无需密钥，展示已核实包的当前版本、累计下载量和该版本的包依赖；下载量不等于项目引用量或独立用户。SimdYolo 和 FunAsrNet 未核实存在官方 NuGet 包，因此保留源码获取方式。

Pages Functions 仅处理 `/api/*`。GitHub 数据、NuGet 和头像均有边缘缓存。仅用控制台拖拽 `dist` 会部署静态页面，无法安装 Functions；完整发布请使用现有 GitHub Actions，或从源码根目录执行 `npm run deploy`。参考 [Cloudflare Functions 部署说明](https://developers.cloudflare.com/pages/functions/get-started/)。

## 社区标志

标志以开放代码括号、连接两侧的 N 和连接点，表达 .NET、开源与开发者协作。品牌页面为 `/brand/`、`/en/brand/`，提供 SVG、单色版、NuGet PNG、圆形裁切安全的 GitHub 头像、favicon、网站图标和完整 ZIP。

原稿位于 `src/brand-mark.mjs`，使用说明见 [图标与使用说明](docs/BRAND.md)。`npm run brand:generate` 使用本地已安装的 Edge；也可通过 `PLAYWRIGHT_CHANNEL` 指定其他已安装浏览器。产物已提交，部署无需安装图像生成工具。

## Cloudflare 配置

完整从零步骤和安全的本地 Token 用法见 [Cloudflare 部署指南](docs/CLOUDFLARE.md)。参考部署流程：[sdcb/wubi86-viewer](https://github.com/sdcb/wubi86-viewer/blob/main/.github/workflows/deploy.yml)。

目标域名 `https://dotnet.org.cn`，默认 Pages 项目名 `dotnet-org-cn`。仅生成代码不代表已经上线；须完成账号授权、首次发布和自定义域绑定。
