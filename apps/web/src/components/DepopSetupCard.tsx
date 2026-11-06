import { Icon } from "./Icon";

export function DepopSetupCard({
  connected,
  onConnect,
}: {
  connected: boolean;
  onConnect: () => void;
}) {
  if (connected) return null;
  return (
    <button className="extension-mini setup-card" onClick={onConnect}>
      <h3>Your browser companion</h3>
      <p>Finish setup - Connect your Depop account to MultiList</p>
      <span className="text-button">
        Connect your Depop <Icon name="arrow" size={16} />
      </span>
    </button>
  );
}
