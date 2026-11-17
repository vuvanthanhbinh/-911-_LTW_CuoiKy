export default function PageHeader({ title, children }) {
  return <div className="flex flex-wrap items-center justify-between gap-2"><h1 className="text-xl font-bold">{title}</h1><div className="flex gap-2">{children}</div></div>;
}
