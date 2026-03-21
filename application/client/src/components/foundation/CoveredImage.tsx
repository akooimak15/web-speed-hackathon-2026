import classNames from "classnames";
import { MouseEvent, useCallback, useId } from "react";
import { Button } from "@web-speed-hackathon-2026/client/src/components/foundation/Button";
import { Modal } from "@web-speed-hackathon-2026/client/src/components/modal/Modal";

interface Props {
  src: string;
  alt?: string;
}

export const CoveredImage = ({ src, alt = "" }: Props) => {
  const dialogId = useId();
  const handleDialogClick = useCallback((ev: MouseEvent<HTMLDialogElement>) => {
    ev.stopPropagation();
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <img
        alt={alt}
        className="absolute left-1/2 top-1/2 h-full w-auto max-w-none -translate-x-1/2 -translate-y-1/2 object-cover"
        src={src}
        loading="lazy"
      />
      {alt && (
        <>
          <button
            className="border-cax-border bg-cax-surface-raised/90 text-cax-text-muted hover:bg-cax-surface absolute right-1 bottom-1 rounded-full border px-2 py-1 text-center text-xs"
            type="button"
            onClick={() => { (document.getElementById(dialogId) as HTMLDialogElement)?.showModal(); }}
          >
            ALT を表示する
          </button>
          <Modal id={dialogId} closedby="any" onClick={handleDialogClick}>
            <div className="grid gap-y-6">
              <h1 className="text-center text-2xl font-bold">画像の説明</h1>
              <p className="text-sm">{alt}</p>
              <Button variant="secondary" onClick={() => { (document.getElementById(dialogId) as HTMLDialogElement)?.close(); }}>
                閉じる
              </Button>
            </div>
          </Modal>
        </>
      )}
    </div>
  );
};
