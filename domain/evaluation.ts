// Pure evaluation logic that inspects constraints and returns relocation readiness.
import type { Constraints, EvaluationResult } from './types';

const todayISO = () => new Date().toISOString();

const addReason = (list: string[], reason: string) => {
  if (!reason) return;
  list.push(reason);
};

export const evaluateConstraints = (constraints: Constraints): EvaluationResult => {
  const hardBlockers: string[] = [];
  const softBlockers: string[] = [];

  // Hard blockers
  if (constraints.legal.blocker === 'present') hardBlockers.push('Legal or administrative blocker present.');
  if (constraints.healthcare.continuity === 'at-risk') hardBlockers.push('Healthcare continuity is at risk.');
  if (constraints.dependents.coverage === 'unsupported') hardBlockers.push('Dependents do not have confirmed support.');
  if (constraints.cashRunway.months !== undefined && constraints.cashRunway.months < 1)
    hardBlockers.push('Cash runway is under 1 month.');

  // Soft blockers
  if (constraints.income.stability === 'unstable') softBlockers.push('Income is currently unstable.');
  if (
    constraints.cashRunway.status === 'tight' ||
    (constraints.cashRunway.months !== undefined &&
      constraints.cashRunway.months >= 1 &&
      constraints.cashRunway.months < 3)
  )
    softBlockers.push('Cash runway is tight (<3 months).');
  if (constraints.housing.status === 'notice-required') softBlockers.push('Housing requires notice before exit.');
  if (constraints.housing.status === 'locked-in') softBlockers.push('Lease is locked beyond the desired exit window.');
  if (constraints.housing.status === 'unknown') softBlockers.push('Housing end date is unknown.');
  if (constraints.legal.blocker === 'unknown') softBlockers.push('Legal/administrative status is unknown.');
  if (constraints.healthcare.continuity === 'unknown') softBlockers.push('Healthcare continuity needs confirmation.');
  if (constraints.dependents.coverage === 'unknown') softBlockers.push('Dependents support plan is unknown.');

  // Earliest window logic (simple, deterministic)
  let earliestWindow = 'Ready when blockers resolve';
  const reasons: string[] = [];

  if (hardBlockers.length === 0) {
    const housingDate = constraints.housing.leaseEndDate;
    if (housingDate) {
      earliestWindow = `Earliest after lease end on ${housingDate}`;
      if (constraints.housing.noticeDays && constraints.housing.noticeDays > 0) {
        addReason(reasons, `Send housing notice ${constraints.housing.noticeDays} days before ${housingDate}.`);
      }
    } else {
      earliestWindow = 'Earliest after confirming housing exit timing';
    }

    if (softBlockers.length === 0) {
      earliestWindow = housingDate ? `After ${housingDate}` : 'Window opens now';
    }
  } else {
    earliestWindow = 'Not available until hard blockers are removed';
  }

  const status = hardBlockers.length > 0 ? 'not-yet' : 'ready';

  // Reasons for not yet
  if (status === 'not-yet') {
    hardBlockers.forEach((b) => addReason(reasons, b));
  } else {
    softBlockers.forEach((b) => addReason(reasons, b));
  }

  const summary =
    status === 'ready'
      ? 'Constraints allow an exit window once soft blockers are addressed.'
      : 'Relocation is not yet possible due to hard blockers.';

  const orderedSteps: string[] = [];
  if (constraints.legal.blocker !== 'clear') orderedSteps.push('Resolve legal or administrative blockers.');
  if (constraints.healthcare.continuity !== 'secured') orderedSteps.push('Secure healthcare continuity.');
  if (constraints.dependents.coverage !== 'supported') orderedSteps.push('Confirm support plan for dependents.');
  if (constraints.housing.status === 'notice-required') orderedSteps.push('Serve required housing notice.');
  if (!constraints.housing.leaseEndDate) orderedSteps.push('Confirm lease end date.');
  if (constraints.income.stability !== 'stable') orderedSteps.push('Stabilize income source.');
  if (constraints.cashRunway.status !== 'secure') orderedSteps.push('Extend cash runway to 3+ months.');

  return {
    status,
    hardBlockers,
    softBlockers,
    earliestWindow,
    reasons,
    summary,
    orderedSteps,
    generatedAt: todayISO(),
  };
};
