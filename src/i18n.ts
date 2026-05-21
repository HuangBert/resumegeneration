import type { Locale, SectionKey } from "./types";

type Messages = {
  appKicker: string;
  appTitle: string;
  steps: {
    template: string;
    basics: string;
    photo: string;
    content: string;
  };
  fields: Record<string, string>;
  actions: {
    generatePreview: string;
    printPdf: string;
    downloadHtml: string;
    resetData: string;
    findLogo: string;
    uploadLogo: string;
    importTemplate: string;
    choosePhoto: string;
    changePhoto: string;
  };
  preview: {
    hint: string;
    defaultFit: string;
    fitOk: string;
    fitCompressed: (percent: number) => string;
    fitOverflow: (pixels: number) => string;
    uploadPhoto: string;
    intent: string;
    age: string;
    location: string;
    phone: string;
    email: string;
    sealFallback: string;
  };
  logo: {
    idle: string;
    ready: string;
    emptySchool: string;
    searching: string;
    selected: (title: string) => string;
    manual: string;
    auto: (title: string, source?: string) => string;
    candidates: (count: number) => string;
    none: (school: string) => string;
    failed: string;
    cleared: string;
    recommended: string;
    candidate: string;
  };
  sections: Record<SectionKey, string>;
  templateDescription: string;
};

const messages: Record<Locale, Messages> = {
  "zh-CN": {
    appKicker: "Resume Builder",
    appTitle: "简历生成器",
    steps: {
      template: "选择模板",
      basics: "基本信息",
      photo: "上传照片",
      content: "简历内容"
    },
    fields: {
      template: "简历模板",
      theme: "页面主题",
      locale: "界面语言",
      light: "亮色",
      dark: "暗色",
      chinese: "中文",
      english: "English",
      university: "学校名称",
      schoolLogoScale: "校徽缩放",
      name: "姓名",
      intention: "求职意向",
      age: "年龄",
      location: "居住地",
      phone: "电话",
      email: "邮箱",
      photoScale: "照片缩放"
    },
    actions: {
      generatePreview: "生成预览",
      printPdf: "导出 PDF",
      downloadHtml: "下载网页",
      resetData: "恢复示例",
      findLogo: "查找校徽",
      uploadLogo: "上传校徽",
      importTemplate: "导入 JSON 模板",
      choosePhoto: "选择证件照或头像",
      changePhoto: "更换照片"
    },
    preview: {
      hint: "网页预览，可直接点击简历文字编辑",
      defaultFit: "自动适配一页",
      fitOk: "已适配一页",
      fitCompressed: (percent) => `已自动压缩至 ${percent}%`,
      fitOverflow: (pixels) => `内容仍超出 ${pixels}px，请删减或拆成两页`,
      uploadPhoto: "上传照片",
      intent: "求职意向",
      age: "年龄",
      location: "居住地",
      phone: "电话",
      email: "邮箱",
      sealFallback: "校"
    },
    logo: {
      idle: "输入学校名称后自动查找",
      ready: "准备查找校徽...",
      emptySchool: "请先填写学校名称",
      searching: "正在查找校徽...",
      selected: (title) => `已选择候选图片：${title}`,
      manual: "已使用手动上传校徽",
      auto: (title, source) => `已自动使用高置信校徽：${title}${source ? `（${source}）` : ""}`,
      candidates: (count) => `找到 ${count} 个候选图片，请手动选择或上传校徽`,
      none: (school) => `未找到与“${school}”精确匹配的校徽，可手动上传`,
      failed: "网络查询失败，已保留文字占位",
      cleared: "学校已变更，旧校徽已清空",
      recommended: "推荐",
      candidate: "候选"
    },
    sections: {
      education: "教育背景",
      research: "科研经历",
      practice: "实践经历",
      skills: "技能特长"
    },
    templateDescription: "导入的自定义模板"
  },
  "en-US": {
    appKicker: "Resume Builder",
    appTitle: "Resume Generator",
    steps: {
      template: "Template",
      basics: "Basics",
      photo: "Photo",
      content: "Resume Content"
    },
    fields: {
      template: "Template",
      theme: "Theme",
      locale: "Language",
      light: "Light",
      dark: "Dark",
      chinese: "中文",
      english: "English",
      university: "School",
      schoolLogoScale: "Logo scale",
      name: "Name",
      intention: "Target role",
      age: "Age",
      location: "Location",
      phone: "Phone",
      email: "Email",
      photoScale: "Photo scale"
    },
    actions: {
      generatePreview: "Update Preview",
      printPdf: "Export PDF",
      downloadHtml: "Download HTML",
      resetData: "Reset Example",
      findLogo: "Find Logo",
      uploadLogo: "Upload Logo",
      importTemplate: "Import JSON Template",
      choosePhoto: "Choose portrait",
      changePhoto: "Change photo"
    },
    preview: {
      hint: "Preview. Click resume text to edit directly.",
      defaultFit: "Auto fit one page",
      fitOk: "Fits one page",
      fitCompressed: (percent) => `Compressed to ${percent}%`,
      fitOverflow: (pixels) => `Still overflows by ${pixels}px. Shorten content or split pages.`,
      uploadPhoto: "Upload photo",
      intent: "Target role",
      age: "Age",
      location: "Location",
      phone: "Phone",
      email: "Email",
      sealFallback: "S"
    },
    logo: {
      idle: "Enter a school name to search automatically",
      ready: "Preparing logo search...",
      emptySchool: "Enter a school name first",
      searching: "Searching for a logo...",
      selected: (title) => `Selected candidate: ${title}`,
      manual: "Using uploaded logo",
      auto: (title, source) => `Using high-confidence logo: ${title}${source ? ` (${source})` : ""}`,
      candidates: (count) => `Found ${count} candidates. Select one or upload a logo.`,
      none: (school) => `No exact logo match for "${school}". You can upload one manually.`,
      failed: "Logo search failed. Keeping the text placeholder.",
      cleared: "School changed. Previous logo was cleared.",
      recommended: "Best",
      candidate: "Candidate"
    },
    sections: {
      education: "Education",
      research: "Research",
      practice: "Experience",
      skills: "Skills"
    },
    templateDescription: "Imported custom template"
  }
};

export function t(locale: Locale): Messages {
  return messages[locale] ?? messages["zh-CN"];
}
