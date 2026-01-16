import type { AutomergeUrl } from "@automerge/automerge-repo";
import { useDocHandle } from "@automerge/automerge-repo-solid-primitives";
import type { Workspace } from "@mymark/common/repo";
import { updateNoteContent, updateNoteTitle } from "../utils/note-utils";

export const useUpdateNote = (docUrl: AutomergeUrl) => {
  const handle = useDocHandle<Workspace>(() => docUrl);

  const updateContent = (noteId: string, content: string) => {
    handle()?.change((doc) => {
      updateNoteContent(doc, noteId, content);
    });
  };

  const updateTitle = (noteId: string, title: string) => {
    handle()?.change((doc) => {
      updateNoteTitle(doc, noteId, title);
    });
  };

  return { updateContent, updateTitle };
};
