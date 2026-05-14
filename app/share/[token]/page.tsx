import SharedNoteEditor from "@/app/components/SharedNoteEditor";
import connectMongoose from "@/app/lib/mongoose";
import { Note } from "@/app/models/Note";
import Image from "next/image";

export default async function SharedNotePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  await connectMongoose();

  const note = await Note.findOne({ "share.token": token, "share.enabled": true }).select(
    "title content share.permission",
  );

  if (!note) {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center bg-[var(--nb-note-bg)] px-4 text-[var(--nb-text)]">
        <div className="w-full max-w-sm rounded-xl border border-[var(--nb-border-strong)] bg-[var(--nb-sidebar-bg)] p-6 text-center">
          <Image src="/brane-brand-kit/new-logo-primary.png" alt="Brane" width={40} height={40} className="mx-auto mb-4 w-10" />
          <h1 className="text-xl font-semibold text-[var(--nb-border)]">Shared note unavailable</h1>
          <p className="mt-2 text-sm text-[var(--nb-text-muted)]">This public link may have been disabled or removed.</p>
        </div>
      </main>
    );
  }

  return (
    <SharedNoteEditor
      token={token}
      title={note.title || "Untitled"}
      content={Array.isArray(note.content) ? note.content : []}
      permission={note.share?.permission === "edit" ? "edit" : "view"}
    />
  );
}
