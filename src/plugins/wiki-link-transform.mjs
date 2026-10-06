const wikiPattern = /!?\[\[([^[\]\r\n]+)\]\]/g;
const skipped = new Set([
	"link",
	"linkReference",
	"code",
	"inlineCode",
	"html",
	"mdxJsxFlowElement",
	"mdxJsxTextElement",
]);

function hasControl(value) {
	return [...value].some(
		(character) =>
			character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127,
	);
}

function parse(value) {
	const parts = value.split("|");
	if (parts.length > 2) return;
	const destination = parts[0].trim();
	const hash = destination.indexOf("#");
	const target = (hash < 0 ? destination : destination.slice(0, hash)).replace(
		/\.(md|mdx|markdown)$/i,
		"",
	);
	const heading = hash < 0 ? "" : destination.slice(hash + 1);
	if (
		!target ||
		target.includes("\\") ||
		/[<>:]/.test(target) ||
		hasControl(target) ||
		target.split("/").some((part) => !part || part === "." || part === "..")
	)
		return;
	return { target, heading, alias: (parts[1] ?? "").trim() };
}
function resolve(posts, target) {
	for (const predicate of [
		(post) => post.slug === target,
		(post) => post.path === target,
		(post) => post.path.split("/").at(-1) === target,
	]) {
		const matches = posts.filter(predicate);
		if (matches.length === 1) return matches[0];
		if (matches.length > 1) return;
	}
}
const text = (value) => ({ type: "text", value: String(value) });
const element = (tagName, properties, children) => ({
	type: "element",
	tagName,
	properties,
	children,
});
function safeImage(value) {
	if (typeof value !== "string" || value.includes("\\")) return;
	if (/^\/(?!\/)/.test(value)) return value;
	try {
		const url = new URL(value);
		if (url.protocol === "https:" && !url.username && !url.password)
			return url.href;
	} catch {
		return;
	}
}
function displayTitle(parsed, post) {
	const aliasIsPath =
		parsed.alias === parsed.target ||
		parsed.alias === parsed.target.split("/").at(-1);
	return parsed.alias && !aliasIsPath ? parsed.alias : post.title;
}
function href(post, heading, slugify, base) {
	const id = post.slug;
	if (
		!id ||
		id.split("/").some((part) => !part || part === "." || part === "..") ||
		id.includes("\\") ||
		hasControl(id)
	)
		return;
	return `${base.replace(/\/$/, "")}/posts/${id.split("/").map(encodeURIComponent).join("/")}/${heading ? `#${encodeURIComponent(slugify(heading))}` : ""}`;
}
function card(parsed, post, url) {
	const content = [
		element("span", { className: ["newfirefly-wiki-title"] }, [
			text(displayTitle(parsed, post)),
		]),
	];
	if (post.description)
		content.push(
			element("span", { className: ["newfirefly-wiki-description"] }, [
				text(post.description),
			]),
		);
	const metadata = [post.published, post.category, ...(post.tags ?? [])]
		.filter(Boolean)
		.join(" · ");
	if (metadata)
		content.push(
			element("span", { className: ["newfirefly-wiki-meta"] }, [
				text(metadata),
			]),
		);
	const children = [
		element("span", { className: ["newfirefly-wiki-content"] }, content),
	];
	const image = safeImage(post.image);
	if (image)
		children.unshift(
			element(
				"img",
				{
					src: image,
					alt: "",
					loading: "lazy",
					className: ["newfirefly-wiki-cover"],
				},
				[],
			),
		);
	return {
		type: "paragraph",
		data: {
			hName: "a",
			hProperties: {
				href: url,
				className: ["newfirefly-wiki-card", "no-styling"],
			},
			hChildren: children,
		},
		children: [text(displayTitle(parsed, post))],
	};
}
export function transformWikiLinks(
	tree,
	posts,
	{ slugify, base = "/", source = "" },
) {
	function replacement(value, standalone = false) {
		const parsed = parse(value);
		if (!parsed) return;
		const post = resolve(
			posts.filter((item) => !item.draft),
			parsed.target,
		);
		if (!post) return;
		const url = href(post, parsed.heading, slugify, base);
		if (!url) return;
		if (standalone && !parsed.heading) return card(parsed, post, url);
		return { type: "link", url, children: [text(displayTitle(parsed, post))] };
	}
	function visit(node) {
		if (skipped.has(node.type) || !node.children) return;
		const children = [];
		for (const child of node.children) {
			const raw = source.slice(
				child.position?.start?.offset ?? 0,
				child.position?.end?.offset ?? source.length,
			);
			if (
				child.type === "paragraph" &&
				child.children?.length === 1 &&
				child.children[0].type === "text"
			) {
				const standalone = /^\[\[([^[\]\r\n]+)\]\]$/.exec(
					child.children[0].value.trim(),
				);
				if (standalone && !raw.includes(`\\${standalone[0]}`)) {
					const next = replacement(standalone[1], true);
					if (next) {
						children.push(next);
						continue;
					}
				}
			}
			if (child.type !== "text") {
				visit(child);
				children.push(child);
				continue;
			}
			let cursor = 0;
			for (const match of child.value.matchAll(wikiPattern)) {
				if (match[0].startsWith("!") || raw.includes(`\\${match[0]}`)) continue;
				const next = replacement(match[1]);
				if (!next) continue;
				if (match.index > cursor)
					children.push(text(child.value.slice(cursor, match.index)));
				children.push(next);
				cursor = match.index + match[0].length;
			}
			if (!cursor) children.push(child);
			else if (cursor < child.value.length)
				children.push(text(child.value.slice(cursor)));
		}
		node.children = children;
	}
	visit(tree);
}
