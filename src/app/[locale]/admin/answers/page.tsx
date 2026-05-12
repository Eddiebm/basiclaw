import { notFound } from "next/navigation";
import { isAuthEnabled } from "@/lib/auth-config";
import { isAdminUser } from "@/lib/admin-auth";
import { listPublicAnswersAdmin } from "@/lib/saved-answers";
import { AdminAnswersClient, type AdminAnswerRow } from "./AdminAnswersClient";

type RouteParams = { locale: string };

export default async function AdminAnswersPage({ params }: { params: Promise<RouteParams> }) {
  const { locale: _locale } = await params;
  void _locale;
  const clerkMissing = !isAuthEnabled();
  if (!clerkMissing && !(await isAdminUser())) {
    notFound();
  }

  let initialAnswers: AdminAnswerRow[] = [];
  if (!clerkMissing) {
    const rows = await listPublicAnswersAdmin({ page: 1, pageSize: 50, sort: "recent" });
    initialAnswers = rows.map((a) => ({
      id: a.id,
      question: a.question,
      answer: a.answer,
      jurisdiction: a.jurisdiction,
      locale: a.locale,
      isPublic: a.isPublic,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
      upvotes: a.upvotes,
      downvotes: a.downvotes,
      verifiedBy: a.verifiedBy ?? null,
      verificationNote: a.verificationNote ?? null,
      userId: a.userId ?? null,
    }));
  }

  return <AdminAnswersClient clerkMissing={clerkMissing} initialAnswers={initialAnswers} />;
}
