import { createContext, useContext, createSignal, type Component, type JSX } from "solid-js";
import type { Accessor, Setter } from "solid-js";

type SelectedFileContextType = [
  Accessor<string | null>,
  Setter<string | null>
];

const SelectedFileContext = createContext<SelectedFileContextType>();

export const SelectedFileProvider: Component<{ children: JSX.Element }> = (props) => {
  const [selectedFileId, setSelectedFileId] = createSignal<string | null>(null);

  return (
    <SelectedFileContext.Provider value={[selectedFileId, setSelectedFileId]}>
      {props.children}
    </SelectedFileContext.Provider>
  );
};

export const useSelectedFile = () => {
  const context = useContext(SelectedFileContext);
  if (!context) {
    throw new Error("useSelectedFile must be used within a SelectedFileProvider");
  }
  return context;
};
