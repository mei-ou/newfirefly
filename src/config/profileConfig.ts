import type { ProfileConfig } from "../types/config";

export const profileConfig: ProfileConfig = {
	// 头像
	// 图片路径支持三种格式：
	// 1. public 目录（以 "/" 开头，不优化）："/assets/images/avatar.webp"
	// 2. src 目录（不以 "/"开头，自动优化但会增加构建时间，推荐）："assets/images/avatar.webp"
	// 3. 远程 URL："https://example.com/avatar.jpg"
	avatar: "/assets/ziyuan/tx.webp",

	// 下班时间头像（为空则始终使用上方 avatar）
	avatarOffWork: "",

	// 名字
	name: "meiou",

	// 首页展示名字（留空则使用 name）
	displayName: "ATGC",

	// 职业/身份标签
	occupation: "[干饭纪录保持者]",

	// 个人签名（支持多条，会循环打字+删除效果）
	bio: ["如果你喜欢，那么欢迎来到我的世界！", "海棠花未眠，老陈总在我身边"],

	// 链接配置
	// 已经预装的图标集：fa7-brands，fa7-regular，fa7-solid，material-symbols，simple-icons
	// 访问https://icones.js.org/ 获取图标代码，
	// 如果想使用尚未包含相应的图标集，则需要安装它
	// `pnpm add @iconify-json/<icon-set-name>`
	// showName: true 时显示图标和名称，false 时只显示图标
	links: [
		{
			name: "WeChat",
			icon: "simple-icons:wechat",
			url: "/assets/ziyuan/vx.webp",
			showName: false,
		},
		{
			name: "QQ",
			icon: "simple-icons:tencentqq",
			url: "/assets/ziyuan/qq.webp",
			showName: false,
		},
		{
			name: "GitHub",
			icon: "simple-icons:github",
			url: "https://github.com/tianshihao2003",
			showName: false,
		},
		{
			name: "Email",
			icon: "material-symbols:mail-outline",
			url: "mailto:3109581507@qq.com",
			showName: false,
		},
		{
			name: "Bilibili",
			icon: "simple-icons:bilibili",
			url: "https://space.bilibili.com/1394731616?spm_id_from=333.1007.0.0",
			showName: false,
		},
	],
};
