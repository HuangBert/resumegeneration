export type SectionKey = "education" | "research" | "practice" | "skills";

export type Locale = "zh-CN" | "en-US";

export type ThemeMode = "light" | "dark";

export type ResumeState = {
  templateId: string;
  locale: Locale;
  theme: ThemeMode;
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

export type LogoCandidate = {
  source?: string;
  title: string;
  url: string;
  confidence: "high" | "medium";
};

export type ResumeTemplate = {
  id: string;
  name: string;
  description: string;
  className: string;
  variables: Record<string, string>;
};
