# .NET 中文开源社区 · 图标与使用说明

这枚标志将两枚开放的代码括号、字母 **N** 与一个连接点组合在一起：括号代表开放源码，N 呼应 .NET，彼此朝向的结构与连接点代表开发者协作。图标不依赖汉字细节，缩小后也可以辨认。

主色为紫色 `#9F8CFF`、浅薄荷绿 `#BCF879`，深色底为 `#090C12`。这些是本社区的视觉标识，不代表微软官方品牌或认证。

| 文件 | 建议用途 |
| --- | --- |
| `logo-symbol.svg` | 深色背景上的透明彩色标志 |
| `logo-light.svg` | 深色背景上的浅色单色标志 |
| `logo-dark.svg` | 白色或浅色背景上的深色单色标志 |
| `logo-1024.png` | 1024 × 1024 透明彩色 PNG，适合深色背景 |
| `logo-square-1024.png` | 1024 × 1024 深色底方形图标 |
| `nuget-icon.png` | 256 × 256 NuGet 包图标，PNG，小于 1 MB |
| `nuget-icon-128.png` | 128 × 128 NuGet 包图标，适合偏好官方建议尺寸的场景 |
| `github-avatar.png` | 512 × 512 GitHub 组织头像，已保留圆形裁切安全距离 |
| `website-icon-180.png` | Apple Touch 图标 |
| `website-icon-192.png`、`website-icon-512.png` | 网站与 Web Manifest 图标 |
| `favicon.svg`、`favicon.ico` | 浏览器标签页图标，ICO 内含 16 和 32 像素图像 |

保持图标比例，不旋转或拉伸。图形周围至少保留图标宽度 12% 的空白；圆形头像建议直接使用提供的 GitHub 文件。彩色透明图标中 N 为浅色，在浅底上请使用深色单色版或带深色底的 PNG。

在 NuGet 包的项目文件中，可加入：

```xml
<PropertyGroup>
  <PackageIcon>icon.png</PackageIcon>
</PropertyGroup>
<ItemGroup>
  <None Include="icon.png" Pack="true" PackagePath="/" />
</ItemGroup>
```

将 `nuget-icon.png` 复制为该项目中的 `icon.png`。已有包需在下次正常发布新版本时带上图标；图标文件本身不会修改已发布版本。

官方接入参考：[NuGet PackageIcon](https://learn.microsoft.com/en-us/nuget/reference/msbuild-targets#packageicon)。GitHub 组织头像可在组织设置的 Profile 页面上传 `github-avatar.png`；组织 README 的横幅使用 `github-banner.svg`。

所有文件位于官网 `/brand/` 资源目录，可下载 `dotnet-community-brand-kit.zip`。不应将该图标用于暗示社区未提供的背书或项目归属。

## 重新生成

已安装本项目开发依赖及 Microsoft Edge 时运行：

```sh
node scripts/generate-brand-assets.mjs
```

也可通过 `PLAYWRIGHT_CHANNEL` 选择已经安装的浏览器通道。源图形位于 `src/brand-mark.mjs`，采用原生 SVG；导出使用浏览器栅格化，不依赖生产环境 npm 包。压缩包采用标准 ZIP 格式，脚本会检查 PNG 签名、尺寸及 NuGet 图标体积。
