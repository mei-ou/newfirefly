export interface WikiPost {
	path: string;
	slug: string;
	title: string;
	description?: string;
	tags?: string[];
	category?: string;
	image?: string;
	published?: string;
	draft?: boolean;
}
export function transformWikiLinks(
	tree: unknown,
	posts: readonly WikiPost[],
	options: {
		slugify: (value: string) => string;
		base?: string;
		source?: string;
	},
): void;
