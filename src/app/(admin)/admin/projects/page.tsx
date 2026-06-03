import { prisma } from "@/lib/db";
import AdminProjectsManager from "@/components/sections/AdminProjectsManager";

export default async function AdminProjectsPage() {
  // Query all projects from PostgreSQL DB
  const projectsList = await prisma.project.findMany({
    orderBy: { order: "asc" },
  });

  // Query media list to use as selection options
  const mediaLibrary = await prisma.media.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <AdminProjectsManager
      initialProjects={projectsList}
      mediaLibrary={mediaLibrary}
    />
  );
}
