---
version: "v1.0.0"
date: 2026-10-05
type: feature
description: 支持网页后台插入的 Wiki Link 文字链接和文章卡片。
---

## Wiki Link 文章链接

- `[[文章路径]]` 单独成段显示文章卡片，包含标题、摘要及可用的封面、日期、分类和标签。
- 在正文中使用 Wiki Link 时显示文字链接；可自定义显示标题或链接到文章标题锚点。
- 可按已有 slug、文章完整路径或唯一文件名匹配，链接不绑定当前博客域名。
- 不转换代码或已有链接中的示例，不公开草稿信息；无法匹配时保留原文。
- 插件：`src/plugins/remark-admin-wiki-link.mjs:1`，卡片样式：`src/styles/components/wiki-link-card.css:1`。
- 2026-10-06 已完成本地构建及渲染验收，代码示例不会被转换；尚未部署到线上。
