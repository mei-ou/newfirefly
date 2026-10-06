import { readdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import matter from "gray-matter";
import { transformWikiLinks } from "./wiki-link-transform.mjs";

const require = createRequire(import.meta.url);
const astroRequire = createRequire(require.resolve("astro/package.json"));
const { slug: slugify } = await import(
	pathToFileURL(astroRequire.resolve("github-slugger")).href
);
const defaultDirectory = fileURLToPath(
	new URL("../content/posts/", import.meta.url),
);

export function remarkAdminWikiLink(options = {}) {
	const directory = options.postsDir ?? defaultDirectory;
	let lastRead = 0;
	let posts = [];
	function readPosts() {
		if (Date.now() - lastRead < 1000) return posts;
		const next = [];
		function scan(folder) {
			for (const entry of readdirSync(folder, { withFileTypes: true })) {
				if (entry.name.startsWith(".")) continue;
				const filename = path.join(folder, entry.name);
				if (entry.isDirectory()) {
					scan(filename);
					continue;
				}
				if (!entry.isFile() || !/\.(md|mdx|markdown)$/i.test(entry.name))
					continue;
				const { data } = matter(readFileSync(filename, "utf8"));
				const contentPath = path
					.relative(directory, filename)
					.split(path.sep)
					.join("/")
					.replace(/\.(md|mdx|markdown)$/i, "");
				const slug =
					typeof data.slug === "string" && data.slug.trim()
						? data.slug.trim()
						: contentPath
								.split("/")
								.map((segment) => slugify(segment))
								.join("/")
								.replace(/\/index$/, "");
				const date =
					data.published instanceof Date
						? data.published
						: new Date(data.published);
				next.push({
					path: contentPath,
					slug,
					title: String(data.title ?? contentPath),
					description: String(data.description ?? ""),
					image: data.image,
					draft: data.draft === true,
					published: Number.isNaN(date.getTime())
						? ""
						: date.toISOString().slice(0, 10),
					category: contentPath.includes("/")
						? contentPath.split("/").slice(0, -1).join(" / ")
						: "",
					tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
				});
			}
		}
		scan(directory);
		posts = next;
		lastRead = Date.now();
		return posts;
	}
	return (tree, file) =>
		transformWikiLinks(tree, readPosts(), {
			slugify,
			base: options.base ?? "/",
			source: String(file.value ?? ""),
		});
}
