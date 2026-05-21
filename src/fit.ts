import type { Locale } from "./types";
import { t } from "./i18n";

export type FitMode = "preview" | "print";

let fitFrame = 0;

export function scheduleFitResume(locale: Locale) {
  window.cancelAnimationFrame(fitFrame);
  fitFrame = window.requestAnimationFrame(() => {
    fitResumeToOnePage(locale);
  });
  window.setTimeout(() => fitResumeToOnePage(locale), 100);
  window.setTimeout(() => fitResumeToOnePage(locale), 500);
}

export function fitResumeToOnePage(locale: Locale, mode: FitMode = "preview") {
  const page = document.querySelector<HTMLElement>("#resume-page");
  const content = document.querySelector<HTMLElement>("#resume-content");
  if (!page || !content) {
    return;
  }

  applyFit(page, 1);

  const safeBottom = mode === "print" ? 150 : 20;
  const minScale = mode === "print" ? 0.36 : 0.5;
  let scale = 1;

  while (resumeOverflow(page, content, safeBottom) > 0 && scale > minScale) {
    scale = Number((scale - 0.01).toFixed(2));
    applyFit(page, scale);
  }

  const overflow = resumeOverflow(page, content, safeBottom);
  const status = document.querySelector<HTMLElement>("#fitStatus");
  const copy = t(locale).preview;
  if (status) {
    if (overflow <= 0) {
      status.textContent = scale < 1 ? copy.fitCompressed(Math.round(scale * 100)) : copy.fitOk;
    } else {
      status.textContent = copy.fitOverflow(Math.ceil(overflow));
    }
  }
}

function applyFit(page: HTMLElement, scale: number) {
  const spaceScale = Math.max(0.35, scale - 0.16);
  page.style.setProperty("--fit-font", String(scale));
  page.style.setProperty("--body-line-height", String(Math.max(1.05, 1.55 * scale)));
  page.style.setProperty("--row-line-height", String(Math.max(1.02, 1.35 * scale)));
  page.style.setProperty("--heading-line-height", String(Math.max(1, 1.15 * scale)));
  page.style.setProperty("--section-gap", `${Math.max(1, 14 * spaceScale)}px`);
  page.style.setProperty("--heading-gap", `${Math.max(1, 8 * spaceScale)}px`);
  page.style.setProperty("--paragraph-gap", `${Math.max(0, 5 * spaceScale)}px`);
  page.style.setProperty("--identity-gap", `${Math.max(2, 18 * spaceScale)}px`);
}

function resumeOverflow(page: HTMLElement, content: HTMLElement, safeBottom: number): number {
  const pageRect = page.getBoundingClientRect();
  const contentRect = content.getBoundingClientRect();
  return contentRect.bottom - (pageRect.bottom - safeBottom);
}
