import { t } from "./i18n";
import { getTemplates } from "./state";
import type { Locale, LogoCandidate, ResumeState, ResumeTemplate, SectionKey } from "./types";
import { escapeHtml, lines, normalizeImageScale } from "./utils";

type RenderContext = {
  activeTemplate: ResumeTemplate;
  customTemplates: ResumeTemplate[];
  logoCandidates: LogoCandidate[];
  schoolLogoStatusText: string;
  state: ResumeState;
};

type TextFieldKey = keyof Omit<
  ResumeState,
  "sections" | "photo" | "photoScale" | "schoolLogo" | "schoolLogoScale" | "schoolLogoSchool" | "schoolLogoSource"
>;

export function renderApp(context: RenderContext): string {
  const { state } = context;
  const copy = t(state.locale);

  return `
    <div class="app-shell" data-theme="${escapeHtml(state.theme)}">
      <aside class="builder-panel">
        <div class="panel-heading">
          <p>${copy.appKicker}</p>
          <h1>${copy.appTitle}</h1>
        </div>

        ${renderTemplatePicker(context)}

        <section class="step-card">
          <h2><span>1</span> ${copy.steps.basics}</h2>
          ${field(copy.fields.university, "university", state)}
          <div class="logo-tools">
            <button id="lookupSchoolLogo" type="button">${copy.actions.findLogo}</button>
            <label class="logo-upload">
              ${copy.actions.uploadLogo}
              <input id="schoolLogoUpload" type="file" accept="image/*" />
            </label>
            <span id="schoolLogoStatus">${escapeHtml(context.schoolLogoStatusText)}</span>
          </div>
          ${scaleControl(copy.fields.schoolLogoScale, "schoolLogoScale", state)}
          ${renderLogoCandidates(context.logoCandidates, state.locale)}
          ${field(copy.fields.name, "name", state)}
          ${field(copy.fields.intention, "intention", state)}
          <div class="field-grid">
            ${field(copy.fields.age, "age", state)}
            ${field(copy.fields.location, "location", state)}
          </div>
          ${field(copy.fields.phone, "phone", state)}
          ${field(copy.fields.email, "email", state, "email")}
        </section>

        <section class="step-card">
          <h2><span>2</span> ${copy.steps.photo}</h2>
          <label class="upload-box">
            <input id="photo" type="file" accept="image/*" />
            <span>${state.photo ? copy.actions.changePhoto : copy.actions.choosePhoto}</span>
          </label>
          ${scaleControl(copy.fields.photoScale, "photoScale", state)}
        </section>

        <section class="step-card">
          <h2><span>3</span> ${copy.steps.content}</h2>
          ${textarea(copy.sections.education, "education", state)}
          ${textarea(copy.sections.research, "research", state)}
          ${textarea(copy.sections.practice, "practice", state)}
          ${textarea(copy.sections.skills, "skills", state)}
        </section>

        <section class="actions">
          <button id="generatePreview" type="button">${copy.actions.generatePreview}</button>
          <button id="printPdf" type="button">${copy.actions.printPdf}</button>
          <button id="downloadHtml" type="button">${copy.actions.downloadHtml}</button>
          <button id="resetData" type="button" class="secondary">${copy.actions.resetData}</button>
        </section>
      </aside>

      <main class="preview-panel">
        ${renderPreviewPanel(context)}
      </main>
    </div>
  `;
}

export function renderPreviewPanel(context: RenderContext): string {
  const copy = t(context.state.locale).preview;
  return `
    <div class="preview-toolbar">
      <span>${copy.hint}</span>
      <span id="fitStatus">${copy.defaultFit}</span>
    </div>
    <div class="resume-viewport">
      ${renderPreview(context)}
    </div>
  `;
}

export function renderPreview(context: RenderContext): string {
  const { state } = context;
  const copy = t(state.locale).preview;
  const universityLines = lines(state.university);
  const schoolLogo = getCurrentSchoolLogo(state);
  const template = context.activeTemplate;
  return `
    <article class="resume-page ${escapeHtml(template.className)} resume-theme-${escapeHtml(state.theme)}" id="resume-page" style="${templateStyle(template, state)}">
      <div class="resume-content" id="resume-content">
        <header class="resume-top">
          <div class="school-mark">
            <div class="school-seal">
              ${schoolLogo ? `<img src="${escapeHtml(schoolLogo)}" alt="学校校徽" />` : escapeHtml(copy.sealFallback)}
            </div>
            <div>
              <strong>${escapeHtml(universityLines[0] ?? "")}</strong>
              <span>${escapeHtml(universityLines[1] ?? "")}</span>
            </div>
          </div>
          <div class="photo-frame">
            ${state.photo ? `<img src="${escapeHtml(state.photo)}" alt="个人照片" />` : `<span>${copy.uploadPhoto}</span>`}
          </div>
        </header>

        <section class="identity">
          <h1><span contenteditable="true" data-edit-field="name">${escapeHtml(state.name)}</span><b>|</b> ${copy.intent}：<span contenteditable="true" data-edit-field="intention">${escapeHtml(state.intention)}</span></h1>
          <p>
            ${copy.age}：<span contenteditable="true" data-edit-field="age">${escapeHtml(state.age)}</span>
            <b>|</b> ${copy.location}：<span contenteditable="true" data-edit-field="location">${escapeHtml(state.location)}</span>
            <b>|</b> ${copy.phone}：<span contenteditable="true" data-edit-field="phone">${escapeHtml(state.phone)}</span>
            <b>|</b> ${copy.email}：<span contenteditable="true" data-edit-field="email">${escapeHtml(state.email)}</span>
          </p>
        </section>

        ${renderSection("education", state)}
        ${renderSection("research", state)}
        ${renderSection("practice", state)}
        ${renderSection("skills", state)}
      </div>
    </article>
  `;
}

function renderTemplatePicker(context: RenderContext): string {
  const { activeTemplate, customTemplates, state } = context;
  const templates = getTemplates(customTemplates);
  const copy = t(state.locale);
  return `
    <section class="step-card">
      <h2><span>0</span> ${copy.steps.template}</h2>
      <label class="field">
        <span>${copy.fields.template}</span>
        <select id="templateSelect">
          ${templates.map((template) => `
            <option value="${escapeHtml(template.id)}" ${template.id === activeTemplate.id ? "selected" : ""}>
              ${escapeHtml(template.name)}
            </option>
          `).join("")}
        </select>
      </label>
      <div class="field-grid">
        <label class="field">
          <span>${copy.fields.theme}</span>
          <select id="themeSelect">
            <option value="light" ${state.theme === "light" ? "selected" : ""}>${copy.fields.light}</option>
            <option value="dark" ${state.theme === "dark" ? "selected" : ""}>${copy.fields.dark}</option>
          </select>
        </label>
        <label class="field">
          <span>${copy.fields.locale}</span>
          <select id="localeSelect">
            <option value="zh-CN" ${state.locale === "zh-CN" ? "selected" : ""}>${copy.fields.chinese}</option>
            <option value="en-US" ${state.locale === "en-US" ? "selected" : ""}>${copy.fields.english}</option>
          </select>
        </label>
      </div>
      <p class="template-description">${escapeHtml(activeTemplate.description)}</p>
      <label class="upload-box template-import">
        <input id="templateImport" type="file" accept="application/json,.json" />
        <span>${copy.actions.importTemplate}</span>
      </label>
    </section>
  `;
}

function renderSection(key: SectionKey, state: ResumeState): string {
  const renderedLines = lines(state.sections[key])
    .map((line) => {
      if (line.includes(" | ")) {
        const parts = line.split(" | ").map(escapeHtml);
        return `<div class="resume-row">${parts.map((part) => `<strong>${part}</strong>`).join("<span></span>")}</div>`;
      }

      if (line.startsWith("•")) {
        return `<p class="bullet-line">${escapeHtml(line)}</p>`;
      }

      const [label, ...rest] = line.split("：");
      if (rest.length) {
        return `<p><strong>${escapeHtml(label)}：</strong>${escapeHtml(rest.join("："))}</p>`;
      }

      return `<p>${escapeHtml(line)}</p>`;
    })
    .join("");

  return `
    <section class="template-section" data-section="${key}">
      <h2>${t(state.locale).sections[key]}</h2>
      <div class="editable-block" contenteditable="true" data-edit-section="${key}" spellcheck="false">
        ${renderedLines}
      </div>
    </section>
  `;
}

function field(label: string, id: TextFieldKey, state: ResumeState, type = "text"): string {
  return `
    <label class="field">
      <span>${label}</span>
      <input id="${id}" type="${type}" value="${escapeHtml(String(state[id]))}" />
    </label>
  `;
}

function textarea(label: string, key: SectionKey, state: ResumeState): string {
  return `
    <label class="field field-wide">
      <span>${label}</span>
      <textarea id="${key}" rows="8">${escapeHtml(state.sections[key])}</textarea>
    </label>
  `;
}

function scaleControl(label: string, id: "photoScale" | "schoolLogoScale", state: ResumeState): string {
  const value = normalizeImageScale(state[id]);
  return `
    <label class="scale-control">
      <span>${label}</span>
      <input id="${id}" type="range" min="0.5" max="2" step="0.01" value="${value}" />
      <output id="${id}Value">${Math.round(value * 100)}%</output>
    </label>
  `;
}

function templateStyle(template: ResumeTemplate, state: ResumeState): string {
  const imageVariables = {
    "photo-scale": String(normalizeImageScale(state.photoScale)),
    "school-logo-scale": String(normalizeImageScale(state.schoolLogoScale))
  };

  return Object.entries({ ...template.variables, ...imageVariables })
    .map(([key, value]) => `--${escapeHtml(key)}:${escapeHtml(value)}`)
    .join(";");
}

function renderLogoCandidates(logoCandidates: LogoCandidate[], locale: Locale): string {
  if (!logoCandidates.length) {
    return "";
  }

  const copy = t(locale).logo;
  return `
    <div class="logo-candidates">
      ${logoCandidates
        .map((candidate, index) => `
          <button type="button" data-logo-candidate="${index}" title="${escapeHtml(candidate.title)}">
            <img src="${escapeHtml(candidate.url)}" alt="${escapeHtml(candidate.title)}" />
            <span>${candidate.confidence === "high" ? copy.recommended : copy.candidate}${candidate.source ? ` · ${escapeHtml(candidate.source)}` : ""}</span>
          </button>
        `)
        .join("")}
    </div>
  `;
}

function getCurrentSchoolLogo(state: ResumeState): string {
  const schoolName = lines(state.university)[0] ?? "";
  if (!state.schoolLogo || !schoolName || !state.schoolLogoSchool) {
    return "";
  }

  if (normalizeSchoolName(state.schoolLogoSchool) !== normalizeSchoolName(schoolName)) {
    return "";
  }

  if (state.schoolLogoSource === "manual" || state.schoolLogoSource === "selected") {
    return state.schoolLogo;
  }

  return /校徽|标志|logo|seal|emblem|badge/i.test(state.schoolLogo) ? state.schoolLogo : "";
}

function normalizeSchoolName(value: string): string {
  return value
    .toLowerCase()
    .replace(/[（）()《》〈〉\[\]\s·.,，。:：;；\-_/\\|]/g, "")
    .replace(/university|college|school|logo|seal|emblem|badge|校徽|标志|学校/g, "");
}
