"use client";

import { useState } from "react";
import { Chip } from "./Chip";
import type { Constraints } from "@/domain/types";

export type ConstraintKey = keyof Constraints;
export type DrawerKey =
  | ConstraintKey
  | "preDeparture"
  | "stability"
  | "risk"
  | "fallback"
  | "snapshots"
  | "notes"
  | "evaluation"
  | "export"
  | "holding"
  | "comms"
  | "access"
  | "belongings"
  | "arrival"
  | "identityInference"
  | "cutoffs"
  | "addressShadow"
  | "jurisdiction"
  | "mail"
  | "devices"
  | "cognitive"
  | "supportTested"
  | "docsAccess"
  | "expectations";

export type Severity = "ok" | "warn" | "danger";

export type ActionCard = {
  key: DrawerKey;
  title: string;
  status: string;
  detail: string;
  severity: Severity;
};

const constraintKeys: ConstraintKey[] = ["housing", "income", "cashRunway", "healthcare", "dependents", "legal"];
export const isConstraintKey = (key: DrawerKey | null): key is ConstraintKey => (key ? constraintKeys.includes(key as ConstraintKey) : false);

const ternaryOptions = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "unknown", label: "Not sure yet" },
];

export const badgeSoftTone: Record<Severity, string> = {
  ok: "bg-emerald-50 text-primary border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800",
  warn: "bg-amber-50 text-primary border-amber-200 dark:bg-amber-900/25  dark:border-amber-800",
  danger: "bg-rose-50 text-primary border-rose-200 dark:bg-rose-900/25 dark:border-rose-800",
};

const BottomDrawer = ({
  open,
  title,
  onClose,
  children,
  footer,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/40 backdrop-blur-sm">
      <button aria-label="Close" className="absolute inset-0" onClick={onClose} />
      <div className="relative rounded-t-2xl bg-white p-6 shadow-2xl max-w-4xl mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10 w-full dark:bg-slate-900 dark:border dark:border-slate-800">
        <div className="flex items-start justify-between gap-4 overflow-x-hidden">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">Drawer</p>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
          </div>
          <button
            type="button"
            className="rounded-full border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-100"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <div className="mt-4 max-h-[60vh] overflow-y-auto pr-1 text-slate-800 dark:text-slate-200">{children}</div>
        {footer ? <div className="mt-6 flex justify-end gap-3">{footer}</div> : null}
      </div>
    </div>
  );
};

export const NextStepsDrawer = ({
  open,
  onClose,
  workflow,
  cardByKey,
  onOpenKey,
}: {
  open: boolean;
  onClose: () => void;
  workflow: Array<{ key: DrawerKey; label: string; description: string }>;
  cardByKey: Map<DrawerKey, ActionCard>;
  onOpenKey: (key: DrawerKey) => void;
}) => {
  if (!open) return null;
  return <NextStepsContent workflow={workflow} cardByKey={cardByKey} onOpenKey={onOpenKey} onClose={onClose} />;
};

const NextStepsContent = ({
  workflow,
  cardByKey,
  onOpenKey,
  onClose,
}: {
  workflow: Array<{ key: DrawerKey; label: string; description: string }>;
  cardByKey: Map<DrawerKey, ActionCard>;
  onOpenKey: (key: DrawerKey) => void;
  onClose: () => void;
}) => {
  const [index, setIndex] = useState(0);

  const total = workflow.length;
  const safeIndex = total ? Math.min(index, total - 1) : 0;
  const currentStep = total ? workflow[safeIndex] : null;
  const card = currentStep ? cardByKey.get(currentStep.key) : null;

  return (
    <BottomDrawer
      open
      title="What Is Next"
      onClose={() => {
        setIndex(0);
        onClose();
      }}
      footer={
        total > 1 ? (
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-300"
              onClick={() => setIndex((prev) => (prev === 0 ? total - 1 : prev - 1))}
            >
              Back
            </button>
            <button
              type="button"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
              onClick={() => setIndex((prev) => (prev + 1) % total)}
            >
              Next
            </button>
          </div>
        ) : null
      }
    >
      <div className="space-y-4 text-sm leading-6">
        {currentStep ? (
          <>
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
              <span>Step {safeIndex + 1}</span>
              <span>{total} total</span>
            </div>
            <div className="flex gap-2 overflow-x-auto py-3">
              {workflow.map((step, idx) => {
                const c = cardByKey.get(step.key);
                return (
                  <button
                    key={step.key}
                    type="button"
                    className={`flex items-center rounded-full min-w-54 border px-3 py-1 text-[11px] transition ${c ? badgeSoftTone[c.severity] : badgeSoftTone.warn
                      } ${idx === safeIndex ? "ring-2 ring-slate-900/60 dark:ring-slate-100/50" : "hover:border-slate-300 dark:hover:border-slate-600"}`}
                    onClick={() => setIndex(idx)}
                  >
                    <div>
                      <Chip tone="neutral" variant="solid" size="xs" className="px-2! py-0.5! uppercase tracking-[0.08em]">
                        {idx + 1}
                      </Chip>
                    </div>
                    <div className="flex flex-col gap-1 w-full text-center">
                      <span className="whitespace-nowrap">{step.label}</span>
                      {c ? <span className="hidden sm:inline">• {c.status}</span> : null}
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="rounded-xl border border-slate-100 bg-card p-4 shadow-sm text-card-foreground dark:border-slate-700">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 justify-between">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-white dark:bg-slate-100 dark:text-slate-900">{safeIndex + 1}</span>
                      <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{currentStep.label}</span>
                    </div>
                    {card ? (
                      <Chip tone={card.severity === "ok" ? "positive" : card.severity === "warn" ? "warn" : "danger"} variant="soft" size="xs" className="whitespace-nowrap">
                        {card.status}
                      </Chip>
                    ) : null}
                  </div>
                  <p className="text-sm text-slate-700 leading-6 dark:text-slate-300">{currentStep.description}</p>
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
                  onClick={() => onOpenKey(currentStep.key)}
                >
                  Open this
                </button>
              </div>
            </div>
          </>
        ) : (
          <p className="rounded-lg bg-slate-50 p-3 font-medium text-slate-900 dark:bg-slate-800 dark:text-slate-100">You are clear for now. Keep monitoring your items.</p>
        )}
      </div>
    </BottomDrawer>
  );
};

export const ConstraintDrawer = ({
  open,
  activeKey,
  formState,
  setFormState,
  onClose,
  onSave,
}: {
  open: boolean;
  activeKey: ConstraintKey | null;
  formState: Constraints;
  setFormState: (next: Constraints) => void;
  onClose: () => void;
  onSave: () => void;
}) => {
  if (!activeKey) return null;

  const updateField = <K extends ConstraintKey, F extends keyof Constraints[K]>(key: K, field: F, value: Constraints[K][F]) => {
    setFormState({ ...formState, [key]: { ...formState[key], [field]: value } });
  };

  const fields = {
    housing: (
      <div className="space-y-4">
        <p className="text-sm text-slate-700">Confirm housing timeline and key handoffs without extra typing.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1 text-sm font-semibold text-slate-800">
            Status
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={formState.housing.status}
              onChange={(e) => updateField("housing", "status", e.target.value as Constraints["housing"]["status"])}
            >
              <option value="aligned">Aligned with exit window</option>
              <option value="notice-required">Notice required</option>
              <option value="locked-in">Locked in</option>
              <option value="unknown">Unknown</option>
            </select>
          </label>
          <label className="space-y-1 text-sm font-semibold text-slate-800">
            Lease end date
            <input
              type="date"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={formState.housing.leaseEndDate ?? ""}
              onChange={(e) => updateField("housing", "leaseEndDate", e.target.value || undefined)}
            />
          </label>
          <label className="space-y-1 text-sm font-semibold text-slate-800">
            Notice days (if any)
            <input
              type="number"
              min={0}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={formState.housing.noticeDays ?? ""}
              onChange={(e) => updateField("housing", "noticeDays", e.target.value ? Number(e.target.value) : undefined)}
            />
          </label>
          <label className="space-y-1 text-sm font-semibold text-slate-800">
            Notice sent
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={formState.housing.moveOutNoticeSent ?? "unknown"}
              onChange={(e) => updateField("housing", "moveOutNoticeSent", e.target.value as Constraints["housing"]["moveOutNoticeSent"])}
            >
              {ternaryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm font-semibold text-slate-800">
            New place secured
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={formState.housing.newPlaceSecured ?? "unknown"}
              onChange={(e) => updateField("housing", "newPlaceSecured", e.target.value as Constraints["housing"]["newPlaceSecured"])}
            >
              {ternaryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm font-semibold text-slate-800">
            Utilities stop/start planned
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={formState.housing.utilitiesTransferPlanned ?? "unknown"}
              onChange={(e) =>
                updateField("housing", "utilitiesTransferPlanned", e.target.value as Constraints["housing"]["utilitiesTransferPlanned"])
              }
            >
              {ternaryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <label className="sm:col-span-2 space-y-1 text-sm font-semibold text-slate-800">
            Note
            <textarea
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              rows={3}
              value={formState.housing.note ?? ""}
              onChange={(e) => updateField("housing", "note", e.target.value)}
            />
          </label>
        </div>
      </div>
    ),
    income: (
      <div className="space-y-4">
        <p className="text-sm text-slate-700">Record income stability with quick picks.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1 text-sm font-semibold text-slate-800">
            Stability
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={formState.income.stability}
              onChange={(e) => updateField("income", "stability", e.target.value as Constraints["income"]["stability"])}
            >
              <option value="stable">Stable</option>
              <option value="unstable">Unstable</option>
              <option value="unknown">Unknown</option>
            </select>
          </label>
          <label className="space-y-1 text-sm font-semibold text-slate-800">
            Employer/clients notified
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={formState.income.employerNotified ?? "unknown"}
              onChange={(e) => updateField("income", "employerNotified", e.target.value as Constraints["income"]["employerNotified"])}
            >
              {ternaryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm font-semibold text-slate-800">
            Final pay date known
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={formState.income.finalPayKnown ?? "unknown"}
              onChange={(e) => updateField("income", "finalPayKnown", e.target.value as Constraints["income"]["finalPayKnown"])}
            >
              {ternaryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm font-semibold text-slate-800">
            Benefits/taxes adjusted
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={formState.income.benefitsAdjusted ?? "unknown"}
              onChange={(e) => updateField("income", "benefitsAdjusted", e.target.value as Constraints["income"]["benefitsAdjusted"])}
            >
              {ternaryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm font-semibold text-slate-800">
            Backup income ready
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={formState.income.backupIncomeReady ?? "unknown"}
              onChange={(e) => updateField("income", "backupIncomeReady", e.target.value as Constraints["income"]["backupIncomeReady"])}
            >
              {ternaryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <label className="sm:col-span-2 space-y-1 text-sm font-semibold text-slate-800">
            Note
            <textarea
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              rows={3}
              value={formState.income.note ?? ""}
              onChange={(e) => updateField("income", "note", e.target.value)}
            />
          </label>
        </div>
      </div>
    ),
    cashRunway: (
      <div className="space-y-4">
        <p className="text-sm text-slate-700">Track cash runway with quick status and a couple checkboxes.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1 text-sm font-semibold text-slate-800">
            Months
            <input
              type="number"
              min={0}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={formState.cashRunway.months ?? ""}
              onChange={(e) => updateField("cashRunway", "months", e.target.value ? Number(e.target.value) : undefined)}
            />
          </label>
          <label className="space-y-1 text-sm font-semibold text-slate-800">
            Status
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={formState.cashRunway.status}
              onChange={(e) => updateField("cashRunway", "status", e.target.value as Constraints["cashRunway"]["status"])}
            >
              <option value="secure">Secure (3+ months)</option>
              <option value="tight">Tight (&lt;3 months)</option>
              <option value="unknown">Unknown</option>
            </select>
          </label>
          <label className="space-y-1 text-sm font-semibold text-slate-800">
            Move costs covered
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={formState.cashRunway.moveCostsCovered ?? "unknown"}
              onChange={(e) => updateField("cashRunway", "moveCostsCovered", e.target.value as Constraints["cashRunway"]["moveCostsCovered"])}
            >
              {ternaryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm font-semibold text-slate-800">
            Emergency buffer ready
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={formState.cashRunway.emergencyBufferReady ?? "unknown"}
              onChange={(e) =>
                updateField("cashRunway", "emergencyBufferReady", e.target.value as Constraints["cashRunway"]["emergencyBufferReady"])
              }
            >
              {ternaryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <label className="sm:col-span-2 space-y-1 text-sm font-semibold text-slate-800">
            Note
            <textarea
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              rows={3}
              value={formState.cashRunway.note ?? ""}
              onChange={(e) => updateField("cashRunway", "note", e.target.value)}
            />
          </label>
        </div>
      </div>
    ),
    dependents: (
      <div className="space-y-4">
        <p className="text-sm text-slate-700">Confirm support plans for any dependents with yes/no picks.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1 text-sm font-semibold text-slate-800">
            Coverage
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={formState.dependents.coverage}
              onChange={(e) => updateField("dependents", "coverage", e.target.value as Constraints["dependents"]["coverage"])}
            >
              <option value="supported">Supported</option>
              <option value="unsupported">Unsupported</option>
              <option value="unknown">Unknown</option>
            </select>
          </label>
          <label className="space-y-1 text-sm font-semibold text-slate-800">
            Care/childcare arranged
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={formState.dependents.careArranged ?? "unknown"}
              onChange={(e) => updateField("dependents", "careArranged", e.target.value as Constraints["dependents"]["careArranged"])}
            >
              {ternaryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm font-semibold text-slate-800">
            Records transferred
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={formState.dependents.recordsTransferred ?? "unknown"}
              onChange={(e) => updateField("dependents", "recordsTransferred", e.target.value as Constraints["dependents"]["recordsTransferred"])}
            >
              {ternaryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm font-semibold text-slate-800">
            Backup care ready
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={formState.dependents.backupCareReady ?? "unknown"}
              onChange={(e) => updateField("dependents", "backupCareReady", e.target.value as Constraints["dependents"]["backupCareReady"])}
            >
              {ternaryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <label className="sm:col-span-2 space-y-1 text-sm font-semibold text-slate-800">
            Note
            <textarea
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              rows={3}
              value={formState.dependents.note ?? ""}
              onChange={(e) => updateField("dependents", "note", e.target.value)}
            />
          </label>
        </div>
      </div>
    ),
    healthcare: (
      <div className="space-y-4">
        <p className="text-sm text-slate-700">Track continuity of healthcare with quick toggles.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1 text-sm font-semibold text-slate-800">
            Continuity
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={formState.healthcare.continuity}
              onChange={(e) => updateField("healthcare", "continuity", e.target.value as Constraints["healthcare"]["continuity"])}
            >
              <option value="secured">Secured</option>
              <option value="at-risk">At risk</option>
              <option value="unknown">Unknown</option>
            </select>
          </label>
          <label className="space-y-1 text-sm font-semibold text-slate-800">
            Coverage active during move
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={formState.healthcare.coverageActive ?? "unknown"}
              onChange={(e) => updateField("healthcare", "coverageActive", e.target.value as Constraints["healthcare"]["coverageActive"])}
            >
              {ternaryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm font-semibold text-slate-800">
            Meds stocked (30 days)
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={formState.healthcare.medsStocked ?? "unknown"}
              onChange={(e) => updateField("healthcare", "medsStocked", e.target.value as Constraints["healthcare"]["medsStocked"])}
            >
              {ternaryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm font-semibold text-slate-800">
            Records ready to share
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={formState.healthcare.recordsReady ?? "unknown"}
              onChange={(e) => updateField("healthcare", "recordsReady", e.target.value as Constraints["healthcare"]["recordsReady"])}
            >
              {ternaryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <label className="sm:col-span-2 space-y-1 text-sm font-semibold text-slate-800">
            Note
            <textarea
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              rows={3}
              value={formState.healthcare.note ?? ""}
              onChange={(e) => updateField("healthcare", "note", e.target.value)}
            />
          </label>
        </div>
      </div>
    ),
    legal: (
      <div className="space-y-4">
        <p className="text-sm text-slate-700">Capture legal or administrative blockers with quick picks.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1 text-sm font-semibold text-slate-800">
            Blocker status
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={formState.legal.blocker}
              onChange={(e) => updateField("legal", "blocker", e.target.value as Constraints["legal"]["blocker"])}
            >
              <option value="clear">Clear</option>
              <option value="present">Present</option>
              <option value="unknown">Unknown</option>
            </select>
          </label>
          <label className="space-y-1 text-sm font-semibold text-slate-800">
            IDs/visas valid
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={formState.legal.idsValid ?? "unknown"}
              onChange={(e) => updateField("legal", "idsValid", e.target.value as Constraints["legal"]["idsValid"])}
            >
              {ternaryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm font-semibold text-slate-800">
            Mail forwarding set
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={formState.legal.mailForwardingSet ?? "unknown"}
              onChange={(e) => updateField("legal", "mailForwardingSet", e.target.value as Constraints["legal"]["mailForwardingSet"])}
            >
              {ternaryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm font-semibold text-slate-800">
            Insurance proof ready (offline)
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={formState.legal.insuranceProofReady ?? "unknown"}
              onChange={(e) => updateField("legal", "insuranceProofReady", e.target.value as Constraints["legal"]["insuranceProofReady"])}
            >
              {ternaryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <label className="sm:col-span-2 space-y-1 text-sm font-semibold text-slate-800">
            Note
            <textarea
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              rows={3}
              value={formState.legal.note ?? ""}
              onChange={(e) => updateField("legal", "note", e.target.value)}
            />
          </label>
        </div>
      </div>
    ),
  } as const;

  return (
    <BottomDrawer
      open={open}
      onClose={onClose}
      title="Update this item"
      footer={
        <div className="flex gap-3">
          <button
            type="button"
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-primary hover:bg-slate-50 dark:border-slate-300 dark:text-slate-200 dark:hover:bg-slate-800"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-primary hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
            onClick={onSave}
          >
            Save
          </button>
        </div>
      }
    >
      {fields[activeKey]}
    </BottomDrawer>
  );
};

export const PanelDrawer = ({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: React.ReactNode }) => (
  <BottomDrawer open={open} title={title} onClose={onClose}>
    <div className="space-y-4">{children}</div>
  </BottomDrawer>
);
