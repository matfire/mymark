import { useDocument } from "@automerge/automerge-repo-solid-primitives";
import { type AutomergeUrl } from "@automerge/automerge-repo";
import {
  type Item,
  type Folder,
  type Note,
  type Workspace,
} from "@mymark/common/repo";
import { For, Show, createSignal, type Component } from "solid-js";
import {
  FiFile,
  FiFolder,
  FiFolderPlus,
  FiFilePlus,
  FiChevronRight,
  FiChevronDown,
  FiTrash2,
} from "solid-icons/fi";
import { useSelectedFile } from "../contexts/selected-file";

interface TreeItemProps {
  item: Item;
  level?: number;
  onCreateNote: (parentId: string) => void;
  onCreateFolder: (parentId: string) => void;
  onDelete: (itemId: string) => void;
}

const TreeItem: Component<TreeItemProps> = (props) => {
  const [expanded, setExpanded] = createSignal(props.level === 0);
  const [selectedFileId, setSelectedFileId] = useSelectedFile();
  const isFolder = () => props.item.type === "folder";
  const isSelected = () => !isFolder() && selectedFileId() === props.item.id;

  const handleClick = () => {
    if (isFolder()) {
      setExpanded(!expanded());
    } else {
      setSelectedFileId(props.item.id);
    }
  };

  return (
    <div class="select-none">
      <div
        class={`file-tree-item flex items-center gap-1 py-1.5 px-2 rounded-md cursor-pointer group ${
          isSelected() ? "file-tree-item-selected" : "hover:bg-base-300/30"
        }`}
        onClick={handleClick}
      >
        <Show when={isFolder()}>
          <button
            class="p-0.5 hover:bg-base-300/50 rounded transition-colors text-base-content/50"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded());
            }}
          >
            {expanded() ? (
              <FiChevronDown size={14} />
            ) : (
              <FiChevronRight size={14} />
            )}
          </button>
        </Show>
        <Show when={!isFolder()}>
          <span class="w-5" />
        </Show>

        <Show when={isFolder()}>
          <FiFolder class="text-primary shrink-0" size={16} />
        </Show>
        <Show when={!isFolder()}>
          <FiFile class="text-secondary/70 shrink-0" size={16} />
        </Show>

        <span class="flex-1 text-sm truncate text-base-content/90">
          {isFolder()
            ? (props.item as Folder).name
            : (props.item as Note).title}
        </span>

        <Show when={isFolder()}>
          <div class="hidden group-hover:flex items-center gap-0.5">
            <button
              class="p-1 hover:bg-primary/20 hover:text-primary rounded transition-colors"
              title="New Folder"
              onClick={(e) => {
                e.stopPropagation();
                props.onCreateFolder(props.item.id);
              }}
            >
              <FiFolderPlus size={14} />
            </button>
            <button
              class="p-1 hover:bg-primary/20 hover:text-primary rounded transition-colors"
              title="New Note"
              onClick={(e) => {
                e.stopPropagation();
                props.onCreateNote(props.item.id);
              }}
            >
              <FiFilePlus size={14} />
            </button>
          </div>
        </Show>

        <button
          class="hidden group-hover:block p-1 hover:bg-error/20 hover:text-error rounded transition-colors"
          title="Delete"
          onClick={(e) => {
            e.stopPropagation();
            props.onDelete(props.item.id);
          }}
        >
          <FiTrash2 size={14} />
        </button>
      </div>

      <Show when={isFolder() && expanded()}>
        <div class="pl-4 file-tree-indent">
          <For each={(props.item as Folder).children}>
            {(child) => (
              <TreeItem
                item={child}
                level={(props.level || 0) + 1}
                onCreateNote={props.onCreateNote}
                onCreateFolder={props.onCreateFolder}
                onDelete={props.onDelete}
              />
            )}
          </For>
        </div>
      </Show>
    </div>
  );
};

interface FileTreeProps {
  docUrl: string;
}

export const FileTree: Component<FileTreeProps> = (props) => {
  const [doc, handle] = useDocument<Workspace>(
    () => props.docUrl as AutomergeUrl,
  );
  const [selectedFileId, setSelectedFileId] = useSelectedFile();
  const [newItemName, setNewItemName] = createSignal("");
  const [creatingType, setCreatingType] = createSignal<
    "file" | "folder" | null
  >(null);
  const [parentIdForCreation, setParentIdForCreation] = createSignal<
    string | null
  >(null);

  const findFolderById = (item: Item, id: string): Folder | null => {
    if (item.type === "folder") {
      if (item.id === id) return item;
      for (const child of item.children) {
        const found = findFolderById(child, id);
        if (found) return found;
      }
    }
    return null;
  };

  const findParentOfItem = (item: Item, itemId: string): Folder | null => {
    if (item.type === "folder") {
      for (const child of item.children) {
        if (child.id === itemId) return item;
        const found = findParentOfItem(child, itemId);
        if (found) return found;
      }
    }
    return null;
  };

  const startCreating = (type: "file" | "folder", parentId: string) => {
    setCreatingType(type);
    setParentIdForCreation(parentId);
    setNewItemName("");
  };

  const createItem = () => {
    const name = newItemName();
    if (!name || !parentIdForCreation() || !handle()) return;

    handle()?.change((doc) => {
      const parentFolder = findFolderById(doc.root, parentIdForCreation()!);
      if (!parentFolder) return;

      const newItemId = crypto.randomUUID();
      const now = new Date();

      if (creatingType() === "folder") {
        const newFolder: Folder = {
          type: "folder",
          id: newItemId,
          name: name,
          children: [],
          createdAt: now,
          updatedAt: now,
          parentId: parentFolder.id,
        };
        parentFolder.children.push(newFolder);
      } else {
        const newNote: Note = {
          type: "note",
          id: newItemId,
          title: name,
          content: "",
          createdAt: now,
          updatedAt: now,
          parentId: parentFolder.id,
        };
        parentFolder.children.push(newNote);
      }
    });

    setCreatingType(null);
    setParentIdForCreation(null);
    setNewItemName("");
  };

  const cancelCreation = () => {
    setCreatingType(null);
    setParentIdForCreation(null);
    setNewItemName("");
  };

  const deleteItem = (itemId: string) => {
    if (!handle()) return;

    handle()?.change((doc) => {
      const parentFolder = findParentOfItem(doc.root, itemId);
      if (!parentFolder) return;

      const index = parentFolder.children.findIndex(
        (child) => child.id === itemId,
      );
      if (index !== -1) {
        parentFolder.children.splice(index, 1);
      }
    });

    if (selectedFileId() === itemId) {
      setSelectedFileId(null);
    }
  };

  return (
    <div class="h-full flex flex-col">
      <div class="p-4 border-b border-primary/10">
        <h2 class="font-heading text-xs font-semibold uppercase tracking-widest text-primary/80">
          Files
        </h2>
      </div>

      <div class="flex-1 overflow-y-auto p-2">
        <Show when={doc()}>
          {(workspace) => (
            <div>
              <TreeItem
                item={workspace().root}
                level={0}
                onCreateNote={(parentId) => startCreating("file", parentId)}
                onCreateFolder={(parentId) => startCreating("folder", parentId)}
                onDelete={deleteItem}
              />

              <Show when={creatingType() && parentIdForCreation()}>
                <div class="mt-3 p-3 glass-card rounded-lg">
                  <input
                    type="text"
                    value={newItemName()}
                    onInput={(e) => setNewItemName(e.currentTarget.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") createItem();
                      if (e.key === "Escape") cancelCreation();
                    }}
                    placeholder={`${creatingType() === "folder" ? "Folder" : "File"} name`}
                    class="input input-bordered input-sm w-full mb-2 bg-base-200/50"
                    autofocus={true}
                  />
                  <div class="flex gap-2">
                    <button
                      class="btn btn-primary btn-sm flex-1 btn-glow"
                      onClick={createItem}
                      disabled={!newItemName()}
                    >
                      Create
                    </button>
                    <button
                      class="btn btn-ghost btn-sm"
                      onClick={cancelCreation}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </Show>
            </div>
          )}
        </Show>
      </div>
    </div>
  );
};
