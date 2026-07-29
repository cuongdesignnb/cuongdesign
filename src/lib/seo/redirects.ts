import { prisma } from "@/lib/db";
import { normalizeCanonicalPath } from "./url";

export async function recordSeoRedirect(
  sourcePath: string,
  destinationPath: string,
  reason: string,
) {
  const source = normalizeCanonicalPath(sourcePath);
  const destination = normalizeCanonicalPath(destinationPath);
  if (source === destination) return;

  await prisma.$transaction(async (tx) => {
    const ancestors = await tx.seoRedirect.findMany({
      where: { destinationPath: source },
      select: { sourcePath: true },
    });

    await tx.seoRedirect.updateMany({
      where: { destinationPath: source },
      data: { destinationPath: destination },
    });

    await tx.seoRedirect.upsert({
      where: { sourcePath: source },
      update: { destinationPath: destination, permanent: true, reason },
      create: {
        sourcePath: source,
        destinationPath: destination,
        permanent: true,
        reason,
      },
    });

    await tx.seoRedirect.deleteMany({
      where: {
        sourcePath: destination,
        destinationPath: { in: [source, ...ancestors.map((item) => item.sourcePath)] },
      },
    });
  });
}
