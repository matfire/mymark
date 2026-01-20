import {
	autocompletion,
	closeBrackets,
	closeBracketsKeymap,
	completionKeymap,
} from "@codemirror/autocomplete";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { markdown } from "@codemirror/lang-markdown";
import {
	bracketMatching,
	foldGutter,
	foldKeymap,
	HighlightStyle,
	indentOnInput,
	syntaxHighlighting,
} from "@codemirror/language";
import { languages } from "@codemirror/language-data";
import { highlightSelectionMatches, searchKeymap } from "@codemirror/search";
import {
	Compartment,
	EditorState,
	type Extension,
	StateEffect,
} from "@codemirror/state";
import {
	drawSelection,
	dropCursor,
	EditorView,
	highlightActiveLine,
	highlightActiveLineGutter,
	highlightSpecialChars,
	keymap,
	lineNumbers,
} from "@codemirror/view";
import { tags } from "@lezer/highlight";
import { type Accessor, createEffect, on, onCleanup, onMount } from "solid-js";

interface CodeMirrorProps {
	/**
	 * The initial value of the editor, or a reactive getter function.
	 */
	value?: string | (() => string);
	/**
	 * Called whenever the editor code value changes.
	 */
	onValueChange?: (value: string) => void;
	/**
	 * Called when the editor first mounts, receiving the current EditorView instance.
	 */
	onEditorMount?: (editor: EditorView) => void;
}

function createThemeExtension() {
	const theme = EditorView.theme(
		{
			"&": {
				backgroundColor: "var(--color-base-100)",
				color: "var(--color-base-content)",
			},
			".cm-gutters": {
				backgroundColor: "var(--color-base-200)",
				color: "var(--color-base-content)",
				border: "none",
			},
			".cm-activeLineGutter": {
				backgroundColor: "var(--color-base-200)",
				color: "var(--color-base-content)",
			},
			".cm-activeLine": {
				backgroundColor: "var(--color-base-200)",
			},
			".cm-selectionBackground, ::selection": {
				backgroundColor: "var(--color-primary)",
			},
			"&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, &.cm-focused .cm-selectionBackground, & ::selection":
				{
					backgroundColor: "var(--color-primary)",
					opacity: "0.3",
				},
		},
		{ dark: false },
	);

	return theme;
}

const markdownHighlightStyle = HighlightStyle.define([
	{ tag: tags.keyword, color: "#c792ea" },
	{ tag: tags.operator, color: "#89ddff" },
	{ tag: tags.special(tags.variableName), color: "#eeffff" },
	{ tag: tags.typeName, color: "#ffcb6b" },
	{ tag: tags.atom, color: "#f78c6c" },
	{ tag: tags.number, color: "#f78c6c" },
	{ tag: tags.definition(tags.variableName), color: "#82aaff" },
	{ tag: tags.string, color: "#c3e88d" },
	{ tag: tags.special(tags.string), color: "#c3e88d" },
	{ tag: tags.comment, color: "#637777", fontStyle: "italic" },
	{ tag: tags.variableName, color: "#eeffff" },
	{ tag: tags.tagName, color: "#f07178" },
	{ tag: tags.bracket, color: "#89ddff" },
	{ tag: tags.meta, color: "#ffcb6b" },
	{ tag: tags.attributeName, color: "#c792ea" },
	{ tag: tags.propertyName, color: "#82aaff" },
	{ tag: tags.className, color: "#ffcb6b" },
	{ tag: tags.invalid, color: "#ff5370" },
	{
		tag: tags.heading1,
		fontSize: "1.75rem",
		fontWeight: "700",
		color: "#d4a574",
		fontFamily: '"Fraunces", Georgia, serif',
		textDecoration: "none",
	},
	{
		tag: tags.heading2,
		fontSize: "1.5rem",
		fontWeight: "600",
		color: "rgba(212, 165, 116, 0.9)",
		fontFamily: '"Fraunces", Georgia, serif',
		textDecoration: "none",
	},
	{
		tag: tags.heading3,
		fontSize: "1.25rem",
		fontWeight: "600",
		color: "rgba(212, 165, 116, 0.8)",
		fontFamily: '"Fraunces", Georgia, serif',
		textDecoration: "none",
	},
	{
		tag: tags.heading4,
		fontSize: "1.125rem",
		fontWeight: "500",
		color: "rgba(212, 165, 116, 0.7)",
		fontFamily: '"Fraunces", Georgia, serif',
		textDecoration: "none",
	},
	{
		tag: tags.heading5,
		fontSize: "1rem",
		fontWeight: "500",
		color: "rgba(212, 165, 116, 0.6)",
		fontFamily: '"Fraunces", Georgia, serif',
		textDecoration: "none",
	},
	{
		tag: tags.heading6,
		fontSize: "0.9375rem",
		fontWeight: "500",
		color: "rgba(212, 165, 116, 0.5)",
		fontFamily: '"Fraunces", Georgia, serif',
		textDecoration: "none",
	},
	{
		tag: tags.processingInstruction,
		color: "rgba(212, 165, 116, 0.4)",
	},
	{
		tag: tags.link,
		color: "#7da4c9",
		textDecoration: "none",
	},
	{
		tag: tags.url,
		color: "rgba(125, 164, 201, 0.7)",
	},
	{
		tag: tags.labelName,
		color: "rgba(125, 164, 201, 0.7)",
	},
]);

export function createCodeMirror(
	props: CodeMirrorProps,
	ref: Accessor<HTMLDivElement | undefined>,
) {
	let view: EditorView | undefined;
	const themeExtension = createThemeExtension();

	const getValue = (): string => {
		const value = props.value;
		if (typeof value === "function") {
			return value();
		}
		return value ?? "";
	};

	onMount(() => {
		const state = EditorState.create({
			doc: getValue(),
			extensions: [
				lineNumbers(),
				foldGutter(),
				highlightSpecialChars(),
				history(),
				drawSelection(),
				dropCursor(),
				EditorState.allowMultipleSelections.of(true),
				indentOnInput(),
				syntaxHighlighting(markdownHighlightStyle),
				bracketMatching(),
				closeBrackets(),
				autocompletion(),
				highlightActiveLine(),
				highlightActiveLineGutter(),
				highlightSelectionMatches(),
				markdown({ codeLanguages: languages }),
				themeExtension,
				keymap.of([
					...closeBracketsKeymap,
					...defaultKeymap,
					...searchKeymap,
					...historyKeymap,
					...foldKeymap,
					...completionKeymap,
				]),
			],
		});

		// Construct a new EditorView instance
		view = new EditorView({
			state,
			parent: ref(),
			dispatch: (tr): void => {
				if (!view) return;

				view.update([tr]);

				if (tr.docChanged) {
					const newCode = tr.newDoc.sliceString(0, tr.newDoc.length);
					props.onValueChange?.(newCode);
				}
			},
		});

		props.onEditorMount?.(view);

		// Set up a mutation observer to watch for theme changes
		const observer = new MutationObserver((mutations) => {
			for (const mutation of mutations) {
				if (
					mutation.type === "attributes" &&
					mutation.attributeName === "data-theme"
				) {
					if (view) {
						view.requestMeasure();
					}
					break;
				}
			}
		});

		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["data-theme"],
		});

		onCleanup(() => {
			if (!view) return;
			observer.disconnect();
			view.destroy();
		});
	});

	createEffect(
		on(
			getValue,
			(value) => {
				if (!view || value === view.state.doc.toString()) {
					return;
				}
				view.dispatch({
					changes: {
						from: 0,
						to: view.state.doc.length,
						insert: value,
					},
				});
			},
			{ defer: true },
		),
	);

	function createExtension(extension: Extension) {
		const compartment = new Compartment();

		onMount(() => {
			if (!view) return;

			view.dispatch({
				effects: StateEffect.appendConfig.of(compartment.of(extension)),
			});
		});

		function reconfigure(extension: Extension) {
			if (!view) return;

			view.dispatch({
				effects: compartment.reconfigure(extension),
			});
		}

		return reconfigure;
	}

	return { createExtension };
}
