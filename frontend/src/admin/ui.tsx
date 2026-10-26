import {
  useEffect,
  useRef,
  useId,
  cloneElement,
  isValidElement,
  type ReactNode,
  type ReactElement,
} from "react";
import {
  X,
  Search,
  ArrowUpRight,
  Inbox,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";
export function Badge({ children }: { children: ReactNode }) {
  return (
    <span
      className={`a-badge a-status-${String(children).toLowerCase().replaceAll(" ", "-")}`}
    >
      {children}
    </span>
  );
}
export function PageHeading({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="a-page-heading">
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <div className="a-heading-actions">{children}</div>
    </div>
  );
}
export function Panel({
  title,
  subtitle,
  children,
  action,
  className = "",
}: {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <section className={`a-panel ${className}`}>
      {title && (
        <div className="a-panel-heading">
          <div>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
export function SearchField({
  value,
  onChange,
  placeholder = "Search records…",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="a-search">
      <Search size={16} aria-hidden="true" />
      <span className="a-sr">{placeholder}</span>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}
export function Empty({
  title = "No matching records",
  description = "Try another search or clear your filters.",
  children,
}: {
  title?: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="a-empty">
      <Inbox size={30} />
      <h3>{title}</h3>
      <p>{description}</p>
      {children}
    </div>
  );
}
export function Dialog({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const callback = useRef(onClose);
  callback.current = onClose;
  useEffect(() => {
    const el = ref.current!;
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    el.showModal();
    return () => {
      el.close();
      document.body.style.overflow = old;
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={`a-dialog ${wide ? "a-dialog-wide" : ""}`}
      aria-labelledby="a-dialog-title"
      onCancel={(e) => {
        e.preventDefault();
        callback.current();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          const r = e.currentTarget.getBoundingClientRect();
          if (
            e.clientX < r.left ||
            e.clientX > r.right ||
            e.clientY < r.top ||
            e.clientY > r.bottom
          )
            callback.current();
        }
      }}
    >
      <div className="a-dialog-heading">
        <div>
          <span>Ornate Studio</span>
          <h2 id="a-dialog-title">{title}</h2>
        </div>
        <button
          type="button"
          className="a-icon"
          aria-label="Close panel"
          onClick={onClose}
        >
          <X size={21} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
export function Field({
  label,
  children,
  hint,
  full = false,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
  full?: boolean;
}) {
  const id = useId();
  return (
    <div className={full ? "a-field a-field-full" : "a-field"}>
      <label htmlFor={id}>{label}</label>
      {isValidElement(children)
        ? cloneElement(
            children as ReactElement<{
              id?: string;
              "aria-describedby"?: string;
            }>,
            { id, "aria-describedby": hint ? id + "-hint" : undefined },
          )
        : children}
      {hint && <small id={id + "-hint"}>{hint}</small>}
    </div>
  );
}
export function FormActions({
  onClose,
  label = "Save changes",
}: {
  onClose: () => void;
  label?: string;
}) {
  return (
    <div className="a-form-actions">
      <button type="button" className="a-button a-secondary" onClick={onClose}>
        Cancel
      </button>
      <button className="a-button" type="submit">
        {label}
      </button>
    </div>
  );
}
export function TableWrap({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <div
      className="a-table-scroll"
      role="region"
      aria-label={label}
      tabIndex={0}
    >
      <table className="a-table">{children}</table>
    </div>
  );
}
export function Pagination({
  page,
  total,
  onChange,
  size = 8,
}: {
  page: number;
  total: number;
  onChange: (n: number) => void;
  size?: number;
}) {
  const pages = Math.max(1, Math.ceil(total / size));
  return (
    <div className="a-pagination">
      <span>
        {total === 0
          ? "0"
          : `${(page - 1) * size + 1}–${Math.min(page * size, total)}`}{" "}
        of {total} records
      </span>
      <div>
        <button
          className="a-icon"
          aria-label="Previous page"
          disabled={page === 1}
          onClick={() => onChange(page - 1)}
        >
          <ChevronLeft size={17} />
        </button>
        <span>
          {page} / {pages}
        </span>
        <button
          className="a-icon"
          aria-label="Next page"
          disabled={page >= pages}
          onClick={() => onChange(page + 1)}
        >
          <ChevronRight size={17} />
        </button>
      </div>
    </div>
  );
}
export function ViewLink({
  to,
  children,
}: {
  to: string;
  children: ReactNode;
}) {
  return (
    <Link className="a-text-link" to={to}>
      {children}
      <ArrowUpRight size={15} />
    </Link>
  );
}
export function Stat({
  label,
  value,
  note,
  children,
}: {
  label: string;
  value: string | number;
  note: string;
  children?: ReactNode;
}) {
  return (
    <div className="a-stat">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
      {children}
    </div>
  );
}
