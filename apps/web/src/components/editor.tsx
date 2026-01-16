import { createCodeMirror } from "../hooks/createCodemirror";
import { useSelectedNote } from "../hooks/use-selected-note";
import { useUpdateNote } from "../hooks/use-update-note";
import { repo } from "../sync/repo";
import { getOrCreateRoot } from "../sync/utils";

export const Editor = () => {
  let editorRef: HTMLDivElement | undefined;
  const note = useSelectedNote(getOrCreateRoot(repo));
  const { updateContent } = useUpdateNote(getOrCreateRoot(repo));
  
  const noteContent = () => note()?.content ?? "";
  
  createCodeMirror(
    {
      value: noteContent,
      onValueChange: (v) => {
        updateContent(note()?.id ?? "", v);
      },
    },
    () => editorRef,
  );
  return (
    <div class="h-full w-full">
      <div ref={editorRef} class="codemirror-editor-wrapper h-full"></div>
    </div>
  );
};
