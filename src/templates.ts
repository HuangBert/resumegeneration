import type { ResumeTemplate } from "./types";

export const builtInTemplates: ResumeTemplate[] = [
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

export function isValidTemplate(template: ResumeTemplate): boolean {
  return Boolean(template?.id && template.name && template.variables && typeof template.variables === "object");
}

export async function importTemplate(file: File): Promise<ResumeTemplate | null> {
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
