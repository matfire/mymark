import type { Item, Note, Workspace } from "@mymark/common/repo";

export const findNoteById = (item: Item, noteId: string): Note | null => {
  if (item.type === "note") {
    if (item.id === noteId) return item;
  } else if (item.type === "folder") {
    for (const child of item.children) {
      const found = findNoteById(child, noteId);
      if (found) return found;
    }
  }
  return null;
};

export const getSelectedNote = (
  workspace: Workspace | undefined,
  selectedFileId: string | null,
): Note | null => {
  if (!workspace || !selectedFileId) return null;
  return findNoteById(workspace.root, selectedFileId);
};

export const updateNoteContent = (
  workspace: Workspace,
  noteId: string,
  content: string,
) => {
  const note = findNoteById(workspace.root, noteId);
  if (note) {
    note.content = content;
    note.updatedAt = new Date();
  }
};

export const updateNoteTitle = (
  workspace: Workspace,
  noteId: string,
  title: string,
) => {
  const note = findNoteById(workspace.root, noteId);
  if (note) {
    note.title = title;
    note.updatedAt = new Date();
  }
};
