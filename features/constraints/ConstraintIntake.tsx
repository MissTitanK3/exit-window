// Composes all constraint intake sections.
"use client";

import { HousingSection } from "./HousingSection";
import { IncomeSection } from "./IncomeSection";
import { CashRunwaySection } from "./CashRunwaySection";
import { DependentsSection } from "./DependentsSection";
import { HealthcareSection } from "./HealthcareSection";
import { LegalSection } from "./LegalSection";

export const ConstraintIntake = () => (
  <div className="flex flex-col gap-4">
    <HousingSection />
    <IncomeSection />
    <CashRunwaySection />
    <DependentsSection />
    <HealthcareSection />
    <LegalSection />
  </div>
);
