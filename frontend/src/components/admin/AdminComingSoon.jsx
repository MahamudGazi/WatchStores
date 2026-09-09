import AdminPageShell from "./AdminPageShell";

export default function AdminComingSoon({ title, description, hints = [] }) {
  return (
    <AdminPageShell title={title} description={description}>
      <div className="flex flex-col items-center justify-center gap-4 px-4 py-12 text-center sm:py-16">
        <div className="rounded-full bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700">
          Coming soon / API-ready shell
        </div>
        <p className="max-w-md text-sm text-zinc-600">
          This admin section is wired in the sidebar. Connect list/CRUD UI to
          existing backend APIs or expand as needed.
        </p>
        {hints.length > 0 && (
          <ul className="mt-2 w-full max-w-lg space-y-2 text-left text-sm text-zinc-500">
            {hints.map((h) => (
              <li
                key={h}
                className="rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2"
              >
                {h}
              </li>
            ))}
          </ul>
        )}
      </div>
    </AdminPageShell>
  );
}
