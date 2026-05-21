import "./styles.css";
import { downloadHtml } from "./exportResume";
import { fitResumeToOnePage, scheduleFitResume } from "./fit";
import { t } from "./i18n";
import { currentSchoolName, fetchSchoolImages, normalizeSchoolName } from "./logoSearch";
import { renderApp, renderPreviewPanel } from "./render";
import {
  CUSTOM_TEMPLATES_KEY,
  defaultState,
  getActiveTemplate,
  loadCustomTemplates,
  loadState,
  saveCustomTemplates,
  saveState as persistState,
  STORAGE_KEY
} from "./state";
import { importTemplate } from "./templates";
import type { Locale, LogoCandidate, ResumeState, ResumeTemplate, SectionKey, ThemeMode } from "./types";
import { fileToDataUrl, normalizeImageScale } from "./utils";

type TextFieldKey = keyof Omit<
  ResumeState,
  "sections" | "photo" | "photoScale" | "schoolLogo" | "schoolLogoScale" | "schoolLogoSchool" | "schoolLogoSource"
>;

const app = document.querySelector<HTMLDivElement>("#app");
let state = loadState();
let customTemplates = loadCustomTemplates();
let schoolLookupTimer = 0;
let logoCandidates: LogoCandidate[] = [];
let schoolLogoStatusText = t(state.locale).logo.idle;

function context() {
  return {
    activeTemplate: getActiveTemplate(state, customTemplates),
    customTemplates,
    logoCandidates,
    schoolLogoStatusText,
    state
  };
}

function saveState() {
  persistState(state);
}

function applyDocumentPreferences() {
  document.documentElement.lang = state.locale;
  document.documentElement.dataset.theme = state.theme;
}

function render() {
  if (!app) {
    return;
  }

  applyDocumentPreferences();
  app.innerHTML = renderApp(context());
  bindEvents();
  scheduleFitResume(state.locale);
}

function bindEvents() {
  document.querySelector<HTMLSelectElement>("#templateSelect")?.addEventListener("change", (event) => {
    const select = event.currentTarget as HTMLSelectElement;
    state.templateId = select.value;
    saveState();
    render();
  });

  document.querySelector<HTMLSelectElement>("#themeSelect")?.addEventListener("change", (event) => {
    const select = event.currentTarget as HTMLSelectElement;
    state.theme = select.value as ThemeMode;
    saveState();
    updatePreview();
  });

  document.querySelector<HTMLSelectElement>("#localeSelect")?.addEventListener("change", (event) => {
    const select = event.currentTarget as HTMLSelectElement;
    state.locale = select.value as Locale;
    schoolLogoStatusText = t(state.locale).logo.idle;
    saveState();
    render();
  });

  document.querySelector<HTMLInputElement>("#templateImport")?.addEventListener("change", async (event) => {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    const imported = await importTemplate(file);
    if (!imported) {
      return;
    }

    customTemplates = [
      ...customTemplates.filter((template: ResumeTemplate) => template.id !== imported.id),
      imported
    ];
    state.templateId = imported.id;
    saveCustomTemplates(customTemplates);
    saveState();
    render();
  });

  bindInput("university");
  bindInput("name");
  bindInput("intention");
  bindInput("age");
  bindInput("location");
  bindInput("phone");
  bindInput("email");
  bindTextarea("education");
  bindTextarea("research");
  bindTextarea("practice");
  bindTextarea("skills");
  bindScaleControl("photoScale");
  bindScaleControl("schoolLogoScale");

  document.querySelector<HTMLInputElement>("#photo")?.addEventListener("change", async (event) => {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    state.photo = await fileToDataUrl(file);
    saveState();
    render();
  });

  document.querySelector<HTMLButtonElement>("#lookupSchoolLogo")?.addEventListener("click", () => {
    void lookupSchoolLogo();
  });

  document.querySelector<HTMLInputElement>("#schoolLogoUpload")?.addEventListener("change", async (event) => {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    state.schoolLogo = await fileToDataUrl(file);
    state.schoolLogoSchool = currentSchoolName(state.university);
    state.schoolLogoSource = "manual";
    saveState();
    updatePreview();
    setLogoStatus(t(state.locale).logo.manual);
  });

  document.querySelectorAll<HTMLButtonElement>("[data-logo-candidate]").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.logoCandidate);
      const candidate = logoCandidates[index];
      if (!candidate) {
        return;
      }

      state.schoolLogo = candidate.url;
      state.schoolLogoSchool = currentSchoolName(state.university);
      state.schoolLogoSource = "selected";
      logoCandidates = [];
      saveState();
      setLogoStatus(t(state.locale).logo.selected(candidate.title));
      render();
    });
  });

  document.querySelector<HTMLButtonElement>("#printPdf")?.addEventListener("click", () => {
    savePreviewEdits();
    fitResumeToOnePage(state.locale, "print");
    document.body.classList.add("is-printing");
    window.print();
    window.setTimeout(() => {
      document.body.classList.remove("is-printing");
      scheduleFitResume(state.locale);
    }, 600);
  });

  document.querySelector<HTMLButtonElement>("#generatePreview")?.addEventListener("click", () => {
    saveState();
    updatePreview();
  });

  document.querySelector<HTMLButtonElement>("#downloadHtml")?.addEventListener("click", () => {
    savePreviewEdits();
    fitResumeToOnePage(state.locale);
    downloadHtml(state);
  });

  document.querySelector<HTMLButtonElement>("#resetData")?.addEventListener("click", () => {
    state = structuredClone(defaultState);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(CUSTOM_TEMPLATES_KEY);
    customTemplates = [];
    logoCandidates = [];
    schoolLogoStatusText = t(state.locale).logo.idle;
    saveState();
    render();
  });

  bindPreviewEditEvents();
}

function bindInput(id: TextFieldKey) {
  document.querySelector<HTMLInputElement>(`#${id}`)?.addEventListener("input", (event) => {
    const input = event.currentTarget as HTMLInputElement;
    state[id] = input.value as never;
    if (id === "university") {
      clearLogoIfSchoolChanged();
    }

    saveState();
    updatePreview();

    if (id === "university") {
      scheduleSchoolLogoLookup();
    }
  });
}

function bindTextarea(key: SectionKey) {
  document.querySelector<HTMLTextAreaElement>(`#${key}`)?.addEventListener("input", (event) => {
    const textarea = event.currentTarget as HTMLTextAreaElement;
    state.sections[key] = textarea.value;
    saveState();
    updatePreview();
  });
}

function bindScaleControl(id: "photoScale" | "schoolLogoScale") {
  document.querySelector<HTMLInputElement>(`#${id}`)?.addEventListener("input", (event) => {
    const input = event.currentTarget as HTMLInputElement;
    const value = normalizeImageScale(input.value);
    state[id] = value;
    input.value = String(value);

    const output = document.querySelector<HTMLOutputElement>(`#${id}Value`);
    if (output) {
      output.value = `${Math.round(value * 100)}%`;
      output.textContent = output.value;
    }

    saveState();
    updatePreview();
  });
}

function updatePreview() {
  applyDocumentPreferences();
  const preview = document.querySelector<HTMLElement>(".preview-panel");
  if (!preview) {
    return;
  }

  preview.innerHTML = renderPreviewPanel(context());
  bindPreviewEditEvents();
  scheduleFitResume(state.locale);
}

function bindPreviewEditEvents() {
  document.querySelectorAll<HTMLElement>("[contenteditable='true']").forEach((element) => {
    element.addEventListener("input", () => {
      savePreviewEdits();
      updateFormValues();
      scheduleFitResume(state.locale);
    });
  });
}

function updateFormValues() {
  (["name", "intention", "age", "location", "phone", "email"] as const).forEach((key) => {
    const input = document.querySelector<HTMLInputElement>(`#${key}`);
    if (input) {
      input.value = state[key];
    }
  });
}

function savePreviewEdits() {
  document.querySelectorAll<HTMLElement>("[data-edit-field]").forEach((element) => {
    const key = element.dataset.editField as keyof ResumeState;
    if (key && typeof state[key] === "string") {
      state[key] = element.innerText.trim() as never;
    }
  });

  document.querySelectorAll<HTMLElement>("[data-edit-section]").forEach((element) => {
    const key = element.dataset.editSection as SectionKey;
    if (key) {
      state.sections[key] = element.innerText.trim();
    }
  });

  saveState();
}

function scheduleSchoolLogoLookup() {
  window.clearTimeout(schoolLookupTimer);
  logoCandidates = [];
  setLogoStatus(t(state.locale).logo.ready);
  schoolLookupTimer = window.setTimeout(() => {
    void lookupSchoolLogo();
  }, 900);
}

async function lookupSchoolLogo() {
  const schoolName = currentSchoolName(state.university);
  const logoCopy = t(state.locale).logo;
  if (!schoolName) {
    setLogoStatus(logoCopy.emptySchool);
    return;
  }

  setLogoStatus(logoCopy.searching);

  try {
    const result = await fetchSchoolImages(schoolName, state.university);
    if (result.best) {
      state.schoolLogo = result.best.url;
      state.schoolLogoSchool = schoolName;
      state.schoolLogoSource = "auto";
      logoCandidates = result.candidates.filter((candidate) => candidate.url !== result.best?.url);
      saveState();
      setLogoStatus(logoCopy.auto(result.best.title, result.best.source));
      render();
      return;
    }

    if (result.candidates.length) {
      state.schoolLogo = "";
      state.schoolLogoSchool = "";
      state.schoolLogoSource = "";
      logoCandidates = result.candidates;
      saveState();
      setLogoStatus(logoCopy.candidates(result.candidates.length));
      render();
      return;
    }

    state.schoolLogo = "";
    state.schoolLogoSchool = "";
    state.schoolLogoSource = "";
    logoCandidates = [];
    saveState();
    updatePreview();
    setLogoStatus(logoCopy.none(schoolName));
  } catch {
    setLogoStatus(logoCopy.failed);
  }
}

function setLogoStatus(message: string) {
  schoolLogoStatusText = message;
  const status = document.querySelector<HTMLElement>("#schoolLogoStatus");
  if (status) {
    status.textContent = message;
  }
}

function clearLogoIfSchoolChanged() {
  const schoolName = currentSchoolName(state.university);
  if (!state.schoolLogoSchool) {
    state.schoolLogo = "";
    state.schoolLogoSource = "";
    return;
  }

  if (normalizeSchoolName(state.schoolLogoSchool) !== normalizeSchoolName(schoolName)) {
    state.schoolLogo = "";
    state.schoolLogoSchool = "";
    state.schoolLogoSource = "";
    setLogoStatus(t(state.locale).logo.cleared);
  }
}

render();
