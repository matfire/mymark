import type { Item, Workspace } from "@mymark/common/repo";
import JSZip from "jszip";

// Characters that are illegal in filenames on various operating systems
const ILLEGAL_CHARS = /[<>:"/\\|?*]/g;

/**
 * Sanitize a string to be safe for use as a filename.
 * Removes/replaces problematic characters.
 */
export function sanitizeFilename(name: string): string {
	if (!name || !name.trim()) {
		return "untitled";
	}

	return name
		.trim()
		.replace(ILLEGAL_CHARS, "_") // Replace illegal characters
		.replace(/\.+$/g, "") // Remove trailing dots
		.replace(/\s+/g, " ") // Normalize whitespace
		.slice(0, 200); // Limit length
}

/**
 * Track used names in a directory to handle duplicates
 */
function getUniqueName(
	baseName: string,
	extension: string,
	usedNames: Set<string>,
): string {
	let name = `${baseName}${extension}`;
	let counter = 1;

	while (usedNames.has(name.toLowerCase())) {
		name = `${baseName} (${counter})${extension}`;
		counter++;
	}

	usedNames.add(name.toLowerCase());
	return name;
}

/**
 * Recursively add items to a ZIP folder
 */
function addItemToZip(zip: JSZip, item: Item, usedNames: Set<string>): void {
	if (item.type === "note") {
		const sanitized = sanitizeFilename(item.title);
		const filename = getUniqueName(sanitized, ".md", usedNames);
		zip.file(filename, item.content || "");
	} else if (item.type === "folder") {
		const sanitized = sanitizeFilename(item.name);
		const folderName = getUniqueName(sanitized, "", usedNames);
		const folder = zip.folder(folderName);

		if (folder) {
			const childUsedNames = new Set<string>();
			for (const child of item.children) {
				addItemToZip(folder, child, childUsedNames);
			}
		}
	}
}

/**
 * Generate a ZIP blob from a workspace
 */
export async function exportWorkspaceAsZip(
	workspace: Workspace,
): Promise<Blob> {
	const zip = new JSZip();
	const usedNames = new Set<string>();

	// Add all children of the root folder
	for (const item of workspace.root.children) {
		addItemToZip(zip, item, usedNames);
	}

	return zip.generateAsync({ type: "blob" });
}

/**
 * Trigger a browser download for a blob
 */
export function downloadBlob(blob: Blob, filename: string): void {
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}

/**
 * Main export function - generates and downloads the workspace as a ZIP
 */
export async function downloadWorkspace(workspace: Workspace): Promise<void> {
	const blob = await exportWorkspaceAsZip(workspace);
	const date = new Date().toISOString().split("T")[0];
	const filename = `mymark-export-${date}.zip`;
	downloadBlob(blob, filename);
}
