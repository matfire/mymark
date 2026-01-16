// Discriminated union type for all items
export type Item = Note | Folder;
// Note with rich text content (Next API uses strings)
export interface Note {
	type: "note";
	id: string;
	title: string;
	content: string; // Markdown text
	createdAt: Date;
	updatedAt: Date;
	parentId: string | null;
}
// Folder with hierarchical children
export interface Folder {
	type: "folder";
	id: string;
	name: string;
	children: Item[]; // Nested notes and folders
	createdAt: Date;
	updatedAt: Date;
	parentId: string | null;
}
// Root workspace document
export interface Workspace {
	root: Folder;
	version: number;
}
