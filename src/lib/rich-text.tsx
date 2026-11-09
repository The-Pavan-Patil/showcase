/** Wrap any phrase in **double asterisks** to render it bold. */
export function richText(input: string) {
  return input.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={index}>{part.slice(2, -2)}</strong>
    ) : (
      part
    ),
  );
}
