import { useEffect, useRef, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { motion } from "motion/react";
import { Logo } from "./Logo";
export function Brand() {
  return (
    <Link to="/" className="brand" aria-label="Ornate Jewels home">
      <Logo />
    </Link>
  );
}
export function Modal({
  open,
  onClose,
  title,
  children,
  side = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  side?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (open && !d?.open) d?.showModal();
    if (!open && d?.open) d.close();
    if (open) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [open]);
  return (
    <dialog
      aria-label={title}
      ref={ref}
      className={`modal ${side ? "modal-side" : ""}`}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          const r = e.currentTarget.getBoundingClientRect();
          if (
            e.clientX < r.left ||
            e.clientX > r.right ||
            e.clientY < r.top ||
            e.clientY > r.bottom
          )
            onClose();
        }
      }}
    >
      <div className="modal-head">
        <h2>{title}</h2>
        <button
          className="icon-button"
          aria-label="Close dialog"
          onClick={onClose}
        >
          <X />
        </button>
      </div>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {children}
        </motion.div>
      )}
    </dialog>
  );
}
