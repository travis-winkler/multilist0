import { useState } from "react";

export function Connectivity() {
  const [error, setError] = useState("");
  return (
    <section className="panel" aria-labelledby="connectivity-heading">
      <h2 id="connectivity-heading">Extension connectivity</h2>
      <dl className="connection-states">
        <div>
          <dt>Chrome extension</dt>
          <dd>
            Not detected{" "}
            <small>
              Detection is not implemented; installation cannot be determined.
            </small>
          </dd>
        </div>
        <div>
          <dt>Extension connection</dt>
          <dd>Disconnected</dd>
        </div>
        <div>
          <dt>Depop account</dt>
          <dd>Disconnected</dd>
        </div>
      </dl>
      <p>
        The extension currently contains an informational popup. Secure pairing,
        authenticated messaging, and account access are not implemented.
      </p>
      <div className="connection-actions">
        <button
          className="primary-button"
          onClick={() =>
            setError(
              "Cannot connect: secure extension pairing is not implemented. No connection was established.",
            )
          }
        >
          Connect extension
        </button>
        <button
          className="secondary-button"
          disabled
          title="No extension connection to disconnect"
        >
          Disconnect extension
        </button>
      </div>
      {error && (
        <p className="connection-error" role="alert">
          {error}
        </p>
      )}
      <p>
        Disconnect is unavailable because there is no connection. No background
        reconnection or task execution occurs.
      </p>
    </section>
  );
}
