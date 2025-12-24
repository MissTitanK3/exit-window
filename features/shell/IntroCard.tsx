// First-launch explainer about offline behavior and local-only data.
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="space-y-2">
    <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
    <p className="text-sm text-slate-700 leading-6">{children}</p>
  </div>
);

export const IntroCard = () => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-slate-500">Exit Window</p>
          <h1 className="text-2xl font-semibold text-slate-900">Private, offline instrument</h1>
          <p className="text-sm text-slate-700 leading-6">
            This app ships with zero external dependencies at runtime. Once loaded, every interaction stays on your device. No accounts, no servers, no analytics.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Section title="Offline by default">
            The service worker precaches the shell and static assets so navigation works without connectivity. There are no runtime fetches to the internet.
          </Section>
          <Section title="Data stays local">
            State lives in localStorage using a versioned schema. You can reset or delete it any time without sending data anywhere.
          </Section>
        </div>
      </div>
    </section>
  );
};
