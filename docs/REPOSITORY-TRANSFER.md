# 将个人仓库转移到 donet-org-cn

转移后，仓库地址会从 `https://github.com/hnlyf168/项目名` 变成 `https://github.com/donet-org-cn/项目名`。GitHub 会自动重定向旧网页和 Git 操作地址，但建议在转移完成后主动更新本地 remote、README、徽章与发布脚本中的固定路径。

GitHub 的 Transfer 操作保留提交历史、Stars、Issues、Pull Requests 和 Releases。仓库的 Secrets、Webhook 与 Deploy keys 也会继续关联；组织级的 Actions 策略和默认权限会影响转移后的运行方式。请使用正式 Transfer，而不是另建空仓库后复制代码。

## 转移一个项目

1. 确认你拥有仓库管理员权限，并能在目标组织创建仓库。
2. 确认组织下不存在同名仓库或同一 Fork 网络中的冲突仓库。
3. 原仓库 → Settings → General → Danger Zone → Transfer ownership，目标填写 `donet-org-cn`，核对项目名后确认。
4. 转移完成后，在该项目的本地目录更新 remote，例如：

```sh
git remote set-url origin https://github.com/donet-org-cn/FunAsrNet.git
git remote -v
```

上面的命令仅适用于 FunAsrNet 已完成转移的情况，其他项目替换为实际名称。

不要在旧的 `hnlyf168/项目名` 位置重新创建同名仓库或 Fork，这会永久取消原地址的自动重定向。Fork 转移后仍保留上游关系。GitHub Pages 地址、GitHub Packages 等关联服务有各自的迁移规则，不能仅依赖仓库重定向。

## 官网会怎样处理

官网的 `content/projects.json` 为每个项目记录 `repositoryId` 和 `owner`。固定 ID 不因所有者转移而变化；构建前的 `npm run data` 按 ID 查询当前维护者，并更新源码、文档、Issue 和克隆命令的归属。项目在官网内的 `/projects/项目名/` 路径保持稳定，中英文页面也保持对应。

项目转移后，运行一次官网的 GitHub Actions 或提交官网内容即可刷新。组织 README 中的项目链接仍可使用 GitHub 的重定向，但建议随后更新为新地址。

2026-10-27 已完成 FunAsrNet、SimdYolo、PureDb、SimdSkia、Serein、yunsevo 的转移，固定仓库 ID、Stars 和原有 Secrets 均已核对；README 与官网链接已更新。Serein 的 NuGet 发布工作流中限制仓库归属的条件已改为组织地址。没有触发 NuGet 包发布。

sdcb 的项目继续保留在其个人账户，官网仓库仍为 `hnlyf168/dotnetorgcn`。软件项目转移不会自动更改 `dotnet.org.cn` 域名；Cloudflare Pages 的网站内容由官网仓库工作流发布。若以后连官网仓库也迁入组织，请更新官网源码链接并验证组织内 Actions 的运行策略。若包发布使用 NuGet Trusted Publishing，请同时核对 nuget.org 上绑定的仓库所有者策略。

Serein 已配置 `NUGET_USER`，工作流支持 NuGet Trusted Publishing。下一次发布前，请登录 nuget.org 的 Trusted Publishing 页面，核对该项目策略的 GitHub owner 为 `donet-org-cn`、repository 为 `Serein`、workflow 为 `publish-nuget.yml`、environment 为 `nuget`。旧策略若绑定 `hnlyf168`，需更新或重新建立；GitHub 转移不会替你改 NuGet 账户中的策略。这里未访问 NuGet 账户，也未发布新包。参考 [NuGet 官方说明](https://learn.microsoft.com/en-us/nuget/nuget-org/trusted-publishing)。

SimdSkia 的 NuGet 预览发布同样使用 Trusted Publishing。对应策略应核对 owner `donet-org-cn`、repository `SimdSkia`、workflow `nuget-preview.yml`、environment `nuget-preview`。公开同步任务已随仓库转移，并手动运行验证；官网地址 `/projects/simdskia/` 保持不变。

官方参考：[Transferring a repository](https://docs.github.com/en/repositories/creating-and-managing-repositories/transferring-a-repository)。
