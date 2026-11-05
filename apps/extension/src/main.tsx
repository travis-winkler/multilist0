import React from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

function App() {
  return (
    <main>
      <header>
        <span className="mark">ml</span>
        <h1>
          MultiList<span>.</span>
        </h1>
      </header>
      <span className="label">YOUR BROWSER COMPANION</span>
      <h2>
        A little less busy.
        <br />A little more you.
      </h2>
      <div className="status">
        <span />
        Not connected
      </div>
      <p>
        This extension is the future execution layer for your MultiList
        workspace. Secure pairing and Depop actions are not implemented yet.
      </p>
      <a
        href="https://multilist.pro/app/"
        target="_blank"
        rel="noopener noreferrer"
      >
        Open MultiList workspace <span>↗</span>
      </a>
      <footer>
        No account data is read. No tasks are running.
        <br />
        The hosted workspace requires separate deployment.
      </footer>
    </main>
  );
}
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
