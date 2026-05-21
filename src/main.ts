import "./styles.css";

type SectionKey = "education" | "research" | "practice" | "skills";

type ResumeState = {
  templateId: string;
  university: string;
  schoolLogo: string;
  schoolLogoSchool: string;
  schoolLogoSource: "auto" | "manual" | "selected" | "";
  name: string;
  intention: string;
  age: string;
  location: string;
  phone: string;
  email: string;
  photo: string;
  photoScale: number;
  schoolLogoScale: number;
  sections: Record<SectionKey, string>;
};

const STORAGE_KEY = "resume-generator-state-v2";

type LogoCandidate = {
  source?: string;
  title: string;
  url: string;
  confidence: "high" | "medium";
};

type ResumeTemplate = {
  id: string;
  name: string;
  description: string;
  className: string;
  variables: Record<string, string>;
};

const defaultState: ResumeState = {
  templateId: "academic-blue",
  university: "示例大学\nEXAMPLE UNIVERSITY",
  schoolLogo: "",
  schoolLogoSchool: "",
  schoolLogoSource: "",
  name: "张三",
  intention: "产品运营 / 数据分析",
  age: "24",
  location: "示例市",
  phone: "138****0000",
  email: "zhangsan@example.com",
  photo: "/assets/placeholder-id-photo.png",
  photoScale: 1,
  schoolLogoScale: 1,
  sections: {
    education: [
      "2022.09-2025.06 | 示例大学 | 管理学院 | 数据管理 | 硕士",
      "荣誉奖项：示例奖学金（2 次）；优秀学生干部；课程项目优秀展示；",
      "成绩成果：GPA 3.8/4.0；综合排名前 10%；完成 3 个数据分析课程项目；",
      "• 示例研究：用户行为数据分析与增长策略评估；",
      "• 示例论文：校园服务平台满意度影响因素研究；",
      "研究方向：数据分析、用户研究、产品增长与流程优化",
      "",
      "2018.09-2022.06 | 示例学院 | 信息管理系 | 信息管理与信息系统 | 本科",
      "荣誉奖项：优秀毕业生；校级奖学金；优秀课程设计；",
      "成绩成果：完成企业案例分析、数据可视化和用户调研等综合实践项目；"
    ].join("\n"),
    research: [
      "2024.01-至今 | 示例产品增长分析项目 | 核心成员",
      "项目描述：围绕某虚构校园服务产品，分析用户注册、留存、转化和反馈数据，形成增长优化建议。",
      "项目职责：1. 设计指标体系，整理 10 万条虚构行为日志并完成数据清洗；",
      "2. 使用 Excel 和可视化工具搭建周报看板，跟踪关键指标变化；",
      "3. 访谈 20 名示例用户，归纳需求痛点并输出产品改进方案；",
      "项目成果：形成示例分析报告 1 份，提出 5 条产品优化建议，用于演示简历生成效果；",
      "",
      "2023.09-2023.12 | 示例用户调研与竞品分析项目 | 负责人",
      "项目描述：针对虚构在线学习平台完成竞品拆解、问卷设计和用户旅程梳理。",
      "项目成果：输出竞品矩阵、用户画像和功能优先级建议，作为作品集示例材料；"
    ].join("\n"),
    practice: [
      "2023.07-2023.10 | 示例科技有限公司 | 产品运营实习生",
      "实习内容：协助维护示例活动页面，整理用户反馈，跟踪活动报名、转化和留存数据；",
      "实习收获：完成周报和复盘材料，熟悉跨部门沟通流程，形成用数据辅助判断的工作习惯；",
      "",
      "2020.09-2022.06 | 示例学生组织 | 项目组成员",
      "实践内容：参与策划 3 场校园活动，协助流程设计、物料准备、现场协调和后期复盘；",
      "实践收获：积累活动组织、沟通协调和文档沉淀经验；"
    ].join("\n"),
    skills: [
      "数据技能：Excel、SQL 基础、数据透视表、指标拆解、可视化图表制作；",
      "软件技能：Office、Figma、Notion、Markdown、基础网页编辑；",
      "语言能力：英语 CET-6；可阅读英文产品文档和基础技术资料；",
      "个人特点：沟通主动，执行稳定，重视复盘，能够将复杂信息整理为清晰文档；",
      "兴趣爱好：跑步、摄影、阅读、桌游、旅行；"
    ].join("\n")
  }
};

const sectionLabels: Record<SectionKey, string> = {
  education: "教育背景",
  research: "科研经历",
  practice: "实践经历",
  skills: "技能特长"
};

const CUSTOM_TEMPLATES_KEY = "resume-generator-custom-templates-v1";

const builtInTemplates: ResumeTemplate[] = [
  {
    id: "academic-blue",
    name: "高校蓝线",
    description: "参考图风格，适合中文学术和科研简历。",
    className: "template-academic",
    variables: {
      "template-accent": "#1f5f9c",
      "template-accent-dark": "#17446f",
      "template-heading-font": "\"STSong\", \"Songti SC\", \"SimSun\", serif",
      "template-body-font": "\"Microsoft YaHei\", \"PingFang SC\", Arial, sans-serif",
      "template-section-rule": "4px",
      "template-title-size": "32px",
      "template-section-title-size": "20px"
    }
  },
  {
    id: "classic-black",
    name: "经典黑白",
    description: "低调正式，适合投递和打印。",
    className: "template-classic",
    variables: {
      "template-accent": "#111111",
      "template-accent-dark": "#111111",
      "template-heading-font": "\"SimSun\", \"Songti SC\", serif",
      "template-body-font": "\"Microsoft YaHei\", Arial, sans-serif",
      "template-section-rule": "2px",
      "template-title-size": "30px",
      "template-section-title-size": "18px"
    }
  },
  {
    id: "modern-slate",
    name: "现代灰蓝",
    description: "更现代的求职简历风格。",
    className: "template-modern",
    variables: {
      "template-accent": "#2563eb",
      "template-accent-dark": "#1e293b",
      "template-heading-font": "\"Microsoft YaHei\", \"PingFang SC\", Arial, sans-serif",
      "template-body-font": "\"Microsoft YaHei\", \"PingFang SC\", Arial, sans-serif",
      "template-section-rule": "3px",
      "template-title-size": "29px",
      "template-section-title-size": "18px"
    }
  },
  {
    id: "compact-green",
    name: "紧凑墨绿",
    description: "信息密度更高，适合内容较多的单页简历。",
    className: "template-compact",
    variables: {
      "template-accent": "#047857",
      "template-accent-dark": "#064e3b",
      "template-heading-font": "\"Microsoft YaHei\", \"PingFang SC\", Arial, sans-serif",
      "template-body-font": "\"Microsoft YaHei\", \"PingFang SC\", Arial, sans-serif",
      "template-section-rule": "3px",
      "template-title-size": "28px",
      "template-section-title-size": "17px"
    }
  }
];

const app = document.querySelector<HTMLDivElement>("#app");
let state = loadState();
let customTemplates = loadCustomTemplates();
let schoolLookupTimer = 0;
let logoCandidates: LogoCandidate[] = [];
let schoolLogoStatusText = "输入学校名称后自动查找";
let fitFrame = 0;

function loadState(): ResumeState {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return structuredClone(defaultState);
  }

  try {
    const savedState = { ...structuredClone(defaultState), ...JSON.parse(raw) } as ResumeState;
    savedState.photoScale = normalizeImageScale(savedState.photoScale);
    savedState.schoolLogoScale = normalizeImageScale(savedState.schoolLogoScale);
    return savedState;
  } catch {
    return structuredClone(defaultState);
  }
}

function loadCustomTemplates(): ResumeTemplate[] {
  const raw = localStorage.getItem(CUSTOM_TEMPLATES_KEY);
  if (!raw) {
    return [];
  }

  try {
    const templates = JSON.parse(raw) as ResumeTemplate[];
    return Array.isArray(templates) ? templates.filter(isValidTemplate) : [];
  } catch {
    return [];
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function saveCustomTemplates() {
  localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(customTemplates));
}

function getTemplates(): ResumeTemplate[] {
  return [...builtInTemplates, ...customTemplates];
}

function getActiveTemplate(): ResumeTemplate {
  return getTemplates().find((template) => template.id === state.templateId) ?? builtInTemplates[0];
}

function templateStyle(template: ResumeTemplate): string {
  const imageVariables = {
    "photo-scale": String(normalizeImageScale(state.photoScale)),
    "school-logo-scale": String(normalizeImageScale(state.schoolLogoScale))
  };

  return Object.entries({ ...template.variables, ...imageVariables })
    .map(([key, value]) => `--${escapeHtml(key)}:${escapeHtml(value)}`)
    .join(";");
}

function normalizeImageScale(value: unknown): number {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) {
    return 1;
  }

  return Math.min(2, Math.max(0.5, Number(numberValue.toFixed(2))));
}

function isValidTemplate(template: ResumeTemplate): boolean {
  return Boolean(template?.id && template.name && template.variables && typeof template.variables === "object");
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function lines(value: string): string[] {
  return value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}

function renderSection(key: SectionKey): string {
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
      <h2>${sectionLabels[key]}</h2>
      <div class="editable-block" contenteditable="true" data-edit-section="${key}" spellcheck="false">
        ${renderedLines}
      </div>
    </section>
  `;
}

function renderPreview(): string {
  const universityLines = lines(state.university);
  const schoolLogo = getCurrentSchoolLogo();
  const template = getActiveTemplate();
  return `
    <article class="resume-page ${escapeHtml(template.className)}" id="resume-page" style="${templateStyle(template)}">
      <div class="resume-content" id="resume-content">
        <header class="resume-top">
          <div class="school-mark">
            <div class="school-seal">
              ${schoolLogo ? `<img src="${escapeHtml(schoolLogo)}" alt="学校校徽" />` : "校"}
            </div>
            <div>
              <strong>${escapeHtml(universityLines[0] ?? "")}</strong>
              <span>${escapeHtml(universityLines[1] ?? "")}</span>
            </div>
          </div>
          <div class="photo-frame">
            ${state.photo ? `<img src="${state.photo}" alt="个人照片" />` : `<span>上传照片</span>`}
          </div>
        </header>

        <section class="identity">
          <h1><span contenteditable="true" data-edit-field="name">${escapeHtml(state.name)}</span><b>|</b> 求职意向：<span contenteditable="true" data-edit-field="intention">${escapeHtml(state.intention)}</span></h1>
          <p>
            年龄：<span contenteditable="true" data-edit-field="age">${escapeHtml(state.age)}</span>
            <b>|</b> 居住地：<span contenteditable="true" data-edit-field="location">${escapeHtml(state.location)}</span>
            <b>|</b> 电话：<span contenteditable="true" data-edit-field="phone">${escapeHtml(state.phone)}</span>
            <b>|</b> 邮箱：<span contenteditable="true" data-edit-field="email">${escapeHtml(state.email)}</span>
          </p>
        </section>

        ${renderSection("education")}
        ${renderSection("research")}
        ${renderSection("practice")}
        ${renderSection("skills")}
      </div>
    </article>
  `;
}

type TextFieldKey = keyof Omit<
  ResumeState,
  "sections" | "photo" | "photoScale" | "schoolLogo" | "schoolLogoScale" | "schoolLogoSchool" | "schoolLogoSource"
>;

function field(label: string, id: TextFieldKey, type = "text"): string {
  return `
    <label class="field">
      <span>${label}</span>
      <input id="${id}" type="${type}" value="${escapeHtml(String(state[id]))}" />
    </label>
  `;
}

function textarea(label: string, key: SectionKey): string {
  return `
    <label class="field field-wide">
      <span>${label}</span>
      <textarea id="${key}" rows="8">${escapeHtml(state.sections[key])}</textarea>
    </label>
  `;
}

function scaleControl(label: string, id: "photoScale" | "schoolLogoScale"): string {
  const value = normalizeImageScale(state[id]);
  return `
    <label class="scale-control">
      <span>${label}</span>
      <input id="${id}" type="range" min="0.5" max="2" step="0.01" value="${value}" />
      <output id="${id}Value">${Math.round(value * 100)}%</output>
    </label>
  `;
}

function renderTemplatePicker(): string {
  const templates = getTemplates();
  const active = getActiveTemplate();
  return `
    <section class="step-card">
      <h2><span>0</span> 选择模板</h2>
      <label class="field">
        <span>简历模板</span>
        <select id="templateSelect">
          ${templates.map((template) => `
            <option value="${escapeHtml(template.id)}" ${template.id === active.id ? "selected" : ""}>
              ${escapeHtml(template.name)}
            </option>
          `).join("")}
        </select>
      </label>
      <p class="template-description">${escapeHtml(active.description)}</p>
      <label class="upload-box template-import">
        <input id="templateImport" type="file" accept="application/json,.json" />
        <span>导入 JSON 模板</span>
      </label>
    </section>
  `;
}

function renderApp() {
  if (!app) {
    return;
  }

  app.innerHTML = `
    <div class="app-shell">
      <aside class="builder-panel">
        <div class="panel-heading">
          <p>Resume Builder</p>
          <h1>简历生成器</h1>
        </div>

        ${renderTemplatePicker()}

        <section class="step-card">
          <h2><span>1</span> 基本信息</h2>
          ${field("学校名称", "university")}
          <div class="logo-tools">
            <button id="lookupSchoolLogo" type="button">查找校徽</button>
            <label class="logo-upload">
              上传校徽
              <input id="schoolLogoUpload" type="file" accept="image/*" />
            </label>
            <span id="schoolLogoStatus">${escapeHtml(schoolLogoStatusText)}</span>
          </div>
          ${scaleControl("校徽缩放", "schoolLogoScale")}
          ${renderLogoCandidates()}
          ${field("姓名", "name")}
          ${field("求职意向", "intention")}
          <div class="field-grid">
            ${field("年龄", "age")}
            ${field("居住地", "location")}
          </div>
          ${field("电话", "phone")}
          ${field("邮箱", "email", "email")}
        </section>

        <section class="step-card">
          <h2><span>2</span> 上传照片</h2>
          <label class="upload-box">
            <input id="photo" type="file" accept="image/*" />
            <span>${state.photo ? "更换照片" : "选择证件照或头像"}</span>
          </label>
          ${scaleControl("照片缩放", "photoScale")}
        </section>

        <section class="step-card">
          <h2><span>3</span> 简历内容</h2>
          ${textarea("教育背景", "education")}
          ${textarea("科研经历", "research")}
          ${textarea("实践经历", "practice")}
          ${textarea("技能特长", "skills")}
        </section>

        <section class="actions">
          <button id="generatePreview" type="button">生成预览</button>
          <button id="printPdf" type="button">导出 PDF</button>
          <button id="downloadHtml" type="button">下载网页</button>
          <button id="resetData" type="button" class="secondary">恢复示例</button>
        </section>
      </aside>

      <main class="preview-panel">
        <div class="preview-toolbar">
          <span>网页预览，可直接点击简历文字编辑</span>
          <span id="fitStatus">自动适配一页</span>
        </div>
        ${renderPreview()}
      </main>
    </div>
  `;

  bindEvents();
  scheduleFitResume();
}

function bindEvents() {
  document.querySelector<HTMLSelectElement>("#templateSelect")?.addEventListener("change", (event) => {
    const select = event.currentTarget as HTMLSelectElement;
    state.templateId = select.value;
    saveState();
    renderApp();
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
      ...customTemplates.filter((template) => template.id !== imported.id),
      imported
    ];
    state.templateId = imported.id;
    saveCustomTemplates();
    saveState();
    renderApp();
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
    renderApp();
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
    state.schoolLogoSchool = currentSchoolName();
    state.schoolLogoSource = "manual";
    saveState();
    updatePreview();
    setLogoStatus("已使用手动上传校徽");
  });

  document.querySelectorAll<HTMLButtonElement>("[data-logo-candidate]").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.logoCandidate);
      const candidate = logoCandidates[index];
      if (!candidate) {
        return;
      }

      state.schoolLogo = candidate.url;
      state.schoolLogoSchool = currentSchoolName();
      state.schoolLogoSource = "selected";
      logoCandidates = [];
      saveState();
      setLogoStatus(`已选择候选图片：${candidate.title}`);
      renderApp();
    });
  });

  document.querySelector<HTMLButtonElement>("#printPdf")?.addEventListener("click", () => {
    savePreviewEdits();
    fitResumeToOnePage("print");
    document.body.classList.add("is-printing");
    window.print();
    window.setTimeout(() => {
      document.body.classList.remove("is-printing");
      scheduleFitResume();
    }, 600);
  });

  document.querySelector<HTMLButtonElement>("#generatePreview")?.addEventListener("click", () => {
    saveState();
    updatePreview();
  });

  document.querySelector<HTMLButtonElement>("#downloadHtml")?.addEventListener("click", () => {
    savePreviewEdits();
    downloadHtml();
  });

  document.querySelector<HTMLButtonElement>("#resetData")?.addEventListener("click", () => {
    state = structuredClone(defaultState);
    localStorage.removeItem(STORAGE_KEY);
    saveState();
    renderApp();
  });

  document.querySelectorAll<HTMLElement>("[contenteditable='true']").forEach((element) => {
    element.addEventListener("input", () => {
      savePreviewEdits();
      updateFormValues();
      scheduleFitResume();
    });
  });
}

function bindInput(id: TextFieldKey) {
  document.querySelector<HTMLInputElement>(`#${id}`)?.addEventListener("input", (event) => {
    const input = event.currentTarget as HTMLInputElement;
    state[id] = input.value;
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
  const preview = document.querySelector<HTMLElement>(".preview-panel");
  if (!preview) {
    return;
  }

  preview.innerHTML = `
    <div class="preview-toolbar">
      <span>网页预览，可直接点击简历文字编辑</span>
      <span id="fitStatus">自动适配一页</span>
    </div>
    ${renderPreview()}
  `;

  document.querySelectorAll<HTMLElement>("[contenteditable='true']").forEach((element) => {
    element.addEventListener("input", () => {
      savePreviewEdits();
      updateFormValues();
      scheduleFitResume();
    });
  });

  scheduleFitResume();
}

function scheduleFitResume() {
  window.cancelAnimationFrame(fitFrame);
  fitFrame = window.requestAnimationFrame(() => {
    fitResumeToOnePage();
  });
  window.setTimeout(fitResumeToOnePage, 100);
  window.setTimeout(fitResumeToOnePage, 500);
}

function fitResumeToOnePage(mode: "preview" | "print" = "preview") {
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
  if (status) {
    if (overflow <= 0) {
      status.textContent = scale < 1 ? `已自动压缩至 ${Math.round(scale * 100)}%` : "已适配一页";
    } else {
      status.textContent = `内容仍超出 ${Math.ceil(overflow)}px，请删减或拆成两页`;
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
  setLogoStatus("准备查找校徽...");
  schoolLookupTimer = window.setTimeout(() => {
    void lookupSchoolLogo();
  }, 900);
}

async function lookupSchoolLogo() {
  const schoolName = currentSchoolName();
  if (!schoolName) {
    setLogoStatus("请先填写学校名称");
    return;
  }

  setLogoStatus("正在查找校徽...");

  try {
    const result = await fetchSchoolImages(schoolName);
    if (result.best) {
      state.schoolLogo = result.best.url;
      state.schoolLogoSchool = schoolName;
      state.schoolLogoSource = "auto";
      logoCandidates = result.candidates.filter((candidate) => candidate.url !== result.best?.url);
      saveState();
      setLogoStatus(`已自动使用高置信校徽：${result.best.title}${result.best.source ? `（${result.best.source}）` : ""}`);
      renderApp();
      return;
    }

    if (result.candidates.length) {
      state.schoolLogo = "";
      state.schoolLogoSchool = "";
      state.schoolLogoSource = "";
      logoCandidates = result.candidates;
      saveState();
      setLogoStatus(`找到 ${result.candidates.length} 个候选图片，请手动选择或上传校徽`);
      renderApp();
      return;
    }

    if (!result.candidates.length) {
      state.schoolLogo = "";
      state.schoolLogoSchool = "";
      state.schoolLogoSource = "";
      logoCandidates = [];
      saveState();
      updatePreview();
      setLogoStatus(`未找到与“${schoolName}”精确匹配的校徽，可手动上传`);
      return;
    }
  } catch {
    setLogoStatus("网络查询失败，已保留文字占位");
  }
}

async function fetchSchoolImages(schoolName: string): Promise<{ best: LogoCandidate | null; candidates: LogoCandidate[] }> {
  const exactTitleCandidates = [
    schoolName,
    `${schoolName}校徽`,
    `${schoolName} 校徽`,
    `${schoolName} logo`,
    `${schoolName} Logo`
  ];

  const candidates: LogoCandidate[] = [];
  candidates.push(...await fetchHostedLogoApiImages(schoolName));
  candidates.push(...await fetchWikidataImages(schoolName));

  for (const title of exactTitleCandidates) {
    candidates.push(...await fetchWikipediaTitleImages(title, schoolName));
  }

  const searchCandidates = buildSearchQueries(schoolName);
  for (const query of searchCandidates) {
    candidates.push(...await fetchWikipediaSearchImages(query, schoolName, "zh"));
    candidates.push(...await fetchWikipediaSearchImages(query, schoolName, "en"));
    candidates.push(...await fetchWikipediaSearchImages(query, schoolName));
    candidates.push(...await fetchCommonsFileImages(query, schoolName));
  }

  const uniqueCandidates = dedupeLogoCandidates(candidates).slice(0, 8);
  const best = uniqueCandidates.find((candidate) => candidate.confidence === "high") ?? null;
  return { best, candidates: uniqueCandidates };
}

async function fetchHostedLogoApiImages(schoolName: string): Promise<LogoCandidate[]> {
  try {
    const response = await fetch(`/api/logo-search?school=${encodeURIComponent(schoolName)}`);
    if (!response.ok || !response.headers.get("content-type")?.includes("application/json")) {
      return [];
    }

    const data = (await response.json()) as { candidates?: LogoCandidate[] };
    return data.candidates ?? [];
  } catch {
    return [];
  }
}

function buildSearchQueries(schoolName: string): string[] {
  const shortName = schoolName.replace(/大学|学院|职业技术学院|职业学院/g, "");
  const acronyms = extractLikelyAcronyms(state.university);
  return [
    `${schoolName} 校徽`,
    `${schoolName} logo`,
    `${schoolName} 标志`,
    `${schoolName} emblem`,
    `${schoolName} badge`,
    schoolName,
    `${shortName} 校徽`,
    `${shortName} logo`,
    ...acronyms.flatMap((acronym) => [`${acronym} logo`, `${acronym} emblem`, `${acronym} badge`])
  ].filter((query, index, all) => query.trim() && all.indexOf(query) === index);
}

function extractLikelyAcronyms(value: string): string[] {
  const matches = value.match(/\b[A-Z]{2,12}\b/g);
  return matches ? [...new Set(matches)] : [];
}

function setLogoStatus(message: string) {
  schoolLogoStatusText = message;
  const status = document.querySelector<HTMLElement>("#schoolLogoStatus");
  if (status) {
    status.textContent = message;
  }
}

function currentSchoolName(): string {
  return lines(state.university)[0] ?? "";
}

function getCurrentSchoolLogo(): string {
  const schoolName = currentSchoolName();
  if (!state.schoolLogo || !schoolName || !state.schoolLogoSchool) {
    return "";
  }

  if (normalizeSchoolName(state.schoolLogoSchool) !== normalizeSchoolName(schoolName)) {
    return "";
  }

  if (state.schoolLogoSource === "manual" || state.schoolLogoSource === "selected") {
    return state.schoolLogo;
  }

  return isLogoCandidate("", state.schoolLogo, "") ? state.schoolLogo : "";
}

function clearLogoIfSchoolChanged() {
  const schoolName = currentSchoolName();
  if (!state.schoolLogoSchool) {
    state.schoolLogo = "";
    state.schoolLogoSource = "";
    return;
  }

  if (normalizeSchoolName(state.schoolLogoSchool) !== normalizeSchoolName(schoolName)) {
    state.schoolLogo = "";
    state.schoolLogoSchool = "";
    state.schoolLogoSource = "";
    setLogoStatus("学校已变更，旧校徽已清空");
  }
}

function normalizeSchoolName(value: string): string {
  return value
    .toLowerCase()
    .replace(/[（）()《》〈〉\[\]\s·.,，。:：;；\-_/\\|]/g, "")
    .replace(/university|college|school|logo|seal|emblem|badge|校徽|标志|学校/g, "");
}

function titleMatchesSchool(title: string | undefined, schoolName: string): boolean {
  if (!title) {
    return false;
  }

  const normalizedTitle = normalizeSchoolName(title);
  const normalizedSchool = normalizeSchoolName(schoolName);
  return Boolean(normalizedSchool) && normalizedTitle.includes(normalizedSchool);
}

async function fetchWikipediaTitleImages(title: string, schoolName: string): Promise<LogoCandidate[]> {
  const params = new URLSearchParams({
    origin: "*",
    action: "query",
    redirects: "1",
    titles: title,
    prop: "pageimages",
    piprop: "thumbnail|name",
    pithumbsize: "180",
    format: "json"
  });
  const response = await fetch(`https://zh.wikipedia.org/w/api.php?${params.toString()}`);
  if (!response.ok) {
    return [];
  }

  const data = (await response.json()) as {
    query?: {
      pages?: Record<string, {
        missing?: boolean;
        pageimage?: string;
        thumbnail?: { source?: string };
        title?: string;
      }>;
    };
  };
  const pages = Object.values(data.query?.pages ?? {});
  return pages
    .filter((page) => !page.missing && page.thumbnail?.source && titleMatchesSchool(page.title, schoolName))
    .map((page) => ({
      source: "Wikipedia",
      title: page.title ?? title,
      url: page.thumbnail?.source ?? "",
      confidence: isLogoCandidate(page.title, page.thumbnail?.source, page.pageimage) ? "high" : "medium"
    }));
}

async function fetchWikipediaSearchImages(
  query: string,
  schoolName: string,
  language: "zh" | "en" = "zh"
): Promise<LogoCandidate[]> {
  const params = new URLSearchParams({
    origin: "*",
    action: "query",
    generator: "search",
    gsrsearch: query,
    gsrlimit: "8",
    prop: "pageimages",
    piprop: "thumbnail|name",
    pithumbsize: "180",
    format: "json"
  });
  const response = await fetch(`https://${language}.wikipedia.org/w/api.php?${params.toString()}`);
  if (!response.ok) {
    return [];
  }

  const data = (await response.json()) as {
    query?: {
      pages?: Record<string, { pageimage?: string; thumbnail?: { source?: string }; title?: string }>;
    };
  };
  const pages = Object.values(data.query?.pages ?? {});
  return pages
    .filter((page) => page.thumbnail?.source && (titleMatchesSchool(page.title, schoolName) || isLogoCandidate(page.title, page.thumbnail?.source, page.pageimage)))
    .map((page) => ({
      source: language === "zh" ? "中文百科" : "英文百科",
      title: page.title ?? query,
      url: page.thumbnail?.source ?? "",
      confidence: isLogoCandidate(page.title, page.thumbnail?.source, page.pageimage) ? "high" : "medium"
    }));
}

function isLogoCandidate(title = "", imageUrl = "", pageImage = ""): boolean {
  const haystack = `${title} ${imageUrl} ${pageImage}`.toLowerCase();
  return /校徽|标志|logo|seal|emblem|badge/.test(haystack);
}

async function fetchCommonsFileImages(query: string, schoolName: string): Promise<LogoCandidate[]> {
  const params = new URLSearchParams({
    origin: "*",
    action: "query",
    generator: "search",
    gsrnamespace: "6",
    gsrsearch: query,
    gsrlimit: "8",
    prop: "imageinfo",
    iiprop: "url",
    iiurlwidth: "180",
    format: "json"
  });
  const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params.toString()}`);
  if (!response.ok) {
    return [];
  }

  const data = (await response.json()) as {
    query?: {
      pages?: Record<string, {
        imageinfo?: Array<{ thumburl?: string; url?: string }>;
        title?: string;
      }>;
    };
  };
  const pages = Object.values(data.query?.pages ?? {});
  return pages
    .filter((page) => page.imageinfo?.[0]?.thumburl || page.imageinfo?.[0]?.url)
    .filter((page) => titleMatchesSchool(page.title, schoolName) || isLogoCandidate(page.title, page.imageinfo?.[0]?.thumburl, ""))
    .map((page) => ({
      source: "Commons",
      title: page.title?.replace(/^File:/, "") ?? query,
      url: page.imageinfo?.[0]?.thumburl ?? page.imageinfo?.[0]?.url ?? "",
      confidence: isLogoCandidate(page.title, page.imageinfo?.[0]?.thumburl, "") ? "high" : "medium"
    }));
}

async function fetchWikidataImages(schoolName: string): Promise<LogoCandidate[]> {
  const ids = await fetchWikidataEntityIds(schoolName);
  if (!ids.length) {
    return [];
  }

  const params = new URLSearchParams({
    origin: "*",
    action: "wbgetentities",
    ids: ids.join("|"),
    props: "claims|labels|aliases",
    languages: "zh|en",
    format: "json"
  });
  const response = await fetch(`https://www.wikidata.org/w/api.php?${params.toString()}`);
  if (!response.ok) {
    return [];
  }

  const data = (await response.json()) as {
    entities?: Record<string, {
      aliases?: Record<string, Array<{ value?: string }>>;
      claims?: Record<string, Array<{ mainsnak?: { datavalue?: { value?: string } } }>>;
      labels?: Record<string, { value?: string }>;
    }>;
  };

  return Object.values(data.entities ?? {}).flatMap((entity) => {
    const entityNames = [
      entity.labels?.zh?.value,
      entity.labels?.en?.value,
      ...(entity.aliases?.zh ?? []).map((alias) => alias.value),
      ...(entity.aliases?.en ?? []).map((alias) => alias.value)
    ].filter((value): value is string => Boolean(value));
    const matchesSchool = entityNames.some((name) => titleMatchesSchool(name, schoolName));
    if (!matchesSchool) {
      return [];
    }

    const logoClaims = extractWikidataImageClaims(entity.claims, ["P154", "P94"]);
    const imageClaims = extractWikidataImageClaims(entity.claims, ["P18"]);
    return [
      ...logoClaims.map((fileName) => wikidataFileCandidate(fileName, "high")),
      ...imageClaims.map((fileName) => wikidataFileCandidate(fileName, "medium"))
    ];
  });
}

async function fetchWikidataEntityIds(schoolName: string): Promise<string[]> {
  const params = new URLSearchParams({
    origin: "*",
    action: "wbsearchentities",
    search: schoolName,
    language: "zh",
    uselang: "zh",
    limit: "8",
    format: "json"
  });
  const response = await fetch(`https://www.wikidata.org/w/api.php?${params.toString()}`);
  if (!response.ok) {
    return [];
  }

  const data = (await response.json()) as {
    search?: Array<{ aliases?: string[]; id?: string; label?: string }>;
  };
  return (data.search ?? [])
    .filter((item) =>
      titleMatchesSchool(item.label, schoolName)
      || (item.aliases ?? []).some((alias) => titleMatchesSchool(alias, schoolName))
    )
    .map((item) => item.id)
    .filter((id): id is string => Boolean(id));
}

function extractWikidataImageClaims(
  claims: Record<string, Array<{ mainsnak?: { datavalue?: { value?: string } } }>> | undefined,
  properties: string[]
): string[] {
  return properties.flatMap((property) =>
    (claims?.[property] ?? [])
      .map((claim) => claim.mainsnak?.datavalue?.value)
      .filter((value): value is string => Boolean(value))
  );
}

function wikidataFileCandidate(fileName: string, confidence: LogoCandidate["confidence"]): LogoCandidate {
  return {
    source: "Wikidata",
    title: fileName,
    url: `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}?width=180`,
    confidence
  };
}

function dedupeLogoCandidates(candidates: LogoCandidate[]): LogoCandidate[] {
  const seen = new Set<string>();
  return candidates.filter((candidate) => {
    if (!candidate.url || seen.has(candidate.url)) {
      return false;
    }

    seen.add(candidate.url);
    return true;
  });
}

function renderLogoCandidates(): string {
  if (!logoCandidates.length) {
    return "";
  }

  return `
    <div class="logo-candidates">
      ${logoCandidates
        .map((candidate, index) => `
          <button type="button" data-logo-candidate="${index}" title="${escapeHtml(candidate.title)}">
            <img src="${escapeHtml(candidate.url)}" alt="${escapeHtml(candidate.title)}" />
            <span>${candidate.confidence === "high" ? "推荐" : "候选"}${candidate.source ? ` · ${escapeHtml(candidate.source)}` : ""}</span>
          </button>
        `)
        .join("")}
    </div>
  `;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(String(reader.result)));
    reader.addEventListener("error", () => reject(reader.error));
    reader.readAsDataURL(file);
  });
}

async function importTemplate(file: File): Promise<ResumeTemplate | null> {
  try {
    const template = JSON.parse(await file.text()) as Partial<ResumeTemplate>;
    const normalized: ResumeTemplate = {
      id: String(template.id ?? `custom-${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, "-"),
      name: String(template.name ?? "自定义模板"),
      description: String(template.description ?? "导入的自定义模板"),
      className: String(template.className ?? "template-custom").replace(/[^a-zA-Z0-9_-]/g, "-"),
      variables: Object.fromEntries(
        Object.entries(template.variables ?? {})
          .map(([key, value]) => [key.replace(/^--/, ""), String(value)])
      )
    };

    return isValidTemplate(normalized) ? normalized : null;
  } catch {
    window.alert("模板导入失败，请确认 JSON 格式正确。");
    return null;
  }
}

function downloadHtml() {
  fitResumeToOnePage();
  const page = document.querySelector<HTMLElement>("#resume-page");
  if (!page) {
    return;
  }

  const styles = [...document.querySelectorAll<HTMLStyleElement | HTMLLinkElement>("style, link[rel='stylesheet']")]
    .map((node) => node.outerHTML)
    .join("\n");
  const html = `<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${escapeHtml(state.name)} - 简历</title>${styles}</head><body class="export-body">${page.outerHTML}</body></html>`;
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${state.name || "resume"}.html`;
  anchor.click();
  URL.revokeObjectURL(url);
}

renderApp();
