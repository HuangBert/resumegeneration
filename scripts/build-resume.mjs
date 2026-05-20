import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

const rootDir = process.cwd();
const resumePath = path.join(rootDir, "resume.md");
const outputDir = path.join(rootDir, "public");
const outputPath = path.join(outputDir, "resume-data.json");

marked.setOptions({
  gfm: true,
  breaks: false
});

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeResume(frontMatter, bodyHtml) {
  return {
    meta: {
      generatedAt: new Date().toISOString(),
      source: "resume.md"
    },
    profile: {
      name: frontMatter.name ?? "Your Name",
      title: frontMatter.title ?? "Your Title",
      location: frontMatter.location ?? "",
      email: frontMatter.email ?? "",
      phone: frontMatter.phone ?? "",
      website: frontMatter.website ?? "",
      summary: frontMatter.summary ?? ""
    },
    links: ensureArray(frontMatter.links),
    skills: ensureArray(frontMatter.skills),
    education: ensureArray(frontMatter.education),
    experience: ensureArray(frontMatter.experience),
    projects: ensureArray(frontMatter.projects),
    bodyHtml
  };
}

async function buildResume() {
  const markdown = await fs.readFile(resumePath, "utf8");
  const parsed = matter(markdown);
  const bodyHtml = marked.parse(parsed.content);
  const resume = normalizeResume(parsed.data, bodyHtml);

  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(outputPath, `${JSON.stringify(resume, null, 2)}\n`, "utf8");
  console.log(`Built ${path.relative(rootDir, outputPath)} from resume.md`);
}

buildResume().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
