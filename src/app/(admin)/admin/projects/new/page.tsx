import AdminProjectsManager from "@/components/sections/AdminProjectsManager";
import { prisma } from "@/lib/db";

export default async function NewAdminProjectPage() {
  const projectCount = await prisma.project.count();

  return (
    <AdminProjectsManager
      initialProjects={[]}
      mediaLibrary={[]}
      editorOnly
      initialOrder={projectCount}
    />
  );
}
