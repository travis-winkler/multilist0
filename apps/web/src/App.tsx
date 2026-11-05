import { useEffect, useState } from "react";
import { Icon, type IconName } from "./components/Icon";
import { Dialog } from "./components/Dialog";
import {
  defaultSettings,
  isDrafts,
  isSettings,
  useStored,
  type Draft,
} from "./model";

type Page = "home" | "actions" | "tasks" | "settings" | "account" | "connection";
const navigation: { id: Page; label: string; icon: IconName }[] = [
  { id: "home", label: "Overview", icon: "home" },
  { id: "actions", label: "Actions", icon: "list" },
  { id: "tasks", label: "Tasks", icon: "tasks" },
  { id: "settings", label: "Settings", icon: "settings" },
  { id: "account", label: "Account", icon: "account" },
];
const sections: {
  title: string;
  icon: IconName;
  description: string;
  actions: string[];
}[] = [
  {
    title: "Listings",
    icon: "list",
    description: "Keep your shop fresh and your listings in motion.",
    actions: ["Bump Items", "Relist Items", "Auto Bump Items"],
  },
  {
    title: "Likes",
    icon: "heart",
    description: "Manage how you discover and engage with items.",
    actions: ["Like Products", "Auto Like Products"],
  },
  {
    title: "Followers",
    icon: "users",
    description: "Manage the connections around your shop.",
    actions: ["Follow Users", "Unfollow Non-Followers"],
  },
  {
    title: "Messages",
    icon: "message",
    description: "A space for your shop conversations.",
    actions: ["Manage Messages"],
  },
];
function readPage(): Page {
  const part = window.location.pathname.replace(/\/$/, "").split("/")[2];
  return [...navigation.map((n) => n.id), "connection"].includes(part)
    ? (part as Page)
    : "home";
}
export function App() {
  const [page, setPage] = useState<Page>(readPage);
  const [menu, setMenu] = useState(false);
  const [settings, saveSettings, settingsError] = useStored(
    "multilist.settings.v1",
    defaultSettings,
    isSettings,
  );
  const [drafts, saveDrafts, draftsError] = useStored<Draft[]>(
    "multilist.drafts.v1",
    [],
    isDrafts,
  );
  const [modal, setModal] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string[]>(["Listings"]);
  const [filter, setFilter] = useState("All");
  const [action, setAction] = useState("Auto Bump Items");
  const [interval, setInterval] = useState(1);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    const listener = () => setPage(readPage());
    window.addEventListener("popstate", listener);
    return () => window.removeEventListener("popstate", listener);
  }, []);
  function go(next: Page) {
    window.history.pushState({}, "", `/app/${next === "home" ? "" : next}`);
    setPage(next);
    setMenu(false);
    setNotice("");
  }
  function draft() {
    saveDrafts([
      ...drafts,
      {
        id: crypto.randomUUID(),
        action,
        interval,
        createdAt: new Date().toISOString(),
      },
    ]);
    setModal(null);
    setNotice(
      "Schedule draft saved on this browser. It is not enabled and will not execute.",
    );
  }
  const titles: Record<Page, [string, string]> = {
    home: [
      "Your shop, in a little more harmony.",
      "A thoughtful workspace for your Depop routine.",
    ],
    actions: ["Shop actions", "Your everyday toolkit for managing your shop."],
    tasks: [
      "Your task activity",
      "One place to follow what’s happening in your shop.",
    ],
    settings: [
      "Make it work your way.",
      "Set your preferences for a calmer workflow.",
    ],
    account: [
      "Your MultiList account",
      "Your account, plan, and connected shop.",
    ],
    connection: [
      "Connect your workspace",
      "The web app is your control center. The extension is your execution layer.",
    ],
  };
  return (
    <div
      className={`app-shell ${settings.disableAnimations ? "reduce-motion" : ""}`}
    >
      <aside className={`sidebar ${menu ? "is-open" : ""}`}>
        <a
          className="brand"
          href="/app/"
          onClick={(e) => {
            e.preventDefault();
            go("home");
          }}
        >
          <span className="brand-mark">
            m<span>l</span>
          </span>
          MultiList<span className="brand-dot">.</span>
        </a>
        <div className="workspace-label">SELLER WORKSPACE</div>
        <nav aria-label="Main navigation">
          {navigation.map((n) => (
            <a
              key={n.id}
              className={`nav-item ${page === n.id ? "active" : ""}`}
              href={`/app/${n.id === "home" ? "" : n.id}`}
              aria-current={page === n.id ? "page" : undefined}
              onClick={(e) => {
                e.preventDefault();
                go(n.id);
              }}
            >
              <Icon name={n.icon} />
              {n.label}
              {n.id === "tasks" && <span className="nav-count">0</span>}
            </a>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="extension-mini">
            <span className="mini-icon">
              <Icon name="link" />
            </span>
            <h3>Your browser companion</h3>
            <p>Connect your shop through the MultiList Chrome extension.</p>
            <button className="text-button" onClick={() => go("connection")}>
              View connection <Icon name="arrow" size={16} />
            </button>
          </div>
          <button
            className="help-link"
            onClick={() => setModal("Help & documentation")}
          >
            <span>?</span> Help & documentation{" "}
            <Icon name="external" size={14} />
          </button>
          <div className="sidebar-footer">
            A little less busy. A little more you.
          </div>
        </div>
      </aside>
      {menu && (
        <button
          className="sidebar-overlay"
          aria-label="Close navigation"
          onClick={() => setMenu(false)}
        />
      )}
      <div className="workspace">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button mobile-menu"
              aria-label="Open navigation"
              aria-expanded={menu}
              onClick={() => setMenu(!menu)}
            >
              <Icon name="menu" />
            </button>
            <span>Workspace</span>
            <span className="slash">/</span>
            <strong>
              {page === "connection"
                ? "Connection"
                : navigation.find((n) => n.id === page)?.label}
            </strong>
          </div>
          <button className="connection-pill" onClick={() => go("connection")}>
            <span className="status-dot" /> Extension not connected{" "}
            <Icon name="chevron" size={14} />
          </button>
        </header>
        <main id="main-content" className={page === "home" ? "overview-page" : undefined}>
          {page !== "home" && <>
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                YOUR WORKSPACE
              </div>
              <h1>{titles[page][0]}</h1>
              <p>{titles[page][1]}</p>
            </div>
            <span className="stage-tag">Interface preview</span>
          </div>
          <div className="preview-note">
            <Icon name="link" size={17} />
            <span>
              You're exploring the interface. Depop connection and task
              execution are not available yet.
            </span>
            <button onClick={() => go("connection")}>
              View status <Icon name="arrow" size={15} />
            </button>
          </div>
          </>}
          {notice && (
            <div role="status" className="notice">
              <Icon name="check" size={17} />
              {notice}
            </div>
          )}
          {(settingsError || draftsError) && (
            <p role="alert">{settingsError || draftsError}</p>
          )}
          {page === "home" && (
              <div className="summary-grid">
                <Summary
                  label="DEPOP ACCOUNT"
                  value="Not connected"
                  text="Your shop will appear here"
                  icon="account"
                />
                <Summary
                  label="ACTIVE TASKS"
                  value="0"
                  text="Nothing running right now"
                  icon="refresh"
                />
                <Summary
                  label="SCHEDULE DRAFTS"
                  value={String(drafts.length)}
                  text="Saved locally · not enabled"
                  icon="clock"
                />
              </div>
          )}
          {page === "actions" && (
            <section aria-label="Shop actions">
                  <div className="action-sections">
                    {sections.map((s) => {
                      const open = expanded.includes(s.title);
                      return (
                        <section
                          className={`action-section ${open ? "expanded" : ""}`}
                          key={s.title}
                        >
                          <button
                            className="accordion-toggle"
                            aria-expanded={open}
                            aria-controls={`section-${s.title}`}
                            onClick={() =>
                              setExpanded(
                                open
                                  ? expanded.filter((v) => v !== s.title)
                                  : [...expanded, s.title],
                              )
                            }
                          >
                            <span className="section-icon">
                              <Icon name={s.icon} />
                            </span>
                            <span>
                              <strong>{s.title}</strong>
                              <small>{s.description}</small>
                            </span>
                            <Icon name="chevron" size={17} />
                          </button>
                          <div id={`section-${s.title}`} hidden={!open}>
                            <div className="action-buttons">
                              {s.actions.map((a, i) => (
                                <button
                                  className={
                                    a.startsWith("Auto")
                                      ? "action-button accent"
                                      : "action-button"
                                  }
                                  key={a}
                                  onClick={() => setModal(a)}
                                >
                                  <Icon
                                    name={
                                      a.startsWith("Auto")
                                        ? "clock"
                                        : i === 0
                                          ? "refresh"
                                          : s.icon
                                    }
                                    size={18}
                                  />
                                  <span>{a}</span>
                                  <Icon name="arrow" size={16} />
                                </button>
                              ))}
                            </div>
                            <p className="action-footnote">
                              Connection required · availability will be
                              verified per action
                            </p>
                          </div>
                        </section>
                      );
                    })}
                  </div>
            </section>
          )}
          {page === "tasks" && (
            <section className="panel task-panel">
              <div className="panel-heading">
                <div>
                  <h2>
                    Tasks <span className="badge">Idle</span>
                  </h2>
                  <p>No tasks have been submitted or executed.</p>
                </div>
                <button
                  className="secondary-button"
                  onClick={() => setModal("New schedule draft")}
                >
                  Create schedule draft
                </button>
              </div>
              <div className="tabs" role="tablist" aria-label="Task filters">
                {["All", "Active", "Scheduled", "Completed", "Drafts"].map(
                  (f) => (
                    <button
                      role="tab"
                      id={`tab-${f}`}
                      aria-controls="task-results"
                      aria-selected={filter === f}
                      key={f}
                      onClick={() => setFilter(f)}
                    >
                      {f}
                      {f === "Drafts" && drafts.length > 0
                        ? ` (${drafts.length})`
                        : ""}
                    </button>
                  ),
                )}
              </div>
              <div
                id="task-results"
                role="tabpanel"
                aria-labelledby={`tab-${filter}`}
              >
                {filter === "Drafts" && drafts.length ? (
                  <div className="draft-list">
                    {drafts.map((d) => (
                      <article className="draft-card" key={d.id}>
                        <span className="section-icon">
                          <Icon name="clock" />
                        </span>
                        <div>
                          <h3>{d.action}</h3>
                          <p>
                            Every {d.interval}{" "}
                            {d.interval === 1 ? "hour" : "hours"} · Local draft
                            · Not enabled
                          </p>
                        </div>
                        <button
                          className="text-button"
                          aria-label={`Delete ${d.action} draft`}
                          onClick={() => {
                            saveDrafts(
                              drafts.filter((item) => item.id !== d.id),
                            );
                            setNotice("Draft deleted.");
                          }}
                        >
                          Delete
                        </button>
                      </article>
                    ))}
                  </div>
                ) : (
                  <Empty
                    icon="tasks"
                    title={
                      filter === "Drafts"
                        ? "No schedule drafts yet"
                        : `No ${filter === "All" ? "" : filter.toLowerCase() + " "}tasks yet`
                    }
                    text={
                      filter === "Scheduled"
                        ? "Drafts do not run automatically. Scheduling will be available after the execution layer is implemented."
                        : "No sample activity or simulated results. When supported tasks run, their actual status will appear here."
                    }
                  />
                )}
              </div>
            </section>
          )}
          {page === "settings" && (
            <>
              <div className="section-heading">
                <span>Preferences are saved on this browser only.</span>
                <button
                  className="text-button"
                  onClick={() => setModal("Reset settings")}
                >
                  Reset to defaults
                </button>
              </div>
              <div className="settings-grid">
                <section className="panel">
                  <h2>General</h2>
                  <Toggle
                    label="Disable animations"
                    description="Keep transitions still throughout the workspace."
                    checked={settings.disableAnimations}
                    onChange={(v) =>
                      saveSettings({ ...settings, disableAnimations: v })
                    }
                  />
                  <div className="settings-note">
                    Interface preferences work now. Task preferences are stored
                    for a future execution layer; they do not run automation.
                  </div>
                </section>
                <section className="panel">
                  <h2>Tasks</h2>
                  <Range
                    label="Action speed"
                    value={settings.actionSpeed}
                    max={120}
                    unit="s"
                    onChange={(v) =>
                      saveSettings({ ...settings, actionSpeed: v })
                    }
                  />
                  <Range
                    label="Auto bump interval"
                    value={settings.bumpInterval}
                    max={24}
                    unit="hr"
                    onChange={(v) =>
                      saveSettings({ ...settings, bumpInterval: v })
                    }
                  />
                  <Range
                    label="Auto like products interval"
                    value={settings.likeInterval}
                    max={24}
                    unit="hr"
                    onChange={(v) =>
                      saveSettings({ ...settings, likeInterval: v })
                    }
                  />
                  <Toggle
                    label="Smart action speed"
                    description="Stored preference only; execution is not implemented."
                    checked={settings.smartSpeed}
                    onChange={(v) =>
                      saveSettings({ ...settings, smartSpeed: v })
                    }
                  />
                </section>
              </div>
            </>
          )}
          {page === "account" && (
            <div className="settings-grid">
              <section className="panel">
                <div className="account-intro">
                  <span className="avatar">
                    <Icon name="account" size={29} />
                  </span>
                  <div>
                    <span className="eyebrow">MULTILIST ACCOUNT</span>
                    <h2>Not signed in</h2>
                  </div>
                </div>
                <p>
                  Authentication is not implemented yet. No email, account, or
                  Depop session has been connected.
                </p>
                <div className="account-row">
                  <span>Plan</span>
                  <strong>Not available</strong>
                </div>
                <div className="account-row">
                  <span>Remaining tasks</span>
                  <strong>—</strong>
                </div>
                <div className="account-actions">
                  <button onClick={() => setModal("Manage account")}>
                    Manage account <Icon name="chevron" size={17} />
                  </button>
                  <button onClick={() => setModal("Manage subscription")}>
                    Manage subscription <Icon name="chevron" size={17} />
                  </button>
                </div>
              </section>
              <section className="panel">
                <h2>Your connected shop</h2>
                <Empty
                  icon="link"
                  title="No Depop account connected"
                  text="MultiList does not have access to your Depop account or browser session."
                />
                <button
                  className="secondary-button"
                  onClick={() => go("connection")}
                >
                  View connection requirements <Icon name="arrow" size={17} />
                </button>
              </section>
            </div>
          )}
          {page === "connection" && (
            <div className="settings-grid">
              <section className="panel">
                <div className="panel-heading">
                  <h2>Chrome extension</h2>
                  <span className="badge">Not connected</span>
                </div>
                <p>
                  The extension currently contains an informational popup. This
                  web app cannot detect or pair with it yet.
                </p>
                <ol className="steps">
                  <li>
                    <strong>Build and load the extension</strong>
                    <p>
                      Run <code>npm run build</code>, open{" "}
                      <code>chrome://extensions</code>, enable Developer mode,
                      and load <code>apps/extension/dist</code>.
                    </p>
                  </li>
                  <li>
                    <strong>Securely pair your workspace</strong>
                    <p>
                      Not implemented. Pairing, origin validation, and
                      authenticated messaging will be built and tested in a
                      later stage.
                    </p>
                  </li>
                  <li>
                    <strong>Connect an authenticated Depop tab</strong>
                    <p>
                      Not implemented. No browser sessions, listings, or account
                      data are read in this version.
                    </p>
                  </li>
                </ol>
              </section>
              <section className="panel">
                <h2>What works today</h2>
                <ul className="capabilities">
                  <li>
                    <Icon name="check" /> Responsive workspace navigation
                  </li>
                  <li>
                    <Icon name="check" /> Browser-local preference storage
                  </li>
                  <li>
                    <Icon name="check" /> Create and delete local schedule
                    drafts
                  </li>
                  <li>
                    <Icon name="check" /> Separate extension popup build
                  </li>
                </ul>
                <div className="settings-note">
                  Not implemented: authentication, secure app/extension
                  communication, live task synchronization, listing operations,
                  active schedules, and billing. No automation runs from this
                  interface.
                </div>
              </section>
            </div>
          )}
          <footer className="page-footer">
            <span>MultiList · Made for your next chapter.</span>
            <span>
              Web workspace <span className="footer-dot">·</span> Chrome
              companion
            </span>
          </footer>
        </main>
      </div>
      {modal && (
        <Dialog title={modal} onClose={() => setModal(null)}>
          {modal === "New schedule draft" ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                draft();
              }}
            >
              <p>
                Create a local planning draft. It will not schedule or execute
                any action.
              </p>
              <label className="field">
                Action
                <select
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                >
                  <option>Auto Bump Items</option>
                  <option>Auto Like Products</option>
                </select>
              </label>
              <label className="field">
                Interval (hours)
                <input
                  type="number"
                  min="1"
                  max="24"
                  required
                  value={interval}
                  onChange={(e) => setInterval(Number(e.target.value))}
                />
              </label>
              <button className="primary-button" type="submit">
                Save draft
              </button>
            </form>
          ) : modal === "Reset settings" ? (
            <>
              <p>
                Restore the default interface and task preferences on this
                browser? Your schedule drafts will be kept.
              </p>
              <div className="dialog-actions">
                <button
                  className="secondary-button"
                  onClick={() => setModal(null)}
                >
                  Cancel
                </button>
                <button
                  className="primary-button"
                  onClick={() => {
                    saveSettings(defaultSettings);
                    setModal(null);
                    setNotice("Settings restored to defaults.");
                  }}
                >
                  Reset settings
                </button>
              </div>
            </>
          ) : modal === "Help & documentation" ? (
            <>
              <p>
                This is the first interface stage of MultiList. Use Actions for
                the action toolkit, Tasks for status views and local drafts,
                Settings for preferences, and Account for connection status.
              </p>
              <p>
                For developer setup and Chrome loading instructions, see the
                repository README. Support contact and legal pages are not
                configured in this app; existing hosted pages are unchanged.
              </p>
            </>
          ) : (
            <>
              <span className="badge">Not implemented</span>
              <p>
                {modal === "Manage account" || modal === "Manage subscription"
                  ? "Account authentication and billing are not available in this version. No account or subscription will be created."
                  : `${modal} is a planned capability. It cannot run yet; supported Depop behavior, secure pairing, and execution must be implemented and tested first.`}
              </p>
              <div className="dialog-actions">
                <button
                  className="secondary-button"
                  onClick={() => setModal(null)}
                >
                  Close
                </button>
                <button
                  className="primary-button"
                  onClick={() => {
                    setModal(null);
                    go("connection");
                  }}
                >
                  View connection status <Icon name="arrow" size={16} />
                </button>
              </div>
            </>
          )}
        </Dialog>
      )}
    </div>
  );
}
function Summary({
  label,
  value,
  text,
  icon,
}: {
  label: string;
  value: string;
  text: string;
  icon: IconName;
}) {
  return (
    <section className="summary-card">
      <div>
        <span className="eyebrow">{label}</span>
        <strong>{value}</strong>
        <p>{text}</p>
      </div>
      <span className="summary-icon">
        <Icon name={icon} size={21} />
      </span>
    </section>
  );
}
function Empty({
  icon,
  title,
  text,
}: {
  icon: IconName;
  title: string;
  text: string;
}) {
  return (
    <div className="empty-state">
      <span className="empty-ring">
        <Icon name={icon} size={28} />
      </span>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}
function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="toggle-row">
      <div>
        <strong>{label}</strong>
        <p>{description}</p>
      </div>
      <button
        className={`switch ${checked ? "on" : ""}`}
        role="switch"
        aria-label={label}
        aria-checked={checked}
        onClick={() => onChange(!checked)}
      >
        <span />
      </button>
    </div>
  );
}
function Range({
  label,
  value,
  max,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  max: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="range-field">
      <span>
        {label}
        <strong>
          {value}
          {unit}
        </strong>
      </span>
      <input
        type="range"
        min="1"
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <small>
        <span>1{unit}</span>
        <span>
          {max}
          {unit}
        </span>
      </small>
    </label>
  );
}
