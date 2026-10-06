export function validateImageLayout(value) {
	if (!value || typeof value !== "object" || Array.isArray(value))
		throw new Error("图片排版数据无效。");
	const { layout, width, align, columns, images } = value;
	if (!["single", "grid", "swipe", "adaptive"].includes(layout))
		throw new Error("请选择有效的图片布局。");
	if (
		![25, 50, 75, 100].includes(width) ||
		!["left", "center", "right"].includes(align) ||
		![2, 3, 4].includes(columns)
	)
		throw new Error("图片尺寸或排列设置无效。");
	if (
		!Array.isArray(images) ||
		!images.length ||
		images.length > 20 ||
		(layout === "single" && images.length !== 1)
	)
		throw new Error("单图模式需要一张图片；图片组最多支持 20 张。");
	return {
		layout,
		width,
		align,
		columns,
		images: images.map((image) => {
			if (!image || typeof image !== "object")
				throw new Error("图片信息无效。");
			const { src, alt = "", title = "" } = image;
			if (
				typeof src !== "string" ||
				!src ||
				src.length > 2048 ||
				src.includes("\\") ||
				[...src].some(
					(character) =>
						character.charCodeAt(0) <= 32 || character.charCodeAt(0) === 127,
				)
			)
				throw new Error("图片地址无效，请使用 HTTPS 图床直链或站内绝对路径。");
			if (src.startsWith("/")) {
				if (
					src.startsWith("//") ||
					new URL(src, "https://images.invalid").origin !==
						"https://images.invalid"
				)
					throw new Error("站内图片路径无效。");
			} else {
				const url = new URL(src);
				if (
					url.protocol !== "https:" ||
					url.username ||
					url.password ||
					(url.port && url.port !== "443")
				)
					throw new Error("图片地址必须为不含凭据的 HTTPS 地址。");
			}
			if (
				typeof alt !== "string" ||
				typeof title !== "string" ||
				alt.length > 500 ||
				title.length > 500 ||
				[...(alt + title)].some(
					(character) =>
						character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127,
				)
			)
				throw new Error("图片说明不能包含换行，最多 500 字。");
			return { src, alt, title };
		}),
	};
}

export function parseImageLayout(source) {
	try {
		return validateImageLayout(JSON.parse(source));
	} catch {
		return undefined;
	}
}

const element = (tagName, properties, children = []) => ({
	type: "element",
	tagName,
	properties,
	children,
});
const text = (value) => ({ type: "text", value });

export function remarkImageLayout() {
	return (tree) => {
		function visit(node) {
			if (node.type === "code" && node.lang === "image-layout") {
				const config = parseImageLayout(node.value);
				if (!config) return;
				node.type = "paragraph";
				node.data = {
					hName: "div",
					hProperties: {
						className: [
							"admin-image-layout",
							`admin-images-${config.layout}`,
							`admin-image-width-${config.width}`,
							`admin-image-align-${config.align}`,
							`admin-image-columns-${config.columns}`,
						],
						role: config.layout === "single" ? undefined : "group",
						ariaLabel: config.layout === "single" ? undefined : "图片组",
						tabIndex:
							config.layout === "swipe" || config.layout === "adaptive"
								? 0
								: undefined,
					},
					hChildren: config.images.map((image) =>
						element("figure", { className: ["admin-image-item"] }, [
							element("img", {
								src: image.src,
								alt: image.alt,
								title: image.title || undefined,
								loading: "lazy",
								decoding: "async",
								"data-admin-layout-image": true,
							}),
							...(image.alt
								? [element("figcaption", {}, [text(image.alt)])]
								: []),
						]),
					),
				};
				node.children = [];
				return;
			}
			if (
				[
					"code",
					"inlineCode",
					"html",
					"mdxJsxFlowElement",
					"mdxJsxTextElement",
				].includes(node.type)
			)
				return;
			for (const child of node.children ?? []) visit(child);
		}
		visit(tree);
	};
}
