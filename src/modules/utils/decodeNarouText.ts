const escapedCharacters: Record<string, string> = {
	"&amp;": "&",
	"&lt;": "<",
	"&gt;": ">",
	"&quot;": '"',
	"&#039;": "'",
	"&#39;": "'",
};

/** なろうAPIのHTMLエスケープを1回だけ復元する。 */
export function decodeNarouText(text: string | undefined): string {
	return (text ?? "").replace(
		/&(amp|lt|gt|quot|#0?39);/g,
		(entity) => escapedCharacters[entity],
	);
}
