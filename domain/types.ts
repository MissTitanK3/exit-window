// Domain types shared by stores, feature logic, and the evaluation engine.

export type Ternary = 'yes' | 'no' | 'unknown';

export type HousingConstraint = {
  status: 'aligned' | 'notice-required' | 'locked-in' | 'unknown';
  leaseEndDate?: string; // ISO date when lease ends if known
  noticeDays?: number; // days of notice required if applicable
  moveOutNoticeSent?: Ternary; // notice delivered to landlord
  newPlaceSecured?: Ternary; // next housing locked in
  utilitiesTransferPlanned?: Ternary; // stop/start for power, internet, water planned
  note?: string;
};

export type IncomeConstraint = {
  stability: 'stable' | 'unstable' | 'unknown';
  employerNotified?: Ternary; // notice or timing communicated
  finalPayKnown?: Ternary; // last paycheck or invoices scheduled
  benefitsAdjusted?: Ternary; // taxes/benefits updated for move
  backupIncomeReady?: Ternary; // contingency income option set
  note?: string;
};

export type CashRunwayConstraint = {
  months?: number;
  status: 'secure' | 'tight' | 'unknown';
  moveCostsCovered?: Ternary; // travel/deposit/overlap costs earmarked
  emergencyBufferReady?: Ternary; // small buffer reserved
  note?: string;
};

export type DependentsConstraint = {
  coverage: 'supported' | 'unsupported' | 'unknown';
  careArranged?: Ternary; // school/childcare/elder care booked
  recordsTransferred?: Ternary; // records ready to hand over
  backupCareReady?: Ternary; // backup caregiver named
  note?: string;
};

export type HealthcareConstraint = {
  continuity: 'secured' | 'at-risk' | 'unknown';
  coverageActive?: Ternary; // insurance active during move
  medsStocked?: Ternary; // refills on hand
  recordsReady?: Ternary; // medical records accessible
  note?: string;
};

export type LegalConstraint = {
  blocker: 'present' | 'clear' | 'unknown';
  idsValid?: Ternary; // passports/IDs/visas valid
  mailForwardingSet?: Ternary; // mail redirection planned
  insuranceProofReady?: Ternary; // proof of coverage reachable offline
  note?: string;
};

export type ContinuityKey =
  | 'identityInference'
  | 'cutoffs'
  | 'addressShadow'
  | 'jurisdiction'
  | 'mail'
  | 'devices'
  | 'cognitive'
  | 'supportTested'
  | 'docsAccess'
  | 'expectations';

export type ContinuityStatus = 'open' | 'clear';

export type Constraints = {
  housing: HousingConstraint;
  income: IncomeConstraint;
  cashRunway: CashRunwayConstraint;
  dependents: DependentsConstraint;
  healthcare: HealthcareConstraint;
  legal: LegalConstraint;
};

export type ExitStatus = 'ready' | 'not-yet';

export type EvaluationResult = {
  status: ExitStatus;
  hardBlockers: string[];
  softBlockers: string[];
  earliestWindow: string;
  reasons: string[];
  summary: string;
  orderedSteps: string[];
  generatedAt: string;
};

export type AppMode = 'planning' | 'holding';

export type PreDepartureStatus = 'not-yet' | 'window-open';

export type TimeConstraint = {
  id: string;
  label: string;
  targetDate?: string;
  note?: string;
};

export type PreDepartureFrame = {
  status: PreDepartureStatus;
  topBlockers: string[];
  nextRequiredCondition?: string;
  timeConstraints: TimeConstraint[];
  lastReviewedChangeAt?: string;
};

export type ConstraintChangeKind = 'constraint-changed' | 'blocker-resolved' | 'blocker-introduced';

export type ConstraintChangeEntry = {
  id: string;
  recordedAt: string;
  title: string;
  description: string;
  kind: ConstraintChangeKind;
  relatedConstraint?: keyof Constraints;
};

export type Snapshot = {
  id: string;
  createdAt: string;
  summary: string;
  knownBlockers: string[];
  unknowns: string[];
  notes: string;
  label?: string;
};

export type StabilityFocus = {
  id: string;
  label: string;
  mustRemainStable: string;
  status: 'stable' | 'watch' | 'degrading';
  note?: string;
  flaggedAt?: string;
};

export type StabilityStateFrame = {
  active: boolean;
  statement: string;
  focuses: StabilityFocus[];
};

export type RiskBoundaryCategory = 'abort' | 'forced-move' | 'reassess';

export type RiskBoundary = {
  id: string;
  category: RiskBoundaryCategory;
  description: string;
  addedAt: string;
};

export type ScopedNoteContext = 'constraint' | 'snapshot' | 'blocker';

export type ScopedNote = {
  id: string;
  context: ScopedNoteContext;
  contextId: string;
  text: string;
  createdAt: string;
};
