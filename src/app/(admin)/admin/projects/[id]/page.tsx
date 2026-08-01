import AdminProjectsManager from "@/components/sections/AdminProjectsManager";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

export default async function EditAdminProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) notFound();

  return <AdminProjectsManager initialProjects={[]} mediaLibrary={[]} editorOnly editProject={project} />;
}
