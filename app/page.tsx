// Core Exit Window surface: summary-first, then focused drawers for individual items.
"use client";

import { useEffect, useMemo, useState } from "react";
import { useTheme } from "next-themes";
import type { Constraints, ContinuityKey, EvaluationResult } from "@/domain/types";
import { EvaluationActions } from "@/features/evaluation/EvaluationActions";
import { EvaluationSummary } from "@/features/evaluation/EvaluationSummary";
import { ExportControls } from "@/features/evaluation/ExportControls";
import { HoldingPattern } from "@/features/evaluation/HoldingPattern";
import { PreDepartureStatusPanel } from "@/features/predeparture/PreDepartureStatusPanel";
import { ReadinessSnapshots } from "@/features/snapshots/ReadinessSnapshots";
import { StabilityModePanel } from "@/features/stability/StabilityModePanel";
import { RiskBoundaryPanel } from "@/features/risk/RiskBoundaryPanel";
import { PreDepartureExport } from "@/features/exportpack/PreDepartureExport";
import { ScopedNotesPanel } from "@/features/notes/components/ScopedNotesPanel";
import {
  useConstraintsStore,
  useContinuityStore,
  useEvaluationStore,
  useAppStore,
  useAppStoreHydration,
  useChangeLogStore,
  useModeStore,
  useNotesStore,
  usePreDepartureStore,
  useRiskBoundaryStore,
  useSnapshotStore,
  useStabilityStore,
} from "@/state";
import { selectLatestSnapshots } from "@/state/snapshotStore";
import { ActionCard, ConstraintDrawer, DrawerKey, badgeSoftTone, isConstraintKey, NextStepsDrawer, PanelDrawer, Severity } from "@/features/common/drawers";
import { ActionCardButton, ActionCardSection } from "@/features/common/ActionCardSection";
import { Chip } from "@/features/common/Chip";
import { clearExitWindowStorage } from "@/persistence/storage";

export default function Home() {
  const constraints = useConstraintsStore((state) => state.constraints);
  const updateConstraints = useConstraintsStore((state) => state.updateConstraints);
  const evaluation = useEvaluationStore((state) => state.lastResult);
  const evaluate = useEvaluationStore((state) => state.evaluate);
  const clearEvaluation = useEvaluationStore((state) => state.clear);
  const preDeparture = usePreDepartureStore((state) => state);
  const resetPreDeparture = usePreDepartureStore((state) => state.reset);
  const snapshots = useSnapshotStore((state) => state.snapshots);
  const resetSnapshots = useSnapshotStore((state) => state.resetSnapshots);
  const stability = useStabilityStore((state) => state);
  const resetStability = useStabilityStore((state) => state.reset);
  const riskBoundaries = useRiskBoundaryStore((state) => state.boundaries);
  const resetRiskBoundaries = useRiskBoundaryStore((state) => state.reset);
  const notes = useNotesStore((state) => state.notes);
  const resetNotes = useNotesStore((state) => state.reset);
  const mode = useModeStore((state) => state.mode);
  const setMode = useModeStore((state) => state.setMode);
  const continuity = useContinuityStore((state) => state.checks);
  const resetContinuity = useContinuityStore((state) => state.reset);
  const resetConstraints = useConstraintsStore((state) => state.resetConstraints);
  const resetChangeLog = useChangeLogStore((state) => state.reset);
  const deleteAppState = useAppStore((state) => state.deleteState);
  const hydrated = useAppStoreHydration();

  const [nextOpen, setNextOpen] = useState(false);
  const [activeKey, setActiveKey] = useState<DrawerKey | null>(null);
  const [formState, setFormState] = useState<Constraints>(constraints);
  const [wiping, setWiping] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (!evaluation) evaluate();
  }, [evaluation, evaluate]);

  const latestSnapshots = useMemo(() => selectLatestSnapshots(snapshots), [snapshots]);
  const hardBlockersCount = evaluation?.hardBlockers?.length ?? 0;
  const softBlockersCount = evaluation?.softBlockers?.length ?? 0;
  const degradingCount = useMemo(() => stability.focuses.filter((f) => f.status === "degrading").length, [stability.focuses]);
  const nextTimeConstraint = useMemo(() => {
    const dated = preDeparture.timeConstraints.filter((entry) => entry.targetDate && !Number.isNaN(Date.parse(entry.targetDate)));
    if (!dated.length) return null;
    return dated.sort((a, b) => (a.targetDate ?? "").localeCompare(b.targetDate ?? ""))[0];
  }, [preDeparture.timeConstraints]);
  const latestSnapshotSummary = latestSnapshots[0]?.summary ?? "";

  const glanceItems: Array<{ key: string; label: string; value: string; note?: string; severity: Severity }> = useMemo(
    () => {
      const nextCondition = preDeparture.nextRequiredCondition?.trim();
      return [
        {
          key: "earliestWindow",
          label: "Earliest window",
          value: evaluation?.earliestWindow ?? "Run evaluation",
          note: evaluation?.reasons?.[0],
          severity: hardBlockersCount ? "danger" : evaluation?.status === "ready" ? "ok" : "warn",
        },
        {
          key: "blockers",
          label: "Blockers",
          value: `${hardBlockersCount} hard / ${softBlockersCount} soft`,
          note:
            hardBlockersCount > 0
              ? evaluation?.hardBlockers?.[0]
              : softBlockersCount > 0
                ? evaluation?.softBlockers?.[0]
                : "No blockers recorded.",
          severity: hardBlockersCount ? "danger" : softBlockersCount ? "warn" : "ok",
        },
        {
          key: "preDeparture",
          label: "Pre-departure",
          value: preDeparture.status === "window-open" ? "Window open" : "Not yet",
          note: preDeparture.topBlockers[0]
            ? `Top blocker: ${preDeparture.topBlockers[0]}`
            : nextCondition
              ? `Next required: ${nextCondition}`
              : "Add blockers or required steps to open the window.",
          severity: preDeparture.status === "window-open" ? "ok" : preDeparture.topBlockers.length ? "danger" : "warn",
        },
        {
          key: "time",
          label: "Next date",
          value: nextTimeConstraint ? nextTimeConstraint.label : "No time constraints",
          note: nextTimeConstraint?.targetDate ? `Target: ${nextTimeConstraint.targetDate}` : undefined,
          severity: nextTimeConstraint ? "warn" : "ok",
        },
        {
          key: "stability",
          label: "Stability",
          value: stability.active ? "Holding" : "Planning",
          note: degradingCount
            ? `${degradingCount} focus${degradingCount === 1 ? "" : "es"} degrading`
            : stability.focuses.length
              ? `${stability.focuses.length} focus items tracked`
              : "Add what must stay steady while you wait.",
          severity: degradingCount ? "danger" : stability.active ? "warn" : "ok",
        },
        {
          key: "snapshots",
          label: "Snapshots",
          value: snapshots.length ? `${snapshots.length} saved` : "None yet",
          note: latestSnapshotSummary ? `Latest: ${latestSnapshotSummary}` : "Capture state before making changes.",
          severity: snapshots.length ? "ok" : "warn",
        },
      ];
    },
    [
      degradingCount,
      evaluation?.earliestWindow,
      evaluation?.hardBlockers,
      evaluation?.reasons,
      evaluation?.softBlockers,
      evaluation?.status,
      hardBlockersCount,
      latestSnapshotSummary,
      nextTimeConstraint,
      preDeparture.nextRequiredCondition,
      preDeparture.status,
      preDeparture.topBlockers,
      snapshots.length,
      softBlockersCount,
      stability.active,
      stability.focuses.length,
    ],
  );

  const cards: ActionCard[] = useMemo(() => {
    const isClear = (key: ContinuityKey) => continuity[key] === "clear";

    const priority: Record<DrawerKey, number> = {
      evaluation: 1,
      legal: 2,
      access: 3,
      comms: 4,
      identityInference: 5,
      cutoffs: 6,
      housing: 7,
      income: 8,
      cashRunway: 9,
      healthcare: 10,
      dependents: 11,
      risk: 12,
      fallback: 13,
      belongings: 14,
      preDeparture: 15,
      arrival: 16,
      holding: 17,
      mail: 18,
      addressShadow: 19,
      jurisdiction: 20,
      devices: 21,
      cognitive: 22,
      supportTested: 23,
      docsAccess: 24,
      expectations: 25,
      snapshots: 26,
      notes: 27,
      export: 28,
      stability: 29,
    } as const;

    const items: ActionCard[] = [];
    const push = (card: ActionCard) => items.push(card);

    const commsStatus = { status: "Plan comms", severity: "warn" as Severity };
    push({
      key: "comms",
      title: "Communications",
      status: commsStatus.status,
      detail: "Keep phone, email, and 2FA reachable end to end.",
      severity: commsStatus.severity,
    });

    push({
      key: "identityInference",
      title: "Identity continuity",
      status: isClear("identityInference") ? "Reviewed" : "Patterns unverified",
      detail: "Stagger device/location changes; pre-notify banks and critical accounts.",
      severity: isClear("identityInference") ? "ok" : "warn",
    });

    const accessStatus = { status: "Access unverified", severity: "warn" as Severity };
    push({
      key: "access",
      title: "Account access",
      status: accessStatus.status,
      detail: "Test critical logins and store offline recovery methods.",
      severity: accessStatus.severity,
    });

    push({
      key: "devices",
      title: "Device resilience",
      status: isClear("devices") ? "Reviewed" : "Single-device risk",
      detail: "Primary device backed up; recovery works without internet or main phone.",
      severity: isClear("devices") ? "ok" : "warn",
    });

    const housingStatus = (() => {
      if (constraints.housing.status === "aligned") return { status: "Aligned", severity: "ok" as Severity };
      if (constraints.housing.status === "notice-required") return { status: "Notice required", severity: "warn" as Severity };
      if (constraints.housing.status === "locked-in") return { status: "Locked in", severity: "danger" as Severity };
      return { status: "Unknown", severity: "warn" as Severity };
    })();
    push({
      key: "housing",
      title: "Housing",
      status: housingStatus.status,
      detail:
        constraints.housing.leaseEndDate
          ? `Lease ends ${constraints.housing.leaseEndDate}${constraints.housing.noticeDays ? `, ${constraints.housing.noticeDays}d notice` : ""}`
          : "Log your lease end date and notice.",
      severity: housingStatus.severity,
    });

    const incomeStatus = (() => {
      if (constraints.income.stability === "stable") return { status: "Stable", severity: "ok" as Severity };
      if (constraints.income.stability === "unstable") return { status: "Unstable", severity: "warn" as Severity };
      return { status: "Unknown", severity: "warn" as Severity };
    })();
    push({
      key: "income",
      title: "Income",
      status: incomeStatus.status,
      detail: constraints.income.note ? constraints.income.note : "Capture how steady income is during the window.",
      severity: incomeStatus.severity,
    });

    const runwayStatus = (() => {
      if (constraints.cashRunway.status === "secure") return { status: "Secure", severity: "ok" as Severity };
      if (constraints.cashRunway.status === "tight") return { status: "Tight", severity: "warn" as Severity };
      return { status: "Unknown", severity: "warn" as Severity };
    })();
    push({
      key: "cashRunway",
      title: "Cash runway",
      status: constraints.cashRunway.months ? `${constraints.cashRunway.months} months` : runwayStatus.status,
      detail: constraints.cashRunway.status === "secure" ? "3+ months on hand." : "Log months on hand and tighten if needed.",
      severity: constraints.cashRunway.months !== undefined && constraints.cashRunway.months < 1 ? "danger" : runwayStatus.severity,
    });

    push({
      key: "cutoffs",
      title: "Time cutoffs",
      status: isClear("cutoffs") ? "Reviewed" : "Cutoffs unverified",
      detail: "Payroll, rent, and benefits deadlines aligned to the right time zone.",
      severity: isClear("cutoffs") ? "ok" : "warn",
    });

    const healthcareStatus = (() => {
      if (constraints.healthcare.continuity === "secured") return { status: "Secured", severity: "ok" as Severity };
      if (constraints.healthcare.continuity === "at-risk") return { status: "At risk", severity: "danger" as Severity };
      return { status: "Unknown", severity: "warn" as Severity };
    })();
    push({
      key: "healthcare",
      title: "Healthcare",
      status: healthcareStatus.status,
      detail: constraints.healthcare.note ? constraints.healthcare.note : "Document how care continues during the move.",
      severity: healthcareStatus.severity,
    });

    const dependentsStatus = (() => {
      if (constraints.dependents.coverage === "supported") return { status: "Supported", severity: "ok" as Severity };
      if (constraints.dependents.coverage === "unsupported") return { status: "Unsupported", severity: "danger" as Severity };
      return { status: "Unknown", severity: "warn" as Severity };
    })();
    push({
      key: "dependents",
      title: "Dependents",
      status: dependentsStatus.status,
      detail: constraints.dependents.note ? constraints.dependents.note : "Note care, schooling, or support plans.",
      severity: dependentsStatus.severity,
    });

    const legalStatus = (() => {
      if (constraints.legal.blocker === "clear") return { status: "Clear", severity: "ok" as Severity };
      if (constraints.legal.blocker === "present") return { status: "Blocker present", severity: "danger" as Severity };
      return { status: "Unknown", severity: "warn" as Severity };
    })();
    push({
      key: "legal",
      title: "Legal & admin",
      status: legalStatus.status,
      detail: constraints.legal.note ? constraints.legal.note : "Record any documents or blockers to resolve.",
      severity: legalStatus.severity,
    });

    push({
      key: "addressShadow",
      title: "Address propagation",
      status: isClear("addressShadow") ? "Reviewed" : "Shadow copies unknown",
      detail: "Credit, insurance, and healthcare systems updated and monitored.",
      severity: isClear("addressShadow") ? "ok" : "warn",
    });

    push({
      key: "mail",
      title: "Mail continuity",
      status: isClear("mail")
        ? "Reviewed"
        : constraints.legal.mailForwardingSet === "yes"
          ? "Forwarding active"
          : "Mail gaps possible",
      detail: "Forwarding set; critical senders listed; proof paths for delivery and notices.",
      severity: isClear("mail") || constraints.legal.mailForwardingSet === "yes" ? "ok" : "warn",
    });

    push({
      key: "jurisdiction",
      title: "Jurisdiction overlap",
      status: isClear("jurisdiction") ? "Reviewed" : "Overlap unmapped",
      detail: "Which state or country rules apply during transition is documented.",
      severity: isClear("jurisdiction") ? "ok" : "warn",
    });

    const fallbackStatus = { status: "No fallback", severity: "warn" as Severity };
    push({
      key: "fallback",
      title: "Fallback recovery",
      status: fallbackStatus.status,
      detail: "Define where to return, who to notify, and what to restart.",
      severity: fallbackStatus.severity,
    });

    const belongingsStatus = { status: "Not triaged", severity: "warn" as Severity };
    push({
      key: "belongings",
      title: "Belongings triage",
      status: belongingsStatus.status,
      detail: "Separate irreplaceable from replaceable; set loss tolerance.",
      severity: belongingsStatus.severity,
    });

    const arrivalStatus = { status: "Buffer unset", severity: "warn" as Severity };
    push({
      key: "arrival",
      title: "Arrival buffer",
      status: arrivalStatus.status,
      detail: "Block 24-72h for rest, meds, comms, and basics before new tasks.",
      severity: arrivalStatus.severity,
    });

    push({
      key: "cognitive",
      title: "Cognitive load",
      status: isClear("cognitive") ? "Reviewed" : "Load unprotected",
      detail: "Rest windows and no-decision periods protected before and after travel.",
      severity: isClear("cognitive") ? "ok" : "warn",
    });

    push({
      key: "supportTested",
      title: "Support verification",
      status: isClear("supportTested") ? "Reviewed" : "Support untested",
      detail: "Backup contacts confirmed with a real test and timing expectations set.",
      severity: isClear("supportTested") ? "ok" : "warn",
    });

    push({
      key: "docsAccess",
      title: "Document access",
      status: isClear("docsAccess") ? "Reviewed" : "Access unverified",
      detail: "Critical records available offline in usable formats without 2FA hurdles.",
      severity: isClear("docsAccess") ? "ok" : "warn",
    });

    push({
      key: "expectations",
      title: "Expectation buffer",
      status: isClear("expectations") ? "Reviewed" : "Buffers thin",
      detail: "Stabilization timelines padded; systems given realistic response time.",
      severity: isClear("expectations") ? "ok" : "warn",
    });

    const openCount = preDeparture.topBlockers.length;
    push({
      key: "preDeparture",
      title: "Pre-departure",
      status: preDeparture.status === "window-open" ? "Window open" : "Not yet",
      detail: openCount ? `${openCount} blockers listed.` : "Add blockers and time constraints to open the window.",
      severity: preDeparture.status === "window-open" ? "ok" : openCount ? "danger" : "warn",
    });

    const degrading = stability.focuses.filter((f) => f.status === "degrading").length;
    push({
      key: "stability",
      title: "Stability",
      status: stability.active ? "Holding" : "Planning",
      detail: degrading ? `${degrading} items degrading.` : "Keep essentials steady while you wait.",
      severity: degrading ? "danger" : stability.active ? "warn" : "ok",
    });

    push({
      key: "risk",
      title: "Risk boundaries",
      status: `${riskBoundaries.length} recorded`,
      detail: riskBoundaries.length ? "Review abort/forced-move rules." : "Add boundaries to protect against unsafe moves.",
      severity: riskBoundaries.length ? "ok" : "warn",
    });

    push({
      key: "snapshots",
      title: "Snapshots",
      status: snapshots.length ? `${snapshots.length} saved` : "None",
      detail: snapshots[0]?.summary ?? "Capture a quick state with known blockers and unknowns.",
      severity: snapshots.length ? "ok" : "warn",
    });

    push({
      key: "notes",
      title: "Notes",
      status: `${notes.length} entries`,
      detail: notes[0]?.text ?? "Keep private notes tied to blockers or snapshots.",
      severity: notes.length ? "ok" : "warn",
    });

    const hard = evaluation?.hardBlockers?.length ?? 0;
    const soft = evaluation?.softBlockers?.length ?? 0;
    push({
      key: "evaluation",
      title: "Evaluation",
      status: evaluation ? (evaluation.status === "ready" && hard === 0 ? "Ready" : "Not ready") : "Pending",
      detail: evaluation?.earliestWindow ?? "Run evaluation to see your window.",
      severity: hard > 0 ? "danger" : soft > 0 ? "warn" : evaluation?.status === "ready" ? "ok" : "warn",
    });

    push({
      key: "export",
      title: "Exports",
      status: evaluation?.status === "ready" ? "Ready to export" : "Draft",
      detail: "Save or print your readiness pack offline.",
      severity: evaluation?.status === "ready" ? "ok" : "warn",
    });

    push({
      key: "holding",
      title: "Holding pattern",
      status: mode === "holding" ? "Holding" : "Planning",
      detail: mode === "holding" ? "You chose to pause; keep monitoring." : "Switch to holding if you need to wait.",
      severity: mode === "holding" ? "warn" : "ok",
    });

    return items.sort((a, b) => (priority[a.key] ?? 99) - (priority[b.key] ?? 99));
  }, [
    constraints,
    continuity,
    evaluation,
    mode,
    notes,
    preDeparture,
    riskBoundaries.length,
    snapshots,
    stability.active,
    stability.focuses,
  ]);

  const groupedCards = useMemo(() => {
    const groups: Record<string, ActionCard[]> = { now: [], often: [], later: [] };
    cards.forEach((card) => {
      const rank = card.key;
      if (["stability", "preDeparture", "evaluation", "holding", "arrival"].includes(rank)) groups.now.push(card);
      else if (
        [
          "risk",
          "fallback",
          "comms",
          "access",
          "identityInference",
          "devices",
          "cashRunway",
          "cutoffs",
          "income",
          "healthcare",
          "housing",
          "dependents",
          "legal",
          "addressShadow",
          "mail",
          "jurisdiction",
          "cognitive",
          "supportTested",
          "docsAccess",
          "expectations",
        ].includes(rank)
      )
        groups.often.push(card);
      else groups.later.push(card);
    });
    return groups;
  }, [cards]);

  const cardByKey = useMemo(() => {
    const map = new Map<DrawerKey, ActionCard>();
    cards.forEach((c) => map.set(c.key, c));
    return map;
  }, [cards]);

  const workflow = useMemo<Array<{ key: DrawerKey; label: string; description: string }>>(
    () => [
      { key: "evaluation", label: "Run a quick evaluation", description: "Scan blockers, earliest window, and what is missing." },
      { key: "legal", label: "IDs, docs, admin", description: "Identity, permits, insurance, address changes planned." },
      { key: "identityInference", label: "Identity continuity", description: "Fraud-risk actions sequenced; gradual changes to devices and IPs." },
      { key: "access", label: "Account access", description: "Critical logins and recovery paths verified offline." },
      { key: "comms", label: "Communications continuity", description: "Phone/email/2FA access preserved through move." },
      { key: "cutoffs", label: "Time cutoffs", description: "Payroll, rent, benefits, and deadlines verified across time zones." },
      { key: "housing", label: "Move-out & move-in", description: "Notice sent, dates booked, utilities scheduled." },
      { key: "income", label: "Income continuity", description: "Employer/clients notified; pay and benefits timing set." },
      { key: "cashRunway", label: "Cash buffer", description: "3+ months covered; overlap costs earmarked." },
      { key: "addressShadow", label: "Address propagation", description: "All critical systems updated; old addresses identified and monitored." },
      { key: "jurisdiction", label: "Jurisdiction overlap", description: "Overlapping obligations and rules identified during transition." },
      { key: "mail", label: "Mail continuity", description: "Forwarding active; critical senders listed; delivery gaps anticipated." },
      { key: "devices", label: "Device resilience", description: "Primary device backed up; recovery paths available without internet." },
      { key: "cognitive", label: "Cognitive load", description: "Rest windows and no-decision periods protected." },
      { key: "dependents", label: "Dependents plan", description: "Care, school, records, and backups arranged." },
      { key: "healthcare", label: "Healthcare continuity", description: "Coverage active; meds refilled; providers ready." },
      { key: "risk", label: "Risk boundaries", description: "Abort and forced-move triggers defined." },
      { key: "fallback", label: "Fallback recovery", description: "If aborted, return and recovery path defined." },
      { key: "belongings", label: "Belongings triage", description: "Critical vs replaceable items separated." },
      { key: "supportTested", label: "Support verification", description: "Backup contacts confirmed and tested before reliance." },
      { key: "docsAccess", label: "Document access", description: "Critical records available offline in usable formats." },
      { key: "preDeparture", label: "Departure day plan", description: "Transport booked; essentials packed; services confirmed." },
      { key: "arrival", label: "Arrival buffer", description: "First 24–72 hours stabilized before new actions." },
      { key: "holding", label: "Holding mode", description: "Final confirmations and arrival checks." },
      { key: "snapshots", label: "Snapshot state", description: "Save current status before changes." },
      { key: "notes", label: "Notes", description: "Context for future self." },
      { key: "export", label: "Offline pack", description: "Printable, portable records." },
      { key: "expectations", label: "Expectation buffer", description: "Stabilization timelines realistically padded." },
      { key: "stability", label: "Waiting stability", description: "If paused, protect power, funds, meds, comms." },
    ],
    [],
  );

  const unresolvedCount = useMemo(() => cards.filter((c) => c.severity !== "ok").length, [cards]);

  const handleOpen = (key: DrawerKey) => {
    if (isConstraintKey(key)) {
      setFormState(constraints);
    }
    setActiveKey(key);
  };

  const saveActive = () => {
    if (!isConstraintKey(activeKey)) return;
    updateConstraints({ [activeKey]: formState[activeKey] } as Partial<Constraints>);
    setActiveKey(null);
  };

  const statusSummary = evaluation ? evaluation : (null as EvaluationResult | null);
  const activeTitle = activeKey ? cardByKey.get(activeKey)?.title ?? (activeKey as string) : "";

  const handleQuickWipe = () => {
    if (!hydrated) return;
    setConfirmOpen(true);
  };

  const performQuickWipe = () => {
    setConfirmOpen(false);
    setWiping(true);
    try {
      resetConstraints();
      resetContinuity();
      resetSnapshots();
      resetPreDeparture();
      resetStability();
      resetRiskBoundaries();
      resetNotes();
      resetChangeLog();
      clearEvaluation();
      setMode("planning");
      deleteAppState();
      clearExitWindowStorage();
      setFormState(useConstraintsStore.getState().constraints);
      setActiveKey(null);
      setNextOpen(false);
    } finally {
      setWiping(false);
    }
  };

  const ThemeToggle = () => {
    const { resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    if (!mounted) return null;

    const isDark = resolvedTheme === "dark";
    const nextTheme = isDark ? "light" : "dark";

    return (
      <button
        type="button"
        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        onClick={() => setTheme(nextTheme)}
        aria-label={`Switch to ${nextTheme} theme`}
      >
        <span>{isDark ? "Switch to light" : "Switch to dark"}</span>
        <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] text-white dark:bg-slate-100 dark:text-slate-900">
          {isDark ? "Dark" : "Light"}
        </span>
      </button>
    );
  };

  return (
    <>
      <main className="flex flex-col gap-4">
        <section className="rounded-2xl border border-slate-200 bg-card p-3 shadow-sm text-card-foreground dark:border-slate-700 m-auto w-full max-w-4xl text-center">
          <div className="flex flex-col gap-4 w-full m-auto">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">Exit Window status</p>
                <h1 className="text-2xl text-center font-semibold text-slate-900 dark:text-slate-100">{statusSummary?.status === "ready" ? "Window is within reach" : "Work remains before exit"}</h1>
                <p className="text-sm text-slate-700 leading-6 dark:text-slate-300">
                  {statusSummary?.summary ?? "Track blockers, housing, income, and care here. This stays on your device."}
                </p>
              </div>
              <div className="flex flex-col gap-2 text-sm w-full sm:w-auto items-center">
                <Chip tone={statusSummary?.status === "ready" ? "positive" : "warn"} variant="soft">
                  {statusSummary?.status === "ready" ? "Ready after soft blockers" : "Not yet ready"}
                </Chip>
                <span className="text-slate-600 dark:text-slate-300">{unresolvedCount} items need attention</span>
                <ThemeToggle />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {glanceItems.map((item) => (
                <div key={item.key} className={`rounded-xl border px-4 py-3 shadow-sm ${badgeSoftTone[item.severity]}`}>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-600 dark:text-slate-300">{item.label}</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{item.value}</p>
                  {item.note ? <p className="text-xs leading-5 text-slate-700 dark:text-slate-300">{item.note}</p> : null}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3 w-full justify-center mt-2">
              <button
                type="button"
                className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-900 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-800 dark:bg-rose-900 dark:text-rose-100 dark:hover:bg-rose-800"
                onClick={handleQuickWipe}
                disabled={!hydrated || wiping}
              >
                {wiping ? "Wiping…" : "Quick wipe"}
              </button>
              <button
                type="button"
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
                onClick={() => setNextOpen(true)}
              >
                What Is Next
              </button>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex flex-col items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Tap a card to update</h2>
            </div>
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">Bottom drawer opens to edit</span>
          </div>

          <div className="space-y-4">
            <ActionCardSection label="Needs watching" accentClass="text-rose-700 dark:text-rose-300">
              {groupedCards.now.map((card) => (
                <ActionCardButton key={card.key} card={card} onOpen={handleOpen} />
              ))}
            </ActionCardSection>

            <ActionCardSection label="Review regularly" accentClass="text-amber-700 dark:text-amber-300">
              {groupedCards.often.map((card) => (
                <ActionCardButton key={card.key} card={card} onOpen={handleOpen} />
              ))}
            </ActionCardSection>

            <ActionCardSection label="One-time or infrequent" accentClass="text-slate-600 dark:text-slate-300">
              {groupedCards.later.map((card) => (
                <ActionCardButton key={card.key} card={card} onOpen={handleOpen} />
              ))}
            </ActionCardSection>
          </div>
        </section>

        <NextStepsDrawer
          open={nextOpen}
          onClose={() => setNextOpen(false)}
          workflow={workflow}
          cardByKey={cardByKey}
          onOpenKey={handleOpen}
        />
        <ConstraintDrawer
          open={isConstraintKey(activeKey)}
          activeKey={isConstraintKey(activeKey) ? activeKey : null}
          formState={formState}
          setFormState={setFormState}
          onClose={() => setActiveKey(null)}
          onSave={saveActive}
        />
        <PanelDrawer
          open={Boolean(activeKey && !isConstraintKey(activeKey))}
          title={activeTitle}
          onClose={() => setActiveKey(null)}
        >
          {activeKey === "preDeparture" && <PreDepartureStatusPanel />}
          {activeKey === "stability" && <StabilityModePanel />}
          {activeKey === "risk" && <RiskBoundaryPanel />}
          {activeKey === "fallback" && <FallbackRecoveryPanel />}
          {activeKey === "comms" && <CommsContinuityPanel />}
          {activeKey === "access" && <AccountAccessPanel />}
          {activeKey === "belongings" && <BelongingsTriagePanel />}
          {activeKey === "arrival" && <ArrivalBufferPanel />}
          {activeKey === "identityInference" && <IdentityInferencePanel />}
          {activeKey === "cutoffs" && <CutoffDriftPanel />}
          {activeKey === "addressShadow" && <AddressShadowPanel />}
          {activeKey === "jurisdiction" && <JurisdictionOverlapPanel />}
          {activeKey === "mail" && <MailContinuityPanel />}
          {activeKey === "devices" && <DeviceResiliencePanel />}
          {activeKey === "cognitive" && <CognitiveLoadPanel />}
          {activeKey === "supportTested" && <SupportVerificationPanel />}
          {activeKey === "docsAccess" && <DocumentAccessPanel />}
          {activeKey === "expectations" && <ExpectationBufferPanel />}
          {activeKey === "snapshots" && <ReadinessSnapshots />}
          {activeKey === "notes" && <ScopedNotesPanel />}
          {activeKey === "evaluation" && (
            <div className="space-y-4">
              <EvaluationSummary />
              <EvaluationActions />
            </div>
          )}
          {activeKey === "export" && (
            <div className="space-y-4">
              <PreDepartureExport />
              <ExportControls />
            </div>
          )}
          {activeKey === "holding" && <HoldingPattern />}
        </PanelDrawer>
      </main>

      {confirmOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-md space-y-4 rounded-2xl border border-slate-200 bg-card p-6 shadow-2xl text-card-foreground dark:border-slate-700">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-rose-600 dark:text-rose-300">Danger action</p>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Clear all local data?</h3>
              <p className="text-sm leading-6 text-slate-700 dark:text-slate-300">
                This deletes constraints, notes, snapshots, and evaluation data on this device. This cannot be undone.
              </p>
            </div>
            <div className="flex flex-wrap justify-end gap-2 text-sm">
              <button
                type="button"
                className="rounded-lg border border-slate-200 px-4 py-2 font-semibold text-slate-800 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                onClick={() => setConfirmOpen(false)}
                disabled={wiping}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-lg border border-rose-200 bg-rose-600 px-4 py-2 font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60 dark:border-rose-700 dark:bg-rose-700 dark:hover:bg-rose-600"
                onClick={performQuickWipe}
                disabled={wiping}
              >
                {wiping ? "Wiping…" : "Confirm wipe"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

const InfoPanel = ({ title, items }: { title: string; items: string[] }) => (
  <div className="space-y-3">
    <p className="text-sm text-slate-700 dark:text-slate-300">{title}</p>
    <ul className="list-disc space-y-2 pl-5 text-sm text-slate-800 dark:text-slate-200">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  </div>
);

const ContinuityToggle = ({ checkKey }: { checkKey: ContinuityKey }) => {
  const status = useContinuityStore((state) => state.checks[checkKey]);
  const setStatus = useContinuityStore((state) => state.setStatus);
  const isClear = status === "clear";

  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
      <span>{isClear ? "Marked clear" : "Needs attention"}</span>
      <button
        type="button"
        className={`rounded-lg px-3 py-1 transition ${isClear
          ? "border border-amber-200 text-amber-800 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-100 dark:hover:bg-amber-900/25"
          : "border border-emerald-200 text-emerald-800 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-100 dark:hover:bg-emerald-900/25"
          }`}
        onClick={() => setStatus(checkKey, isClear ? "open" : "clear")}
      >
        {isClear ? "Mark needs attention" : "Mark clear"}
      </button>
    </div>
  );
};

const ContinuityPanel = ({ title, items, checkKey }: { title: string; items: string[]; checkKey: ContinuityKey }) => (
  <div className="space-y-3">
    <InfoPanel title={title} items={items} />
    <ContinuityToggle checkKey={checkKey} />
  </div>
);

const CommsContinuityPanel = () => (
  <InfoPanel
    title="Keep communications and 2FA reachable across the move."
    items={[
      "Port/retain primary number; carry a backup SIM/eSIM.",
      "Verify 2FA code paths for banks, payroll, and government accounts.",
      "Store recovery email and phone that will stay active.",
      "Print or export backup codes for critical accounts and keep offline.",
      "Add a trusted recovery contact where supported.",
    ]}
  />
);

const AccountAccessPanel = () => (
  <InfoPanel
    title="Prove you can sign in even if a device or network fails."
    items={[
      "Test sign-in to work, school, healthcare, and banking portals.",
      "Ensure password manager access offline (master secret and device unlock).",
      "Cache backup codes for SSO/2FA and store them offline.",
      "Document device unlock fallbacks (PIN, hardware key, recovery keys).",
      "List who can help recover access and how to reach them without primary devices.",
    ]}
  />
);

const BelongingsTriagePanel = () => (
  <InfoPanel
    title="Decide what must survive versus what can be replaced."
    items={[
      "Mark irreplaceable items and pack them separately or on your person.",
      "Photograph critical items and documents before transit.",
      "Group replaceable items and label for easy abandon/ship decisions.",
      "Set explicit loss tolerance: what you can leave behind if rushed.",
      "Prepare a tiny essentials kit that covers 72 hours if bags are lost.",
    ]}
  />
);

const ArrivalBufferPanel = () => (
  <InfoPanel
    title="Protect the first 24-72 hours after arrival."
    items={[
      "Pre-book a safe, low-decision place to sleep and recover.",
      "Confirm local power, water, internet/phone, and charging on arrival.",
      "Hydrate, eat, and sleep before major decisions; pause new tasks for a day.",
      "Check meds, refrigeration needs, and time-sensitive items immediately.",
      "Send a quick all-clear to trusted contacts once settled.",
    ]}
  />
);

const FallbackRecoveryPanel = () => (
  <InfoPanel
    title="If you abort or must return, do it deliberately."
    items={[
      "Name the fallback location and who will meet or house you.",
      "Keep tickets, routes, and payment methods ready for the return leg.",
      "List which services to re-enable first (housing, income, banking, comms).",
      "Pre-draft notifications to employers, schools, and key contacts.",
      "Note acceptable losses and what you will not risk retrieving.",
    ]}
  />
);

const IdentityInferencePanel = () => (
  <ContinuityPanel
    checkKey="identityInference"
    title="Keep behavioral identity steady while location and devices change."
    items={[
      "Stage device, SIM, and IP changes over days; avoid simultaneous shifts.",
      "Pre-notify banks and payroll of travel or address transitions.",
      "Keep a known network/VPN route for logins flagged as risky.",
      "Test 2FA from a secondary device before travel day.",
      "Carry a fallback payment path while accounts may be under review.",
    ]}
  />
);

const CutoffDriftPanel = () => (
  <ContinuityPanel
    checkKey="cutoffs"
    title="Deadlines move when time zones change; pin them down."
    items={[
      "List payroll, rent, benefits, and application cutoffs with their source time zones.",
      "Add buffers for bank settlement and employer processing windows.",
      "Set reminders in both origin and destination local time.",
      "Avoid same-day transfers across zones; move funds a day earlier.",
      "Document grace periods and who can confirm receipt if systems lag.",
    ]}
  />
);

const AddressShadowPanel = () => (
  <ContinuityPanel
    checkKey="addressShadow"
    title="Old addresses linger in shadow copies; surface and clear them."
    items={[
      "Audit credit bureaus, insurance, healthcare, and school portals for stale addresses.",
      "Submit updates where propagation is slow (insurers, payroll, benefits).",
      "Monitor statements and alerts that still reference the old location.",
      "Keep proof of change submissions for disputes or coverage checks.",
      "Note any systems that refuse to change until a later milestone.",
    ]}
  />
);

const JurisdictionOverlapPanel = () => (
  <ContinuityPanel
    checkKey="jurisdiction"
    title="Overlap periods trigger competing rules; map them explicitly."
    items={[
      "List which state or country claims residency during the overlap window.",
      "Note tax, benefits, and insurance obligations tied to each jurisdiction.",
      "Capture the exact dates when residency or coverage flips.",
      "Check employer, insurer, and school policies for dual-location periods.",
      "Document who can confirm compliance if questioned later.",
    ]}
  />
);

const MailContinuityPanel = () => (
  <ContinuityPanel
    checkKey="mail"
    title="Mail gaps hide critical notices; close the gaps."
    items={[
      "Activate forwarding and note its start/lag dates.",
      "List critical senders (banks, insurers, schools) and update them directly.",
      "Use tracking or digital copies for anything that can trigger penalties.",
      "Keep a backup receiver who can check physical mail during the overlap.",
      "Record how to prove delivery or non-receipt if challenged.",
    ]}
  />
);

const DeviceResiliencePanel = () => (
  <ContinuityPanel
    checkKey="devices"
    title="Avoid single-device failure cascades."
    items={[
      "Carry a second unlocked device or SIM/eSIM ready to activate.",
      "Export offline 2FA/backup codes for critical accounts.",
      "Store offline maps, contacts, and payment methods.",
      "Test sign-in on the backup device before departure.",
      "Keep charger/adapters and a small power buffer always accessible.",
    ]}
  />
);

const CognitiveLoadPanel = () => (
  <ContinuityPanel
    checkKey="cognitive"
    title="Protect decision quality when tired or overloaded."
    items={[
      "Pre-schedule rest windows and sleep before high-stakes tasks.",
      "Set no-decision periods after arrival or heavy travel days.",
      "Use short defaults (e.g., extend stay one day) instead of fresh decisions.",
      "Limit critical tasks per day; batch low-stakes chores separately.",
      "Keep a one-page snapshot to avoid re-deriving priorities when tired.",
    ]}
  />
);

const SupportVerificationPanel = () => (
  <ContinuityPanel
    checkKey="supportTested"
    title="Assume support is untested until proved."
    items={[
      "Run a small test ask with each backup contact and record response time.",
      "Confirm time zones, availability windows, and escalation paths.",
      "Share offline ways to reach you and them (SMS, alt email, landline).",
      "Clarify what each contact can actually provide (ride, cash, housing, calls).",
      "Note a backup to the backup if the primary helper is unavailable.",
    ]}
  />
);

const DocumentAccessPanel = () => (
  <ContinuityPanel
    checkKey="docsAccess"
    title="Documents count only if reachable when offline or locked out."
    items={[
      "Store critical records offline in portable formats (PDF + print for key items).",
      "Ensure access is not gated by the same device or 2FA factor.",
      "Keep decryption keys or passwords separately from the files.",
      "Mirror copies across at least two mediums (device + secure drive).",
      "Verify files open on a backup device before travel day.",
    ]}
  />
);

const ExpectationBufferPanel = () => (
  <ContinuityPanel
    checkKey="expectations"
    title="Pad timelines; systems respond slower than hoped."
    items={[
      "Add buffer days for utilities, banking changes, and ID updates to clear.",
      "Budget extra for overlap costs and delayed deposits.",
      "Assume at least one critical system will require re-submission.",
      "Define a threshold to pause or extend holding mode if stability lags.",
      "Keep a simple review cadence to recalibrate expectations weekly.",
    ]}
  />
);
