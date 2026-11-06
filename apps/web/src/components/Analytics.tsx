import { useEffect, useState } from "react";
import { InfoTip } from "./InfoTip";
import { Icon } from "./Icon";

export const salesPeriods = [
  "Week",
  "Month",
  "Q1",
  "Q2",
  "Q3",
  "Q4",
  "Year",
] as const;
export type SalesPeriod = (typeof salesPeriods)[number];
export function readSalesPeriod(): SalesPeriod {
  const value = new URLSearchParams(window.location.search).get("period");
  return (
    salesPeriods.find(
      (period) => period.toLowerCase() === value?.toLowerCase(),
    ) ?? "Month"
  );
}
export function salesBuckets(date: Date, period: SalesPeriod): Date[] {
  const year = date.getFullYear();
  if (period === "Week") {
    const monday = new Date(
      year,
      date.getMonth(),
      date.getDate() - ((date.getDay() + 6) % 7),
    );
    return Array.from(
      { length: 7 },
      (_, i) =>
        new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i),
    );
  }
  if (period === "Month")
    return Array.from(
      { length: daysInMonth(date) },
      (_, i) => new Date(year, date.getMonth(), i + 1),
    );
  const start = period === "Year" ? 0 : (Number(period[1]) - 1) * 3;
  return Array.from(
    { length: period === "Year" ? 12 : 3 },
    (_, i) => new Date(year, start + i, 1),
  );
}
function PeriodSelect({
  value,
  onChange,
}: {
  value: SalesPeriod;
  onChange: (period: SalesPeriod) => void;
}) {
  return (
    <select
      className="sales-period-select"
      aria-label="Sales period"
      value={value}
      onChange={(e) => onChange(e.target.value as SalesPeriod)}
    >
      {salesPeriods.map((period) => (
        <option key={period}>{period}</option>
      ))}
    </select>
  );
}
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
  period = "Month",
}: {
  period?: SalesPeriod;
  dailyCounts?: Readonly<Record<number, number>>;
}) {
  const date = useCurrentDate();
  const month = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);
  const buckets = salesBuckets(date, period);
  const days = buckets.map((_, index) => index + 1);
  const rangeLabel =
    period === "Month" ? month : `${period} · ${date.getFullYear()}`;
  function countFor(day: number): number | null {
    const value = period === "Month" ? dailyCounts?.[day] : undefined;
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
    <section className="panel sales-panel" aria-label={`Sales: ${period}`}>
      <div className="sales-heading">
        <div className="title-with-info">
          <h2 id="sales-chart-title">Sales</h2>
          <InfoTip
            title="Daily sales"
            description="Sales for the selected period in your browser’s time zone. Week starts Monday. Month uses daily bars; quarters and Year use monthly bars. Missing data is never counted as zero."
          />
        </div>
        <span className="badge">{rangeLabel}</span>
      </div>
      <p className="chart-availability">
        {hasData
          ? "Recorded sales per day this month."
          : "No sales data available. Connect verified sales records to populate this chart."}
      </p>
      <div
        className="sales-scroll"
        role="region"
        aria-label={`Sales chart for ${rangeLabel}`}
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
            aria-label={`Sales buckets for ${period}`}
          >
            {days.map((day) => {
              const count = countFor(day);
              const bucket = buckets[day - 1];
              const label = new Intl.DateTimeFormat(
                "en-US",
                period === "Week"
                  ? { weekday: "short" }
                  : period === "Month"
                    ? { day: "numeric" }
                    : { month: "short" },
              ).format(bucket);
              const fullLabel = new Intl.DateTimeFormat("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              }).format(bucket);
              return (
                <li
                  key={day}
                  className="sales-day"
                  aria-label={`${fullLabel}: ${bucket > date ? "Future date" : count === null ? "Data unavailable" : `${count} sales`}`}
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
                  <span>{label}</span>
                </li>
              );
            })}
          </ol>
          {!hasData && (
            <div className="chart-empty-label" aria-hidden="true">
              <Icon name="analytics" size={24} />
              <span>Bars will appear when sales data is available</span>
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
export function HomeAnalytics({
  onPeriod,
}: {
  onPeriod: (period: SalesPeriod) => void;
}) {
  const now = useCurrentDate();
  return (
    <div className="summary-grid home-metrics">
      <Metric
        title="Revenue"
        description="Total recorded revenue since installation. Sales records are not connected."
      />
      <Metric
        title="Revenue with MultiList"
        description="Revenue from listings verified as created through MultiList, since installation."
      />
      <section className="summary-card weekly-sales" aria-label="Sales">
        <div className="weekly-sales-heading">
          <div className="metric-label">
            <span className="eyebrow">Sales</span>
            <InfoTip
              title="Weekly sales"
              description="Sales this week, Monday through Sunday. No sales records are connected yet. Select another period to view it in Analytics."
            />
          </div>
          <PeriodSelect
            value="Week"
            onChange={(period) => {
              if (period !== "Week") onPeriod(period);
            }}
          />
        </div>
        <strong aria-label="Data unavailable">—</strong>
        <p>Count unavailable</p>
        <ol className="weekly-days" aria-label="Sales this week">
          {salesBuckets(now, "Week").map((day) => (
            <li
              key={day.toISOString()}
              aria-label={`${day.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}: ${day > now ? "Future date" : "Data unavailable"}`}
            >
              <span className="weekly-guide" aria-hidden="true" />
              <span>
                {day.toLocaleDateString("en-US", { weekday: "short" })}
              </span>
            </li>
          ))}
        </ol>
        <small>Sales data unavailable</small>
      </section>
    </div>
  );
}
export function AnalyticsPage({
  period,
  onPeriod,
}: {
  period: SalesPeriod;
  onPeriod: (period: SalesPeriod) => void;
}) {
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
      <div className="analytics-chart-heading">
        <h2>Sales by period</h2>
        <PeriodSelect value={period} onChange={onPeriod} />
      </div>
      <SalesChart period={period} />
    </div>
  );
}
