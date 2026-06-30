/**
 * Finds the first element matching a selector within the provided parent.
 */
export function queryElement<TElement extends Element>(
  selector: string,
  parent: ParentNode = document,
): TElement | null {
  return parent.querySelector<TElement>(selector);
}

/**
 * Returns a stable array of all elements matching a selector.
 */
export function queryElements<TElement extends Element>(
  selector: string,
  parent: ParentNode = document,
): readonly TElement[] {
  return Array.from(parent.querySelectorAll<TElement>(selector));
}

/**
 * Narrows an arbitrary value to an HTML element.
 */
export function isHTMLElement(value: unknown): value is HTMLElement {
  return value instanceof HTMLElement;
}
