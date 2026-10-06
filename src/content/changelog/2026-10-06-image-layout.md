---
version: "v1.1.0"
date: 2026-10-06
type: feature
description: 支持后台调整图片尺寸、图片组排版和手机横向滑动。
---

## 图片排版与换图

- 支持单图宽度和对齐，多图网格、横向滑动，以及电脑横排／手机滑动。
- 后台的“已插入图片”提供编辑／换图入口，可替换链接、上传替换、修改说明和排列顺序。
- 图片保持比例；修改文章引用不修改或删除图床原图。
- 使用受保护的 image-layout 源码保存设置，说明仅作为文本，不执行用户 HTML。
- 图片排版插件：`src/plugins/image-layout.mjs:1`；样式：`src/styles/components/image-layout.css:1`。
