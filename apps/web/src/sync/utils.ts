import type { AutomergeUrl, Repo } from "@automerge/automerge-repo";
import type { Workspace } from "@mymark/common/repo";
export const ROOT_DOC_URL_KEY = "vivamark-root-doc-url";

export const getOrCreateRoot = (repo: Repo): AutomergeUrl => {
  // Check if we already have a root document
  const existingUrl = localStorage.getItem(ROOT_DOC_URL_KEY);
  if (existingUrl) {
    return existingUrl as AutomergeUrl;
  }
  // Otherwise create one and (synchronously) store it
  const root = repo.create<Workspace>({
    version: 1,
    root: {
      type: "folder",
      id: crypto.randomUUID(),
      name: "root",
      children: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      parentId: null,
    },
  });
  localStorage.setItem(ROOT_DOC_URL_KEY, root.url);
  return root.url;
};
