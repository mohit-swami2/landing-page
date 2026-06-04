import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

const base =
  "w-full px-4 py-2.5 rounded-xl bg-[#0a1220] border border-cyan-500/25 text-slate-100 placeholder:text-slate-500 admin-input-glow outline-none transition text-sm";

export function AdminInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${base} ${props.className || ""}`} {...props} />;
}

export function AdminTextarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${base} resize-y min-h-[80px] ${props.className || ""}`} {...props} />;
}

export function AdminSelect({
  children,
  className = "",
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={`${base} min-w-[140px] ${className}`} {...props}>
      {children}
    </select>
  );
}
