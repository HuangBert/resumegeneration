import { t } from "./i18n";
import type { ResumeState } from "./types";
import { escapeHtml } from "./utils";

export function downloadHtml(state: ResumeState) {
  const page = document.querySelector<HTMLElement>("#resume-page");
  if (!page) {
    return;
  }

  const styles = [...document.querySelectorAll<HTMLStyleElement | HTMLLinkElement>("style, link[rel='stylesheet']")]
    .map((node) => node.outerHTML)
    .join("\n");
  const html = `<!doctype html><html lang="${state.locale}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${escapeHtml(state.name)} - ${escapeHtml(t(state.locale).appTitle)}</title>${styles}</head><body class="export-body">${page.outerHTML}</body></html>`;
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${state.name || "resume"}.html`;
  anchor.click();
  URL.revokeObjectURL(url);
}
