# .NET 中国 · dotnet.org.cn

面向中国开发者的 .NET 与 AI 开源社区官网。纯静态、无运行时第三方依赖，部署到 Cloudflare Pages。

包含可交互粒子主视觉、9 个真实开源仓库、分类与搜索、项目详情、技术生态代码切换、代码复制、移动端导航，以及 SEO、站点地图、404 和基础安全响应头。支持键盘操作和减少动态效果偏好。无需外部字体、图片 CDN 或浏览器端 GitHub 请求。

## 本地运行

安装 Node.js 24 LTS，然后执行：

```sh
npm ci
npm run dev
```

打开 http://127.0.0.1:4321 。修改源文件后重新运行开发命令更新输出。

```sh
npm run build       # 输出 dist，可直接上传到 Pages
npm run check       # 检查静态内容与部署产物
npx playwright install chromium
npm run test:e2e    # 桌面与移动端浏览器验证
npm run data        # 同步 GitHub Star / Fork 状态，保留人工介绍
```

## 内容更新

| 文件 | 用途 |
| --- | --- |
| `content/projects.json` | 项目中文介绍、功能、限制、分类、安装命令 |
| `src/index.html` | 首页文案与页面结构 |
| `public/style.css` | 配色与响应式布局 |
| `public/app.js` | 粒子视觉、筛选、详情、真实代码示例 |
| `.github/workflows/deploy.yml` | 构建、校验、浏览器测试、自动发布 |

提交到 GitHub 的 `main` 分支即自动发布；PR 在相同仓库内生成预览部署，Fork PR 只运行检查。每次正式发布自动同步公开仓库元信息。新仓库需要在 `content/projects.json` 添加中文介绍再发布，不会自动生成未经核实的能力声明。

项目介绍基于 [hnlyf168 的公开仓库](https://github.com/hnlyf168)，`SimdPaddleOCR` 已标记为 [sdcb/SimdPaddleOCR](https://github.com/sdcb/SimdPaddleOCR) 的 Fork。官网为独立社区展示，不代表微软官方。

## Cloudflare 配置

完整从零步骤和安全的本地 Token 用法见 [Cloudflare 部署指南](docs/CLOUDFLARE.md)。参考部署流程：[sdcb/wubi86-viewer](https://github.com/sdcb/wubi86-viewer/blob/main/.github/workflows/deploy.yml)。

目标域名 `https://dotnet.org.cn`，默认 Pages 项目名 `dotnet-org-cn`。仅生成代码不代表已经上线；须完成账号授权、首次发布和自定义域绑定。
