import type { AutomergeUrl } from "@automerge/automerge-repo";
import { useDocument } from "@automerge/automerge-repo-solid-primitives";
import type { Workspace } from "@mymark/common/repo";
import { useSelectedFile } from "../contexts/selected-file";
import { getSelectedNote } from "../utils/note-utils";

export const useSelectedNote = (docUrl: AutomergeUrl) => {
	const [selectedFileId] = useSelectedFile();
	const [doc] = useDocument<Workspace>(() => docUrl);

	const selectedNote = () => getSelectedNote(doc(), selectedFileId());

	return selectedNote;
};
