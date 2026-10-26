import { useMemo, useState } from "react";
import { INITIAL_TICKETS, SLA_HOURS } from "./data/tickets";
import "./App.css";

const STATUSES = ["New", "In Progress", "Waiting", "Resolved"];
const PRIORITIES = ["Urgent", "High", "Normal", "Low"];
const PRIORITY_ORDER = { Urgent: 0, High: 1, Normal: 2, Low: 3 };

function ageLabel(hours) {
  if (hours < 1) return "just now";
  if (hours < 24) return `${Math.floor(hours)}h old`;
  return `${Math.floor(hours / 24)}d old`;
}

function isOverdue(ticket) {
  return ticket.status !== "Resolved" && ticket.hoursAgo > SLA_HOURS[ticket.priority];
}

export default function App() {
  const [tickets, setTickets] = useState(INITIAL_TICKETS);
  const [selectedId, setSelectedId] = useState(INITIAL_TICKETS[0].id);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [sort, setSort] = useState("priority");

  const stats = useMemo(() => ({
    open: tickets.filter((t) => t.status !== "Resolved").length,
    urgent: tickets.filter((t) => t.status !== "Resolved" && t.priority === "Urgent").length,
    overdue: tickets.filter(isOverdue).length,
    resolved: tickets.filter((t) => t.status === "Resolved").length,
  }), [tickets]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = tickets.filter((t) =>
      (statusFilter === "All" || t.status === statusFilter) &&
      (priorityFilter === "All" || t.priority === priorityFilter) &&
      (q === "" || t.subject.toLowerCase().includes(q) ||
        t.requester.toLowerCase().includes(q) || t.id.toLowerCase().includes(q))
    );
    const by = {
      priority: (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] || b.hoursAgo - a.hoursAgo,
      oldest: (a, b) => b.hoursAgo - a.hoursAgo,
      newest: (a, b) => a.hoursAgo - b.hoursAgo,
    }[sort];
    return [...list].sort(by);
  }, [tickets, search, statusFilter, priorityFilter, sort]);

  const selected = tickets.find((t) => t.id === selectedId) ?? visible[0];

  function setStatus(id, status) {
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
  }

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>Ticket Triage Board</h1>
          <p className="tagline">A support queue that shows what needs attention first, and why.</p>
        </div>
        <div className="stats" role="group" aria-label="Queue summary">
          <div className="stat"><span className="stat-num">{stats.open}</span><span className="stat-label">Open</span></div>
          <div className="stat"><span className="stat-num">{stats.urgent}</span><span className="stat-label">Urgent open</span></div>
          <div className="stat"><span className="stat-num danger">{stats.overdue}</span><span className="stat-label">Overdue</span></div>
          <div className="stat"><span className="stat-num">{stats.resolved}</span><span className="stat-label">Resolved</span></div>
        </div>
      </header>

      <section className="controls" aria-label="Ticket filters">
        <label className="control grow">
          <span>Search</span>
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Subject, requester, or ticket ID" />
        </label>
        <label className="control">
          <span>Status</span>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option>All</option>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </label>
        <label className="control">
          <span>Priority</span>
          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
            <option>All</option>
            {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
          </select>
        </label>
        <label className="control">
          <span>Sort by</span>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="priority">Priority, then oldest</option>
            <option value="oldest">Oldest first</option>
            <option value="newest">Newest first</option>
          </select>
        </label>
      </section>

      <main className="layout">
        <section className="list" aria-label="Tickets">
          {visible.length === 0 && (
            <div className="empty">
              <p>No tickets match those filters.</p>
              <p className="empty-sub">Try clearing the search, or widening the status filter.</p>
            </div>
          )}
          {visible.map((t) => (
            <button key={t.id} type="button"
              className={`ticket ${selected && t.id === selected.id ? "selected" : ""}`}
              onClick={() => setSelectedId(t.id)} aria-pressed={selected && t.id === selected.id}>
              <span className="ticket-top">
                <span className={`chip priority-${t.priority.toLowerCase()}`}>{t.priority}</span>
                <span className="ticket-id">{t.id}</span>
                <span className="ticket-age">{ageLabel(t.hoursAgo)}</span>
              </span>
              <span className="ticket-subject">{t.subject}</span>
              <span className="ticket-meta">
                <span>{t.category}</span>
                <span className={`status status-${t.status.replace(" ", "-").toLowerCase()}`}>{t.status}</span>
                {isOverdue(t) && <span className="overdue">Overdue</span>}
              </span>
            </button>
          ))}
        </section>

        <section className="detail" aria-label="Ticket detail">
          {selected ? (
            <>
              <div className="detail-head">
                <span className={`chip priority-${selected.priority.toLowerCase()}`}>{selected.priority}</span>
                <span className="ticket-id">{selected.id}</span>
                {isOverdue(selected) && <span className="overdue">Overdue</span>}
              </div>
              <h2>{selected.subject}</h2>
              <dl className="facts">
                <div><dt>Requester</dt><dd>{selected.requester}</dd></div>
                <div><dt>Category</dt><dd>{selected.category}</dd></div>
                <div><dt>Age</dt><dd>{ageLabel(selected.hoursAgo)}</dd></div>
                <div><dt>Response target</dt><dd>{SLA_HOURS[selected.priority]} hours ({selected.priority})</dd></div>
                <div><dt>Status</dt><dd>{selected.status}</dd></div>
              </dl>
              <p className="description">{selected.description}</p>
              <div className="actions" role="group" aria-label="Change status">
                <span className="actions-label">Move to:</span>
                {STATUSES.filter((s) => s !== selected.status).map((s) => (
                  <button key={s} type="button" onClick={() => setStatus(selected.id, s)}>{s}</button>
                ))}
              </div>
            </>
          ) : (
            <p>Select a ticket to see its details.</p>
          )}
        </section>
      </main>

      <footer className="footer">
        Built with React. Sample data only; ages and overdue flags are computed from per-priority response targets.
      </footer>
    </div>
  );
}
