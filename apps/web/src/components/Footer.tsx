export type FooterPage = "help" | "documentation" | "privacy" | "terms";
export const footerLinks: { id: FooterPage; label: string }[] = [
  { id: "help", label: "Help" },
  { id: "documentation", label: "Documentation" },
  { id: "privacy", label: "Privacy Policy" },
  { id: "terms", label: "Terms & Conditions" },
];
export function Footer({
  onNavigate,
}: {
  onNavigate: (page: FooterPage) => void;
}) {
  return (
    <footer className="page-footer">
      <span>MultiList · Automate your Depop.</span>
      <nav aria-label="Footer navigation">
        {footerLinks.map((link) => (
          <a
            key={link.id}
            href={`/app/${link.id}`}
            onClick={(e) => {
              e.preventDefault();
              onNavigate(link.id);
            }}
          >
            {link.label}
          </a>
        ))}
      </nav>
    </footer>
  );
}
export function InformationPage({ page }: { page: FooterPage }) {
  if (page === "privacy" || page === "terms")
    return (
      <section className="panel">
        <p>
          {page === "privacy" ? "Privacy Policy" : "Terms & Conditions"} content
          has not been published yet.
        </p>
      </section>
    );
  if (page === "help")
    return (
      <section className="panel">
        <h2>Using MultiList</h2>
        <p>
          Home shows your shop summary. Actions contains the planned shop
          toolkit. Tasks contains local schedule drafts; drafts never execute.
          Settings saves preferences on this browser. Connection explains
          integration availability.
        </p>
        <p>
          Authentication, Depop access, secure extension pairing, and task
          execution are not available yet. No support contact has been
          configured.
        </p>
      </section>
    );
  return (
    <section className="panel">
      <h2>Local development</h2>
      <p>
        From the repository root, run <code>npm ci</code> and{" "}
        <code>npm run dev</code>, then open <code>/app/</code> on the port Vite
        reports.
      </p>
      <h3>Chrome companion</h3>
      <p>
        Run <code>npm run build</code>. In Chrome, open{" "}
        <code>chrome://extensions</code>, enable Developer mode, and load{" "}
        <code>apps/extension/dist</code> unpacked. The popup is informational;
        loading it does not connect a Depop account.
      </p>
      <p>
        See the repository README for build, testing, and deployment
        instructions.
      </p>
    </section>
  );
}
