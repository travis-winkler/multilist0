import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icon";

// Accept only verified profile data from a future authenticated integration.
// Never populate this from localStorage, URL parameters, or sample data.
export type DepopProfile = {
  username: string;
  avatarUrl: string | null;
  displayName?: string | null;
};
export function DepopAccount({
  profile,
  onMultiListLogout,
  onDepopLogout,
  onConnect,
}: {
  profile: DepopProfile | null;
  onMultiListLogout: () => void;
  onDepopLogout: () => void;
  onConnect: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [imageFailed, setImageFailed] = useState(false);
  useEffect(() => setImageFailed(false), [profile?.avatarUrl]);
  useEffect(() => {
    function outside(e: PointerEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, []);
  const safeAvatar = profile?.avatarUrl?.startsWith("https://")
    ? profile.avatarUrl
    : null;
  return (
    <div
      className="depop-account"
      ref={ref}
      onKeyDown={(e) => {
        if (e.key === "Escape" && open) {
          e.stopPropagation();
          setOpen(false);
          trigger.current?.focus();
        }
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      {!profile && (
        <button
          className="connection-pill connect-depop-button"
          onClick={() => {
            setOpen(false);
            onConnect();
          }}
        >
          <Icon name="account" size={20} />
          Connect your Depop
        </button>
      )}
      <button
        ref={trigger}
        className="connection-pill account-trigger"
        aria-label={!profile ? "Account options" : undefined}
        aria-expanded={open}
        aria-controls="depop-account-dropdown"
        onClick={() => setOpen(!open)}
      >
        {profile &&
          (safeAvatar && !imageFailed ? (
            <img
              className="depop-avatar"
              src={safeAvatar}
              alt=""
              referrerPolicy="no-referrer"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <Icon name="account" size={20} />
          ))}
        {profile && <span>@{profile.username}</span>}
        <Icon name="chevron" size={14} />
      </button>
      {open && (
        <div
          className="account-dropdown"
          id="depop-account-dropdown"
          aria-label="Depop account options"
        >
          <strong>
            {profile ? "Depop connected" : "No Depop account connected"}
          </strong>
          {profile ? (
            <a
              href={`https://www.depop.com/${encodeURIComponent(profile.username)}/`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View Depop profile <Icon name="external" size={14} />
            </a>
          ) : (
            <p>
              No profile data is available. Account authentication is not
              implemented.
            </p>
          )}
          <button
            onClick={() => {
              setOpen(false);
              onMultiListLogout();
            }}
          >
            Log out of MultiList
          </button>
          <button
            onClick={() => {
              setOpen(false);
              onDepopLogout();
            }}
          >
            Log out of Depop
          </button>
          <small>
            Separate actions. Logout integration is not available yet.
          </small>
        </div>
      )}
    </div>
  );
}
