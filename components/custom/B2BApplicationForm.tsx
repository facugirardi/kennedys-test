import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { submitB2BApplication, type B2BApplicationPayload } from "@/lib/api/b2bApplications";
import { CountryCodeDropdown } from "@/components/custom/CountryCodeDropdown";
import { COUNTRY_DIAL_OPTIONS } from "@/lib/countryDialCodes";
import {
  Req,
  Opt,
  FieldError,
  SelectField,
  CheckboxGroup,
  YesNoToggle,
  fieldInputClass,
  fieldTextareaClass,
  fieldLabelClass,
  GOLD,
} from "@/components/custom/AgentPortfolioFormKit";

/** Local form shape: adds the country-code picker on top of the submitted payload — the two
 * are combined into a single E.164-ish `phone` string right before submit. */
type B2BFormValues = B2BApplicationPayload & { countryCode: string };

const countryCodeButtonClass =
  "h-[38px] rounded-none border-0 border-b border-[#DDD8CC] bg-transparent font-haas text-sm text-[#172338] focus:border-[#D99330]";

type Step =
  | "contact"
  | "company"
  | "clientProfile"
  | "business"
  | "portalAccess"
  | "declaration";

export const STEP_ORDER: Step[] = [
  "contact", "company", "clientProfile", "business", "portalAccess", "declaration",
];

export const STEP_LABELS: Record<Step, string> = {
  contact: "Contact details",
  company: "Company information",
  clientProfile: "Your client profile",
  business: "Business with Kennedy's Group",
  portalAccess: "Portal user access",
  declaration: "Stay in touch",
};

/** Only the fields that gate "Next" on each step — everything else on the step is optional. Keep in
 * sync with the Required()/Optional() tags on each field below and with the backend's own
 * REQUIRED_FIELDS in kennedys-api/src/services/b2bApplicationService.ts. */
const STEP_REQUIRED_FIELDS: Record<Step, (keyof B2BFormValues)[]> = {
  contact: ["firstName", "lastName", "jobTitle", "businessEmail", "countryCode", "phone"],
  company: ["companyName", "companyWebsite", "companyHqLocation", "companyType"],
  clientProfile: ["clientsBasedLocation"],
  business: [],
  portalAccess: ["portalUserFullName", "portalUserPosition", "portalUserEmail"],
  declaration: [],
};

const COMPANY_TYPE_OPTIONS = [
  "Travel Agency", "Luxury Travel Agency", "Tour Operator", "Destination Management Company – DMC",
  "Concierge Company", "Family Office", "Lifestyle Management Company", "Corporate Travel Agency / TMC",
  "Event / Wedding Planner", "Yacht Broker / Yacht Charter Company", "Private Aviation Company / Broker",
  "Hotel / Hospitality Company", "Real Estate / Luxury Property Company", "Independent Travel Advisor", "Other",
];

const PROFESSIONAL_NETWORK_OPTIONS = [
  "Virtuoso", "Serandipians", "Traveller Made", "Signature Travel Network", "Internova",
  "Ensemble", "ASTA", "IATA", "CLIA", "Other",
];

const CLIENT_TYPE_OPTIONS = [
  "High-Net-Worth Clients", "VIP Clients", "Leisure Clients", "Corporate Clients",
  "Families", "Groups", "Events", "Other",
];

const toggleInArray = (arr: string[], value: string) =>
  arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];

/** 6-section "Request B2B Access" application wizard — replaces open self-registration on
 * /agent-portfolio's logged-out screen. Submissions are reviewed by an admin in kennedys-loggia;
 * only on acceptance does a real login account get created (see AgentPortfolioLoggedOut.tsx). The
 * step rail itself is rendered by the parent shell (AgentPortfolioLoggedOut) — this component just
 * reports the current step index up via `onStepChange`. */
export default function B2BApplicationForm({ onStepChange }: { onStepChange?: (index: number) => void }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [professionalNetworks, setProfessionalNetworks] = useState<string[]>([]);
  const [clientTypes, setClientTypes] = useState<string[]>([]);

  // The "Continue" button on the second-to-last step and the "Submit application" button on the
  // last step sit at the exact same screen position. A fast click (or a click that straddles the
  // re-render) can land on "Continue", advance the step, and have the browser's same gesture also
  // register on the freshly-mounted "Submit" button underneath the pointer, submitting the form
  // before the user consciously pressed it. Disabling submit briefly after arriving on the last
  // step forces a deliberate, separate click.
  const [submitArmed, setSubmitArmed] = useState(false);

  const { register, handleSubmit, watch, setValue, trigger, control, formState: { errors } } = useForm<B2BFormValues>({
    defaultValues: {
      countryCode: "",
      needsAdditionalUsers: false,
      wantsNewsUpdates: false,
    },
  });

  const step = STEP_ORDER[stepIndex];
  const needsAdditionalUsers = watch("needsAdditionalUsers");

  useEffect(() => {
    onStepChange?.(stepIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex]);

  useEffect(() => {
    if (step !== "declaration") {
      setSubmitArmed(false);
      return;
    }
    setSubmitArmed(false);
    const timer = setTimeout(() => setSubmitArmed(true), 400);
    return () => clearTimeout(timer);
  }, [step]);

  const goNext = async () => {
    const valid = await trigger(STEP_REQUIRED_FIELDS[step]);
    if (!valid) return;
    setStepIndex((i) => Math.min(STEP_ORDER.length - 1, i + 1));
  };

  const goBack = () => setStepIndex((i) => Math.max(0, i - 1));

  const onSubmit = handleSubmit(async (data) => {
    setSubmitError(null);
    setSubmitting(true);
    try {
      const { countryCode, phone: rawPhone, ...rest } = data;
      const phone = rawPhone ? `${countryCode || ""}${rawPhone.replace(/\s/g, "")}` : rawPhone;
      const res: any = await submitB2BApplication({
        ...rest,
        phone,
        professionalNetworks: professionalNetworks.join(","),
        clientTypes: clientTypes.join(","),
      });
      if (res?.success === false) {
        setSubmitError(res?.message || "Could not submit your application. Please try again.");
        return;
      }
      setSubmitted(true);
    } catch (err: any) {
      setSubmitError(err?.message || "Could not submit your application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  });

  if (submitted) {
    return (
      <div className="py-6">
        <div
          className="mb-6 flex h-14 w-14 items-center justify-center rounded-full border"
          style={{ borderColor: GOLD }}
        >
          <svg className="h-6 w-6" style={{ color: GOLD }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="font-gtsuper-ds text-2xl font-light text-[#172338] mb-3">Thank you for your interest</h1>
        <p className="font-haas text-sm leading-relaxed text-[#506A70] max-w-sm">
          Your application will be reviewed by our Partnerships Team. Approved partners receive their
          personal credentials to access the Kennedy&apos;s Group B2B Portal by email.
        </p>
      </div>
    );
  }

  return (
    <div>
      {stepIndex === 0 ? (
        <>
          <h1 className="font-gtsuper-ds text-3xl font-light text-[#172338]">Request B2B access</h1>
          <p className="mt-3 font-haas text-sm leading-relaxed text-[#506A70] max-w-md">
            Join our professional network and gain access to our B2B platform, private portfolio, partner
            rates, availability and booking tools. All applications are reviewed individually by our team.
            Fields marked<Req /> are required — everything else is optional.
          </p>
        </>
      ) : (
        <h2 className="font-gtsuper-ds text-2xl font-light text-[#172338]">{STEP_LABELS[step]}</h2>
      )}

      <div className="lg:hidden mt-6">
        <div className="flex items-center justify-between font-haas text-xs text-[#9CA6AD] mb-1.5">
          <span>Step {stepIndex + 1} of {STEP_ORDER.length}</span>
          <span>{STEP_LABELS[step]}</span>
        </div>
        <div className="h-px w-full bg-[#DDD8CC]">
          <div
            className="h-px transition-all"
            style={{ width: `${((stepIndex + 1) / STEP_ORDER.length) * 100}%`, backgroundColor: GOLD }}
          />
        </div>
      </div>

      <form
        onSubmit={(e) => {
          // Guards against the browser's implicit-submission behavior: steps with exactly one
          // text field (clientProfile, business) have no submit button in the DOM, so pressing
          // Enter in that field used to submit the whole form natively, skipping the remaining
          // steps (including the newsletter opt-in on "declaration"). Only the declaration step's
          // explicit Submit button may actually submit.
          if (step !== "declaration") {
            e.preventDefault();
            return;
          }
          onSubmit(e);
        }}
        className="mt-8 flex flex-col gap-6"
      >
        {step === "contact" && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
              <div>
                <label className={fieldLabelClass}>First name<Req /></label>
                <Input className={fieldInputClass} {...register("firstName", { required: "Required" })} />
                <FieldError message={errors.firstName?.message} />
              </div>
              <div>
                <label className={fieldLabelClass}>Last name<Req /></label>
                <Input className={fieldInputClass} {...register("lastName", { required: "Required" })} />
                <FieldError message={errors.lastName?.message} />
              </div>
            </div>
            <div>
              <label className={fieldLabelClass}>Job title / position<Req /></label>
              <Input className={fieldInputClass} {...register("jobTitle", { required: "Required" })} />
              <FieldError message={errors.jobTitle?.message} />
            </div>
            <div>
              <label className={fieldLabelClass}>Business email address<Req /></label>
              <Input type="email" className={fieldInputClass} {...register("businessEmail", { required: "Required" })} />
              <FieldError message={errors.businessEmail?.message} />
            </div>
            <div>
              <label className={fieldLabelClass}>Direct telephone / WhatsApp<Req /></label>
              <div className="mt-1.5 flex gap-2">
                <div className="w-36 shrink-0">
                  <Controller
                    name="countryCode"
                    control={control}
                    rules={{ required: "Required" }}
                    render={({ field }) => (
                      <CountryCodeDropdown
                        options={COUNTRY_DIAL_OPTIONS}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Code"
                        buttonClassName={countryCodeButtonClass}
                        compactSelected
                      />
                    )}
                  />
                </div>
                <Input
                  className={`${fieldInputClass} mt-0 flex-1`}
                  type="tel"
                  {...register("phone", { required: "Required" })}
                />
              </div>
              <FieldError message={errors.countryCode?.message || errors.phone?.message} />
            </div>
          </>
        )}

        {step === "company" && (
          <>
            <div>
              <label className={fieldLabelClass}>Company name<Req /></label>
              <Input className={fieldInputClass} {...register("companyName", { required: "Required" })} />
              <FieldError message={errors.companyName?.message} />
            </div>
            <div>
              <label className={fieldLabelClass}>Company website<Req /></label>
              <Input className={fieldInputClass} {...register("companyWebsite", { required: "Required" })} />
              <FieldError message={errors.companyWebsite?.message} />
            </div>
            <div>
              <label className={fieldLabelClass}>Company headquarters — city & country<Req /></label>
              <Input className={fieldInputClass} {...register("companyHqLocation", { required: "Required" })} />
              <FieldError message={errors.companyHqLocation?.message} />
            </div>
            <div>
              <label className={fieldLabelClass}>Company type<Req /></label>
              <SelectField
                value={watch("companyType")}
                onChange={(v) => setValue("companyType", v, { shouldValidate: true })}
                options={COMPANY_TYPE_OPTIONS}
                placeholder="Select one"
              />
              <input type="hidden" {...register("companyType", { required: "Required" })} />
              <FieldError message={errors.companyType?.message} />
            </div>
            <div>
              <label className={fieldLabelClass}>Are you a member of any professional travel networks or associations?<Opt /></label>
              <p className="mt-1 mb-2 font-haas text-xs text-[#9CA6AD]">Please select all that apply.</p>
              <CheckboxGroup options={PROFESSIONAL_NETWORK_OPTIONS} selected={professionalNetworks} onToggle={(v) => setProfessionalNetworks((prev) => toggleInArray(prev, v))} />
            </div>
            <div>
              <label className={fieldLabelClass}>Please specify any other affiliations or memberships.<Opt /></label>
              <Textarea className={fieldTextareaClass} rows={2} {...register("otherAffiliations")} />
            </div>
            <div>
              <label className={fieldLabelClass}>Company registration number<Opt /></label>
              <Input className={fieldInputClass} {...register("companyRegistrationNumber")} />
            </div>
          </>
        )}

        {step === "clientProfile" && (
          <>
            <div>
              <label className={fieldLabelClass}>What type of clients do you primarily represent?<Opt /></label>
              <div className="mt-2">
                <CheckboxGroup options={CLIENT_TYPE_OPTIONS} selected={clientTypes} onToggle={(v) => setClientTypes((prev) => toggleInArray(prev, v))} />
              </div>
            </div>
            <div>
              <label className={fieldLabelClass}>Where are the majority of your clients based?<Req /></label>
              <Input className={fieldInputClass} {...register("clientsBasedLocation", { required: "Required" })} />
              <FieldError message={errors.clientsBasedLocation?.message} />
            </div>
          </>
        )}

        {step === "business" && (
          <>
            <div>
              <label className={fieldLabelClass}>Which destinations are you most interested in?<Opt /></label>
              <Input className={fieldInputClass} {...register("destinationsOfInterest")} />
            </div>
          </>
        )}

        {step === "portalAccess" && (
          <>
            <p className={fieldLabelClass}>Who should have access to the B2B Portal?<Req /></p>
            <div>
              <label className="font-haas text-xs text-[#9CA6AD]">Full name<Req /></label>
              <Input className={fieldInputClass} {...register("portalUserFullName", { required: "Required" })} />
              <FieldError message={errors.portalUserFullName?.message} />
            </div>
            <div>
              <label className="font-haas text-xs text-[#9CA6AD]">Position<Req /></label>
              <Input className={fieldInputClass} {...register("portalUserPosition", { required: "Required" })} />
              <FieldError message={errors.portalUserPosition?.message} />
            </div>
            <div>
              <label className="font-haas text-xs text-[#9CA6AD]">Business email<Req /></label>
              <Input type="email" className={fieldInputClass} {...register("portalUserEmail", { required: "Required" })} />
              <FieldError message={errors.portalUserEmail?.message} />
            </div>
            <div>
              <label className={fieldLabelClass}>Do you require access for additional members of your team?<Opt /></label>
              <div className="mt-2">
                <YesNoToggle value={Boolean(needsAdditionalUsers)} onChange={(v) => setValue("needsAdditionalUsers", v)} />
              </div>
            </div>
            {needsAdditionalUsers && (
              <div className="border-l pl-4" style={{ borderColor: "#DDD8CC" }}>
                <label className={fieldLabelClass}>Approximately how many users?<Opt /></label>
                <Input type="number" min={1} className={fieldInputClass} {...register("additionalUserCount", { valueAsNumber: true })} />
              </div>
            )}
          </>
        )}

        {step === "declaration" && (
          <>
            <div className="flex items-start space-x-2.5">
              <Checkbox
                id="wantsNewsUpdates"
                checked={Boolean(watch("wantsNewsUpdates"))}
                onCheckedChange={(c) => setValue("wantsNewsUpdates", Boolean(c))}
                className="mt-0.5 rounded-none border-[#DDD8CC] data-[state=checked]:bg-[#D99330] data-[state=checked]:border-[#D99330]"
              />
              <label htmlFor="wantsNewsUpdates" className="font-haas text-sm text-[#172338] leading-snug">
                I would like to receive B2B news, product updates and exclusive partner offers.<Opt />
              </label>
            </div>

            {submitError && <p className="font-haas text-sm text-red-500">{submitError}</p>}
          </>
        )}

        <div className="flex items-center justify-between mt-2 pt-6">
          <button
            type="button"
            onClick={goBack}
            disabled={stepIndex === 0}
            className="font-haas text-sm text-[#9CA6AD] hover:text-[#172338] disabled:opacity-0 disabled:pointer-events-none transition-colors"
          >
            Back
          </button>
          {step === "declaration" ? (
            <Button type="submit" disabled={submitting || !submitArmed} className="rounded-none">
              {submitting ? "Submitting…" : "Submit application"}
            </Button>
          ) : (
            <Button type="button" onClick={goNext} className="rounded-none font-normal">
              Continue
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
