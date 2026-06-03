export interface TechItem {
  name: string;
  category: "frontend" | "backend" | "database" | "tools" | "ai";
}

export const techStack: TechItem[] = [
  { name: "Next.js", category: "frontend" },
  { name: "React", category: "frontend" },
  { name: "TypeScript", category: "frontend" },
  { name: "Tailwind CSS", category: "frontend" },
  { name: "Framer Motion", category: "frontend" },
  { name: "GSAP", category: "frontend" },
  { name: "Node.js", category: "backend" },
  { name: "Prisma ORM", category: "backend" },
  { name: "PostgreSQL", category: "database" },
  { name: "Docker", category: "tools" },
  { name: "Laravel", category: "backend" },
  { name: "MySQL", category: "database" },
  { name: "SePay API", category: "tools" },
  { name: "OpenAI GPT", category: "ai" },
  { name: "Gemini AI", category: "ai" },
  { name: "Git / GitHub", category: "tools" },
];
