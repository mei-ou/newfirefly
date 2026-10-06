export interface LayoutImage {
	src: string;
	alt: string;
	title: string;
}
export interface ImageLayout {
	layout: "single" | "grid" | "swipe" | "adaptive";
	width: 25 | 50 | 75 | 100;
	align: "left" | "center" | "right";
	columns: 2 | 3 | 4;
	images: LayoutImage[];
}
export function validateImageLayout(value: unknown): ImageLayout;
export function parseImageLayout(source: string): ImageLayout | undefined;
export function remarkImageLayout(): (tree: unknown) => void;
