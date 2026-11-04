# 项目内容核对：2026-11-04

核对官网收录的全部 14 个仓库的默认分支 README、最新正式 Release、近期提交，以及已配置 NuGet 包的实际发布版本。仓库推送时间可能来自数据分支，不单独作为功能更新依据。

本轮介绍更新：

- [SimdSkia 0.1.1](https://github.com/donet-org-cn/SimdSkia/releases/tag/v0.1.1)：正式补丁版、Avalonia 12.1.0–12.1.5 的同二进制兼容验证、三平台窗口与 AOT、安装及启动配置。保留 API、画质和 macOS GPU 边界，不把 0.1.0 跑分改称 0.1.1 新测结果。
- [PureDb](https://github.com/donet-org-cn/PureDb)：[NuGet 1.0.0-rc.1](https://www.nuget.org/packages/PureDb/1.0.0-rc.1)、大库范围访问、检查点内存、一致快照备份，以及当前 SQL 能力。候选版不写成正式版。
- [Sdcb.Arithmetic 1.2.2](https://github.com/sdcb/Arithmetic/releases/tag/v1.2.2)：所有公开 Real API 的显式精度校验，及此前版本的大指数、RootN、位索引和位移修复。
- [SimdYolo](https://github.com/donet-org-cn/SimdYolo)：区分 0.11.3 源码启动优化与 [0.11.2 正式发行](https://github.com/donet-org-cn/SimdYolo/releases/tag/v0.11.2)。未核实到精确 ID 为 SimdYolo 的公开 NuGet 包，因此保留源码克隆入口，不添加推测包名。

其余核对项目：FunAsrNet、SimdPaddleOCR、Serein、yunsevo、p2pvpn、ProtoBus、PaddleSharp、chats、OpenVINO.NET、Sdcb.FFmpeg。更新仓库 Star、Fork、开放条目、推送日期与已配置包的版本/下载快照；未将组织转移或 Star 同步提交写成功能更新。

NuGet 主包核实版本：Sdcb.SimdPaddleOCR 2.0.0、PureDb / PureDb.SqliteCompatibility 1.0.0-rc.1、SimdSkia 系列 0.1.1、Serein 系列 0.1.0-preview.1、Sdcb.PaddleOCR / Sdcb.PaddleInference 3.3.1、Sdcb.OpenVINO 0.8.1、Sdcb.FFmpeg 7.0.0、Sdcb.Arithmetic 1.2.2。GitHub Release 标签与 NuGet 包版本分别核对，不相互替代。

中英文介绍同步更新。数值为本次核对快照，线上动态接口仍按各自缓存与同步时间刷新。
