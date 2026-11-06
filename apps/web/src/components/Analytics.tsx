import { useEffect, useState } from "react";
import { InfoTip } from "./InfoTip";
import { Icon } from "./Icon";

export function daysInMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}
function useCurrentDate() {
  const [date, setDate] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setDate(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);
  return date;
}
export function Metric({
  title,
  description,
  count = false,
}: {
  title: string;
  description: string;
  count?: boolean;
}) {
  return (
    <section className="summary-card analytics-metric" aria-label={title}>
      <div>
        <div className="metric-label">
          <span className="eyebrow">{title}</span>
          <InfoTip title={title} description={description} />
        </div>
        <strong aria-label="Data unavailable">—</strong>
        <p>{count ? "Count unavailable" : "Revenue unavailable"}</p>
      </div>
      <span className="summary-icon">
        <Icon name={count ? "list" : "analytics"} size={21} />
      </span>
    </section>
  );
}
export function SalesChart({
  dailyCounts,
}: {
  dailyCounts?: Readonly<Record<number, number>>;
}) {
  const date = useCurrentDate();
  const month = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);
  const days = Array.from(
    { length: daysInMonth(date) },
    (_, index) => index + 1,
  );
  function countFor(day: number): number | null {
    const value = dailyCounts?.[day];
    return day <= date.getDate() &&
      value !== undefined &&
      Number.isInteger(value) &&
      value >= 0
      ? value
      : null;
  }
  const hasData = days.some((day) => countFor(day) !== null);
  const max = Math.max(1, ...days.map((day) => countFor(day) ?? 0));
  return (
    <section className="panel sales-panel" aria-label="Sales this month">
      <div className="sales-heading">
        <div className="title-with-info">
          <h2 id="sales-chart-title">Sales</h2>
          <InfoTip
            title="Daily sales"
            description="Number of sales per calendar day this month, using your browser's local time zone. Sales records are not connected yet; missing data is never counted as zero."
          />
        </div>
        <span className="badge">{month}</span>
      </div>
      <p className="chart-availability">
        {hasData
          ? "Recorded sales per day this month."
          : "No sales data available. Connect verified sales records to populate this chart."}
      </p>
      <div
        className="sales-scroll"
        role="region"
        aria-label={`Daily sales chart for ${month}`}
        tabIndex={0}
      >
        <div className="sales-plot">
          <div className="sales-grid" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>
          <ol
            className="sales-days"
            style={{
              gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))`,
            }}
            aria-label="Days this month"
          >
            {days.map((day) => {
              const count = countFor(day);
              return (
                <li
                  key={day}
                  className="sales-day"
                  aria-label={`${month.split(" ")[0]} ${day}: ${day > date.getDate() ? "Future date" : count === null ? "Data unavailable" : `${count} sales`}`}
                  title={
                    count === null
                      ? `${day}: No data`
                      : `${day}: ${count} sales`
                  }
                >
                  <span className="sales-lane" aria-hidden="true">
                    {count !== null && (
                      <>
                        <small className="sales-count">{count}</small>
                        <span
                          className="sales-bar"
                          style={{ height: `${(count / max) * 85}%` }}
                        />
                      </>
                    )}
                  </span>
                  <span>{day}</span>
                </li>
              );
            })}
          </ol>
          {!hasData && (
            <div className="chart-empty-label" aria-hidden="true">
              <Icon name="analytics" size={24} />
              <span>Daily bars will appear when sales data is available</span>
            </div>
          )}
        </div>
      </div>
      <p className="chart-caption">
        Empty days indicate unavailable data, not zero sales. Future days are
        not included in totals.
      </p>
    </section>
  );
}
export function HomeAnalytics() {
  return (
    <>
      <div className="summary-grid">
        <Metric
          title="Revenue"
          description="Total recorded sales revenue since installing MultiList, across all attributed and unattributed listings. Installation date, currency, and sales records have not been connected."
        />
        <Metric
          title="Revenue with MultiList"
          description="Revenue from listings verified as created through MultiList, since installation. No attribution is inferred from missing data."
        />
        <Metric
          title="Sales"
          description="Total number of sales since installing MultiList. The installation timestamp and sales records are not available yet."
          count
        />
      </div>
      <SalesChart />
    </>
  );
}
export function AnalyticsPage() {
  return (
    <div className="analytics-page">
      <div className="analytics-period">
        <span>Period: since installing MultiList</span>
        <span className="badge">Installation date unavailable</span>
      </div>
      <div className="settings-note analytics-note">
        Analytics is awaiting Depop sales records, a verified installation date,
        currency, and listing attribution. Connecting a profile alone will not
        populate these metrics. Unknown listing origins will remain
        unclassified.
      </div>
      <section aria-labelledby="revenue-title">
        <div className="section-heading">
          <div className="title-with-info">
            <h2 id="revenue-title">Revenue</h2>
            <InfoTip
              title="Revenue breakdown"
              description="Sales revenue grouped by verified listing origin. Currency and treatment of fees, refunds, and cancellations must be defined when real sales ingestion is implemented."
            />
          </div>
        </div>
        <div className="summary-grid">
          <Metric
            title="Total revenue"
            description="All recorded revenue since installation, including any sales whose listing origin is unknown."
          />
          <Metric
            title="Revenue with MultiList"
            description="Revenue from listings verified as created through MultiList."
          />
          <Metric
            title="Revenue without MultiList"
            description="Revenue from listings verified as created outside MultiList. Unknown attribution is not counted here."
          />
        </div>
      </section>
      <section aria-labelledby="listings-title">
        <div className="section-heading">
          <h2 id="listings-title">Listings created</h2>
        </div>
        <div className="analytics-two-grid">
          <Metric
            title="Created with MultiList"
            description="Listings with verified MultiList creation records since installation."
            count
          />
          <Metric
            title="Created without MultiList"
            description="Listings with verified external creation records since installation. Missing provenance does not mean created externally."
            count
          />
        </div>
      </section>
      <div className="analytics-sales-total">
        <Metric
          title="Total sales since installation"
          description="Number of completed sales recorded since the verified installation date. No start date or sales records are currently available."
          count
        />
      </div>
      <SalesChart />
    </div>
  );
}
