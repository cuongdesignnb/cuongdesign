import AdminProjectsManager from "@/components/sections/AdminProjectsManager";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { projectCompletedAtFormState } from "@/lib/content/project-dates";

export default async function EditAdminProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) notFound();

  const completion = projectCompletedAtFormState(project.completedAt);
  const editProject = { ...project, completedAt: completion.value, completedAtError: completion.error };
  return <AdminProjectsManager key={project.id} initialProjects={[]} mediaLibrary={[]} editorOnly editProject={editProject} />;
}
