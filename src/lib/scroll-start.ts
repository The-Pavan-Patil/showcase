/**
 * Inline script run before the page paints (see ScrollMemory): the browser's
 * own scroll restoration is turned off, and a homepage load drops a section
 * hash so the browser does not jump to that section. Back/Forward loads keep
 * their URL; ScrollMemory restores them.
 */
export function scrollStartScript(homePath: string) {
  return `try{history.scrollRestoration="manual";if(location.hash&&location.pathname===${JSON.stringify(homePath)}){var n=performance.getEntriesByType("navigation")[0];if(!n||n.type!=="back_forward")history.replaceState(history.state,"",location.pathname+location.search)}}catch(e){}`;
}
