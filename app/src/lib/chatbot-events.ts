const OPEN_EVENT = "open-ai-assistant";

export function openAiAssistant() {
  window.dispatchEvent(new CustomEvent(OPEN_EVENT));
}

export function onOpenAiAssistant(handler: () => void) {
  window.addEventListener(OPEN_EVENT, handler);
  return () => window.removeEventListener(OPEN_EVENT, handler);
}
