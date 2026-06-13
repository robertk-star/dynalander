"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock, FileText, Loader2, Lock, ShieldCheck } from "lucide-react";
import { US_STATES } from "@/lib/usStates";

type QuestionType = "single" | "multi";
type AnswerValue = number | number[] | null;
type OutcomeKind = "sga" | "retirement" | "work_history" | "hot" | "warm" | "cool";

type Question = {
  id: "age" | "workHistory" | "currentWork" | "condition" | "limitations" | "applicationStatus";
  title: string;
  type: QuestionType;
  maxPoints?: number;
  options: Array<{ label: string; points?: number }>;
};

const SGA_MONTHLY_NON_BLIND = 1620;

const questions: Question[] = [
  {
    id: "age",
    title: "What is your age?",
    type: "single",
    options: [
      { label: "Under 50", points: 0 },
      { label: "50–54", points: 2 },
      { label: "55–59", points: 3 },
      { label: "60–66", points: 4 },
      { label: "67 or older", points: 0 },
    ],
  },
  {
    id: "workHistory",
    title: "In the last 10 years, how many years did you work and pay Social Security taxes?",
    type: "single",
    options: [
      { label: "Less than 4 years", points: 0 },
      { label: "4–6 years", points: 1 },
      { label: "7 years", points: 2 },
      { label: "8–10 years", points: 3 },
    ],
  },
  {
    id: "currentWork",
    title: "Are you currently working?",
    type: "single",
    options: [
      { label: "No, I am not working", points: 3 },
      { label: `Yes, but I earn less than about $${SGA_MONTHLY_NON_BLIND.toLocaleString()}/month`, points: 2 },
      { label: "Yes, I earn more than that", points: 0 },
    ],
  },
  {
    id: "condition",
    title: "Which best describes your main health condition?",
    type: "single",
    options: [
      { label: "Back, neck, joint, or musculoskeletal issue", points: 3 },
      { label: "Heart or circulatory condition", points: 3 },
      { label: "Lung or breathing condition", points: 3 },
      { label: "Mental health condition", points: 3 },
      { label: "Neurological condition", points: 3 },
      { label: "Diabetes or endocrine condition", points: 3 },
      { label: "Autoimmune disorder or cancer", points: 3 },
      { label: "Something else / I am not sure", points: 1 },
    ],
  },
  {
    id: "limitations",
    title: "Which of these affect your daily life? Choose all that apply.",
    type: "multi",
    maxPoints: 5,
    options: [
      { label: "Cannot lift more than 10–20 lbs" },
      { label: "Cannot stand or walk for more than 15–20 minutes" },
      { label: "Cannot sit for long periods without pain" },
      { label: "Need to lie down or rest during the day" },
      { label: "Trouble concentrating, remembering, or following instructions" },
      { label: "Need help with daily tasks like dressing, cooking, or errands" },
      { label: "Medication side effects affect my daily function" },
    ],
  },
  {
    id: "applicationStatus",
    title: "Have you applied for disability before?",
    type: "single",
    options: [
      { label: "No, never applied", points: 1 },
      { label: "Yes, applied and currently waiting", points: 1 },
      { label: "Yes, applied and was denied", points: 3 },
      { label: "Yes, denied more than once / currently appealing", points: 3 },
    ],
  },
];

function answerLabel(questionId: Question["id"], answers: AnswerValue[]) {
  const question = questions.find((item) => item.id === questionId);
  if (!question) return "";
  const answer = answers[questions.indexOf(question)];
  if (question.type === "multi") {
    const indexes = Array.isArray(answer) ? answer : [];
    return indexes.map((index) => question.options[index]?.label).filter(Boolean).join("; ");
  }
  if (typeof answer !== "number") return "";
  return question.options[answer]?.label ?? "";
}

function calculateScore(answers: AnswerValue[]) {
  return questions.reduce((score, question, index) => {
    const answer = answers[index];
    if (question.type === "single") {
      return score + (typeof answer === "number" ? question.options[answer]?.points ?? 0 : 0);
    }
    const count = Array.isArray(answer) ? answer.length : 0;
    return score + Math.min(count, question.maxPoints ?? count);
  }, 0);
}

function getOutcome(answers: AnswerValue[]) {
  const score = calculateScore(answers);
  const ageAnswer = answers[0];
  const workHistoryAnswer = answers[1];
  const currentWorkAnswer = answers[2];

  if (currentWorkAnswer === 2) {
    return {
      kind: "sga" as OutcomeKind,
      badge: "Income Review Needed",
      title: "Your current income may be too high for disability benefits right now.",
      message:
        "SSA usually looks closely at current earnings before considering disability. If your income is over the monthly SGA amount, it may be hard to move forward today. But health and income can change. The next step is to save your results and document your medical records, work limits, missed-work details, and income changes so you are ready if your income drops.",
    };
  }

  if (ageAnswer === 4) {
    return {
      kind: "retirement" as OutcomeKind,
      badge: "Retirement Review",
      title: "At 67 or older, Social Security may point you toward retirement benefits.",
      message:
        "For many people at full retirement age or older, SSA may point them toward retirement benefits instead of disability benefits. You can still save your information for your own records, but the next step is usually to review retirement benefit options.",
    };
  }

  if (workHistoryAnswer === 0) {
    return {
      kind: "work_history" as OutcomeKind,
      badge: "Work History Review",
      title: "Your recent work history may need a closer look.",
      message:
        "SSDI usually requires enough recent work credits. Many adults need roughly 5 years of covered work in the last 10 years, though exact rules can vary by age. The next step is to save your results and answer a few more questions so we can better understand what path may fit your situation.",
    };
  }

  if (score >= 15) {
    return {
      kind: "hot" as OutcomeKind,
      badge: "You May Be Eligible",
      title: "Based on your answers, you may be eligible for disability benefits.",
      message:
        "Your answers show several signs that are commonly reviewed in disability claims, including your work history, current earnings, health condition, and daily limitations. Before we send your guides, we need a few more details about your work history, medical treatment, and daily limits. This helps us better understand your eligibility and point you toward the right next step.",
    };
  }

  if (score >= 8) {
    return {
      kind: "warm" as OutcomeKind,
      badge: "Eligibility Review Recommended",
      title: "Your answers show that disability benefits may be worth a closer look.",
      message:
        "Some of your answers match factors Social Security may review, but we need a few more details before giving you a clearer next step. Save your results below so we can continue your eligibility review.",
    };
  }

  return {
    kind: "cool" as OutcomeKind,
    badge: "Worth Organizing",
    title: "Your situation is not always clear from a short check.",
    message:
      "Some people need more documentation before they know their next step. Saving your information and tracking changes can help you be ready if symptoms, treatment, work status, or income change.",
  };
}

function splitName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "Friend", lastName: "Unknown" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "Unknown" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

function mapAgeForSubmit(label: string) {
  if (label === "Under 50") return "35-50";
  return "50+";
}

function mapCurrentWorkForSubmit(label: string) {
  if (label.startsWith("No")) return "no";
  if (label.includes("less")) return "limited";
  return "yes";
}

function mapApplicationStatus(label: string) {
  if (label.includes("never")) return "not_applied";
  if (label.includes("waiting")) return "applied_waiting";
  if (label.includes("denied more") || label.includes("appealing")) return "reconsideration";
  if (label.includes("denied")) return "denied";
  return "not_sure";
}

function buildSubmitPayload(input: {
  answers: AnswerValue[];
  name: string;
  email: string;
  phone: string;
  state: string;
  zip: string;
  emailReportConsent: boolean;
  followupConsent: boolean;
}) {
  const { firstName, lastName } = splitName(input.name);
  const ageLabel = answerLabel("age", input.answers);
  const workHistoryLabel = answerLabel("workHistory", input.answers);
  const currentWorkLabel = answerLabel("currentWork", input.answers);
  const conditionLabel = answerLabel("condition", input.answers);
  const limitationsLabel = answerLabel("limitations", input.answers);
  const applicationStatusLabel = answerLabel("applicationStatus", input.answers);
  const limitations = Array.isArray(input.answers[4]) ? input.answers[4] as number[] : [];

  return {
    firstName,
    lastName,
    email: input.email.trim(),
    phone: input.phone.trim(),
    state: input.state,
    age: mapAgeForSubmit(ageLabel),
    currentlyWorking: mapCurrentWorkForSubmit(currentWorkLabel),
    monthlyEarnings: currentWorkLabel.includes("more") ? "2000+" : currentWorkLabel.includes("less") ? "1000-1500" : "0",
    medicalCondition: `Quick check condition: ${conditionLabel}. Work history: ${workHistoryLabel}. Current work: ${currentWorkLabel}. ZIP: ${input.zip}.`,
    conditionDuration: "1-2-years",
    dailyWorkImpact: limitations.length >= 3 ? "severe" : limitations.length >= 1 ? "moderate" : "mild",
    canLiftCarry: limitations.some((index) => index === 0) ? "limited" : "yes",
    canSitStand: limitations.some((index) => index === 1 || index === 2 || index === 3) ? "limited" : "yes",
    medicalRecordsHistory: "some",
    hasDocumentation: "unsure",
    applicationStatus: mapApplicationStatus(applicationStatusLabel),
    hasAttorney: "unknown",
    hasTreatingDoctor: "unknown",
    recentDoctorVisit: "unknown",
    specialistCare: "unknown",
    hospitalOrERVisits: "unknown",
    prescribedMedication: "unknown",
    reducedHoursDueToCondition: currentWorkLabel.startsWith("No") || currentWorkLabel.includes("less") ? "yes" : "unknown",
    jobDutiesAffected: `Quick check limitations: ${limitationsLabel || "Not selected"}`,
    sittingLimit: limitations.some((index) => index === 2) ? "Cannot sit for long periods without pain" : undefined,
    standingLimit: limitations.some((index) => index === 1) ? "Cannot stand or walk for more than 15–20 minutes" : undefined,
    walkingLimit: limitations.some((index) => index === 1) ? "Cannot stand or walk for more than 15–20 minutes" : undefined,
    liftingLimit: limitations.some((index) => index === 0) ? "Cannot lift more than 10–20 lbs" : undefined,
    focusMemoryIssues: limitations.some((index) => index === 4) ? "Trouble concentrating, remembering, or following instructions" : undefined,
    attendanceIssues: limitations.some((index) => index === 3) ? "Needs rest or lying down during the day" : undefined,
    needsRestBreaks: limitations.some((index) => index === 3) ? "Needs rest or lying down during the day" : undefined,
    dailyLivingLimitations: limitationsLabel || undefined,
    medicationSideEffects: limitations.some((index) => index === 6) ? "Medication side effects affect daily function" : undefined,
    informationalConsent: true,
    emailReportConsent: input.emailReportConsent,
    attorneyConsent: input.followupConsent,
    phoneConsent: input.followupConsent,
    textConsent: input.followupConsent,
    emailConsent: input.followupConsent,
    disclaimerAccepted: true,
    utm_source: "quick_check_landing_page",
    utm_medium: "landing_page",
    utm_campaign: "quick_disability_eligibility_check",
    landing_page: "/disability-benefits-eligibility-check",
  };
}

function Dial({ step, total, compact = false }: { step: number; total: number; compact?: boolean }) {
  const circumference = 314.16;
  const progress = Math.min(Math.max(step / total, 0), 1);
  const offset = circumference * (1 - progress);
  return (
    <svg className={compact ? "h-16 w-16" : "h-40 w-40 md:h-56 md:w-56"} viewBox="0 0 120 120" aria-hidden>
      <circle cx="60" cy="60" r="50" fill="none" stroke="#DBEAFE" strokeWidth="10" />
      <circle
        cx="60"
        cy="60"
        r="50"
        fill="none"
        stroke="#FACC15"
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transform: "rotate(-90deg)", transformOrigin: "60px 60px", transition: "stroke-dashoffset 0.4s ease" }}
      />
      <text x="60" y={compact ? "69" : "56"} textAnchor="middle" className="fill-blue-950 text-2xl font-extrabold">
        {compact ? step : "2 MIN"}
      </text>
      {!compact && (
        <text x="60" y="78" textAnchor="middle" className="fill-blue-700 text-xs font-bold uppercase tracking-widest">
          Check
        </text>
      )}
    </svg>
  );
}

export default function QuickCheckLandingClient() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<AnswerValue[]>(new Array(questions.length).fill(null));
  const [showResults, setShowResults] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [leadId, setLeadId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", zip: "", state: "", emailReportConsent: true, followupConsent: true });

  const question = questions[currentStep];
  const outcome = useMemo(() => getOutcome(answers), [answers]);
  const canProceed = question.type === "multi" || answers[currentStep] !== null;
  const progressLabel = `Question ${currentStep + 1} of ${questions.length}`;

  function selectAnswer(index: number) {
    setAnswers((prev) => {
      const next = [...prev];
      if (question.type === "single") {
        next[currentStep] = index;
      } else {
        const existing = Array.isArray(next[currentStep]) ? [...next[currentStep] as number[]] : [];
        next[currentStep] = existing.includes(index) ? existing.filter((item) => item !== index) : [...existing, index];
      }
      return next;
    });
  }

  function goNext() {
    if (currentStep < questions.length - 1) {
      setCurrentStep((step) => step + 1);
    } else {
      setShowResults(true);
    }
  }

  async function submitLead(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/submit-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildSubmitPayload({ answers, ...form })),
      });
      const data = (await response.json()) as { success?: boolean; leadId?: string; claimToken?: string; error?: string };
      if (!response.ok || !data.success) {
        throw new Error(data.error || "We could not save this check right now. Please try again.");
      }

      if (data.leadId) {
        setLeadId(data.leadId);
        try {
          sessionStorage.setItem("disability_readiness_lead_id", data.leadId);
        } catch {
          // Non-fatal.
        }
      }
      if (data.claimToken) {
        try {
          sessionStorage.setItem("disability_readiness_claim_token", data.claimToken);
        } catch {
          // Non-fatal.
        }
      }
      setSubmitted(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "We could not save this check right now. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-white text-slate-900">
      <section className="border-b border-blue-100 bg-gradient-to-b from-blue-50 via-white to-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 md:grid-cols-[1.25fr_0.75fr] md:items-center md:py-16">
          <div>
            <div className="mb-5 flex items-center gap-3">
              <Image src="/logo.png" alt="Disability Benefits Screening" width={210} height={72} className="h-14 w-auto" />
            </div>
            <span className="inline-flex rounded-full bg-yellow-100 px-4 py-2 text-sm font-extrabold uppercase tracking-widest text-blue-950">
              Free 2-minute eligibility check
            </span>
            <h1 className="mt-5 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-blue-950 md:text-6xl">
              You worked. You paid in. Find out if you may qualify for disability benefits.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-700 md:text-xl">
              Answer a few quick questions about age, work history, current earnings, and health limits. You will get a plain-English next step and can save your information to continue your eligibility review.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a href="#quick-check" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-yellow-400 px-7 py-4 text-lg font-extrabold text-blue-950 shadow-sm hover:bg-yellow-300">
                Start My Free Check <ArrowRight className="h-5 w-5" aria-hidden />
              </a>
              <Link href="/account" className="inline-flex min-h-14 items-center justify-center rounded-xl border-2 border-blue-900 px-7 py-4 text-lg font-extrabold text-blue-950 hover:bg-blue-50">
                I Already Have an Account
              </Link>
            </div>
            <div className="mt-6 grid gap-3 text-base text-slate-700 sm:grid-cols-3">
              <span className="flex items-center gap-2"><Lock className="h-5 w-5 text-blue-700" /> Private</span>
              <span className="flex items-center gap-2"><Clock className="h-5 w-5 text-blue-700" /> About 2 minutes</span>
              <span className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-blue-700" /> Not SSA</span>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="rounded-[2rem] border border-blue-100 bg-white p-8 shadow-xl">
              <Dial step={1} total={questions.length} />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-blue-50 py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mx-auto mb-8 max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold text-blue-950 md:text-4xl">Does this sound like you?</h2>
            <p className="mt-3 text-lg leading-8 text-slate-700">Many people are not sure where they stand until they walk through the basics.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              "Standing or walking for more than a few minutes causes pain or shortness of breath",
              "Lifting, bending, or carrying things has gotten hard or impossible",
              "A doctor has diagnosed an ongoing health condition",
              "You had to cut back on work or stop because of your health",
              "You applied before and received a denial letter",
              "You are unsure where to start or what records matter",
            ].map((item) => (
              <div key={item} className="flex gap-3 rounded-2xl border border-blue-100 bg-white p-5 text-lg leading-7 shadow-sm">
                <CheckCircle2 className="mt-1 h-6 w-6 flex-shrink-0 text-blue-700" aria-hidden />
                <p>{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="quick-check" className="py-12 md:py-16">
        <div className="mx-auto max-w-3xl px-5">
          <div className="rounded-[1.5rem] border border-blue-100 bg-white p-6 shadow-xl md:p-10">
            {!showResults && (
              <>
                <div className="mb-8 flex items-center gap-4">
                  <Dial compact step={currentStep + 1} total={questions.length} />
                  <div>
                    <p className="text-sm font-extrabold uppercase tracking-widest text-blue-700">{progressLabel}</p>
                    <p className="text-base text-slate-600">Choose the answer that fits best.</p>
                  </div>
                </div>

                <h2 className="mb-6 text-2xl font-extrabold leading-tight text-blue-950 md:text-3xl">{question.title}</h2>
                <div className="space-y-3">
                  {question.options.map((option, index) => {
                    const selected = question.type === "single"
                      ? answers[currentStep] === index
                      : Array.isArray(answers[currentStep]) && (answers[currentStep] as number[]).includes(index);
                    return (
                      <button
                        key={option.label}
                        type="button"
                        onClick={() => selectAnswer(index)}
                        className={`flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left text-lg font-semibold transition-colors ${selected ? "border-blue-700 bg-blue-50 text-blue-950" : "border-slate-200 bg-white text-slate-800 hover:border-blue-300"}`}
                      >
                        <span className={`flex h-7 w-7 flex-shrink-0 items-center justify-center ${question.type === "multi" ? "rounded-lg" : "rounded-full"} border-2 ${selected ? "border-blue-700 bg-blue-700" : "border-slate-300"}`}>
                          {selected && <CheckCircle2 className="h-5 w-5 text-white" aria-hidden />}
                        </span>
                        {option.label}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-8 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentStep((step) => Math.max(0, step - 1))}
                    className="min-h-14 flex-1 rounded-xl border-2 border-blue-900 px-5 py-3 text-lg font-extrabold text-blue-950 disabled:cursor-not-allowed disabled:opacity-30"
                    disabled={currentStep === 0}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    disabled={!canProceed}
                    className="min-h-14 flex-1 rounded-xl bg-yellow-400 px-5 py-3 text-lg font-extrabold text-blue-950 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {currentStep === questions.length - 1 ? "See My Results" : "Next"}
                  </button>
                </div>
              </>
            )}

            {showResults && !submitted && (
              <>
                <span className="inline-flex rounded-full bg-blue-100 px-4 py-2 text-sm font-extrabold uppercase tracking-widest text-blue-900">{outcome.badge}</span>
                <h2 className="mt-4 text-3xl font-extrabold leading-tight text-blue-950">{outcome.title}</h2>
                <p className="mt-4 text-lg leading-8 text-slate-700">{outcome.message}</p>
                <div className="mt-5 rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-base leading-7 text-slate-800">
                  <strong>Next:</strong> Enter your contact information so we can save your results and continue your eligibility review. After you complete the next step, we will send your free Disability Benefits Preparation Guide and Advocate/Representative Preparation Guide for review.
                </div>

                <form onSubmit={submitLead} className="mt-8 space-y-5">
                  <div>
                    <h3 className="text-2xl font-extrabold text-blue-950">Where should we save your results?</h3>
                    <p className="mt-2 text-base leading-7 text-slate-700">
                      We will use this to save your check, continue your review, and send your free guides after the next step is complete.
                    </p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="block">
                      <span className="text-sm font-bold text-blue-950">Full name</span>
                      <input required value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} className="mt-2 w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-lg focus:border-blue-600 focus:outline-none" />
                    </label>
                    <label className="block">
                      <span className="text-sm font-bold text-blue-950">Phone number</span>
                      <input required type="tel" value={form.phone} onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))} className="mt-2 w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-lg focus:border-blue-600 focus:outline-none" />
                    </label>
                    <label className="block">
                      <span className="text-sm font-bold text-blue-950">Email address</span>
                      <input required type="email" value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} className="mt-2 w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-lg focus:border-blue-600 focus:outline-none" />
                    </label>
                    <label className="block">
                      <span className="text-sm font-bold text-blue-950">ZIP code</span>
                      <input required value={form.zip} maxLength={5} pattern="[0-9]{5}" onChange={(event) => setForm((prev) => ({ ...prev, zip: event.target.value.replace(/\D/g, "").slice(0, 5) }))} className="mt-2 w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-lg focus:border-blue-600 focus:outline-none" />
                    </label>
                    <label className="block md:col-span-2">
                      <span className="text-sm font-bold text-blue-950">State</span>
                      <select required value={form.state} onChange={(event) => setForm((prev) => ({ ...prev, state: event.target.value }))} className="mt-2 w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-lg focus:border-blue-600 focus:outline-none">
                        <option value="">Select your state</option>
                        {US_STATES.map((state) => (
                          <option key={state.value} value={state.value}>{state.label}</option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <label className="flex gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-slate-700">
                    <input type="checkbox" checked={form.emailReportConsent} onChange={() => setForm((prev) => ({ ...prev, emailReportConsent: !prev.emailReportConsent }))} className="mt-1 h-4 w-4" />
                    I consent to receiving my guide and review information by email after I complete the next step.
                  </label>
                  <label className="flex gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-slate-700">
                    <input type="checkbox" checked={form.followupConsent} onChange={() => setForm((prev) => ({ ...prev, followupConsent: !prev.followupConsent }))} className="mt-1 h-4 w-4" />
                    I consent to being contacted by phone, text, or email about my eligibility review. Consent is optional and not required to use this tool. Message and data rates may apply.
                  </label>

                  {submitError && <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{submitError}</p>}

                  <button type="submit" disabled={submitting} className="flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-yellow-400 px-6 py-4 text-lg font-extrabold text-blue-950 disabled:cursor-not-allowed disabled:opacity-60">
                    {submitting ? <><Loader2 className="h-5 w-5 animate-spin" /> Saving...</> : <>Continue My Eligibility Review <ArrowRight className="h-5 w-5" /></>}
                  </button>
                </form>
              </>
            )}

            {submitted && (
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                  <CheckCircle2 className="h-9 w-9 text-blue-700" aria-hidden />
                </div>
                <h2 className="mt-5 text-3xl font-extrabold text-blue-950">Thanks, {splitName(form.name).firstName} — your results were saved.</h2>
                <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-slate-700">
                  {outcome.kind === "sga"
                    ? "Because your current income may be over the monthly SGA amount, the best next step is to create your free account and start documenting everything in case your income drops or your work situation changes."
                    : outcome.kind === "retirement"
                      ? "Because you are 67 or older, reviewing Social Security retirement may be the better next step. You can still save your information for your own records."
                      : outcome.kind === "work_history"
                        ? "Your recent work history may need a closer look. Create your free account so you can organize records while you review possible benefit paths."
                        : "Now we need a few more details about your work history, medical treatment, and daily limits. When that step is complete, we will send your free preparation guides for review."
                  }
                </p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
                  {outcome.kind === "retirement" ? (
                    <a href="https://www.ssa.gov/retirement" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-14 items-center justify-center rounded-xl bg-yellow-400 px-7 py-4 text-lg font-extrabold text-blue-950 hover:bg-yellow-300">
                      Review Retirement Benefits
                    </a>
                  ) : (
                    <Link href="/login?next=/account" className="inline-flex min-h-14 items-center justify-center rounded-xl bg-yellow-400 px-7 py-4 text-lg font-extrabold text-blue-950 hover:bg-yellow-300">
                      Continue to the Next Step
                    </Link>
                  )}
                  <Link href="/resources" className="inline-flex min-h-14 items-center justify-center rounded-xl border-2 border-blue-900 px-7 py-4 text-lg font-extrabold text-blue-950 hover:bg-blue-50">
                    View Preparation Resources
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="bg-blue-50 py-12 md:py-16">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 md:grid-cols-3">
          {[
            ["01", "Answer a few quick questions", "About two minutes covering your age, work history, current earnings, and health limits."],
            ["02", "See a plain-English next step", "The page gives a soft next step based on income, age, work history, and limitations."],
            ["03", "Save and continue", "After the next step, we will send your free guides and help point you in the right direction."],
          ].map(([number, title, body]) => (
            <div key={number} className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-4xl font-extrabold text-yellow-500">{number}</p>
              <h3 className="mt-3 text-xl font-extrabold text-blue-950">{title}</h3>
              <p className="mt-2 text-base leading-7 text-slate-700">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-3xl px-5 text-center">
          <FileText className="mx-auto h-10 w-10 text-blue-700" aria-hidden />
          <h2 className="mt-4 text-3xl font-extrabold text-blue-950 md:text-4xl">Two minutes can help you know what to document next.</h2>
          <p className="mt-4 text-lg leading-8 text-slate-700">This tool is for preparation and organization. It is not affiliated with SSA, is not legal advice, and does not guarantee benefits or predict approval.</p>
          <a href="#quick-check" className="mt-7 inline-flex min-h-14 items-center justify-center rounded-xl bg-yellow-400 px-7 py-4 text-lg font-extrabold text-blue-950 hover:bg-yellow-300">
            Start My Free Check
          </a>
        </div>
      </section>
    </div>
  );
}
