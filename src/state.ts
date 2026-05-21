import { builtInTemplates, isValidTemplate } from "./templates";
import type { ResumeState, ResumeTemplate } from "./types";
import { normalizeImageScale } from "./utils";

export const STORAGE_KEY = "resume-generator-state-v2";
export const CUSTOM_TEMPLATES_KEY = "resume-generator-custom-templates-v1";

export const defaultState: ResumeState = {
  templateId: "academic-blue",
  locale: "zh-CN",
  theme: "light",
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

export function loadState(): ResumeState {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return structuredClone(defaultState);
  }

  try {
    const savedState = { ...structuredClone(defaultState), ...JSON.parse(raw) } as ResumeState;
    savedState.photoScale = normalizeImageScale(savedState.photoScale);
    savedState.schoolLogoScale = normalizeImageScale(savedState.schoolLogoScale);
    savedState.locale = savedState.locale === "en-US" ? "en-US" : "zh-CN";
    savedState.theme = savedState.theme === "dark" ? "dark" : "light";
    return savedState;
  } catch {
    return structuredClone(defaultState);
  }
}

export function loadCustomTemplates(): ResumeTemplate[] {
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

export function saveState(state: ResumeState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function saveCustomTemplates(customTemplates: ResumeTemplate[]) {
  localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(customTemplates));
}

export function getTemplates(customTemplates: ResumeTemplate[]): ResumeTemplate[] {
  return [...builtInTemplates, ...customTemplates];
}

export function getActiveTemplate(state: ResumeState, customTemplates: ResumeTemplate[]): ResumeTemplate {
  return getTemplates(customTemplates).find((template) => template.id === state.templateId) ?? builtInTemplates[0];
}
