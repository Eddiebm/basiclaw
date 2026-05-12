"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";

export function PublishConfirmModal({
  previewQuestion,
  previewAnswerSnippet,
  onClose,
  onConfirm,
}: {
  previewQuestion: string;
  previewAnswerSnippet: string;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
}) {
  const t = useTranslations("answers.publishModal");

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="publish-modal-title">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-background p-5 shadow-lg">
        <h2 id="publish-modal-title" className="text-lg font-semibold">
          {t("title")}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">{t("lead")}</p>
        <div className="mt-4 space-y-3 max-h-[50vh] overflow-y-auto text-sm">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">{t("questionLabel")}</p>
            <p className="rounded-lg border border-border/60 bg-muted/30 p-2 whitespace-pre-wrap">{previewQuestion}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">{t("answerPreviewLabel")}</p>
            <p className="rounded-lg border border-border/60 bg-muted/30 p-2 whitespace-pre-wrap">{previewAnswerSnippet}</p>
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">{t("disclaimer")}</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button
            type="button"
            onClick={() => {
              void onConfirm();
            }}
          >
            {t("confirm")}
          </Button>
        </div>
      </div>
    </div>
  );
}
