import { useEffect, useState } from "react";
import { Icon } from "./Icon";
import type { DepopProfile } from "./DepopAccount";

export function formatWelcomeDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(date);
}
export function WelcomeBanner({ profile }: { profile: DepopProfile | null }) {
  const [now, setNow] = useState(() => new Date());
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => setFailed(false), [profile?.avatarUrl]);
  const avatar = profile?.avatarUrl?.startsWith("https://")
    ? profile.avatarUrl
    : null;
  return (
    <section className="welcome-banner" aria-labelledby="welcome-title">
      <div>
        <h1 id="welcome-title">Welcome to MultiList</h1>
        <div className="welcome-profile">
          {avatar && !failed ? (
            <img
              src={avatar}
              alt="Your Depop profile"
              referrerPolicy="no-referrer"
              onError={() => setFailed(true)}
            />
          ) : (
            <span className="welcome-avatar">
              <Icon name="account" size={26} />
            </span>
          )}
          <div>
            <strong>
              {profile
                ? profile.displayName?.trim() || `@${profile.username}`
                : "Depop not connected"}
            </strong>
            <p>
              {profile
                ? `@${profile.username}`
                : "Connect your Depop account to personalize Home."}
            </p>
          </div>
        </div>
      </div>
      <time
        dateTime={`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`}
      >
        {formatWelcomeDate(now)}
      </time>
    </section>
  );
}
