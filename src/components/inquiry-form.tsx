"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowUpRight, CheckCircle2, LoaderCircle } from "lucide-react";
import { inquirySchema, type InquiryInput } from "@/lib/validation";
export function InquiryForm({
  services,
  selected = "",
  connected,
}: {
  services: string[];
  selected?: string;
  connected: boolean;
}) {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<InquiryInput>({
    resolver: zodResolver(inquirySchema),
    defaultValues: { service: selected, website: "", consent: false },
  });
  async function submit(data: InquiryInput) {
    setError("");
    try {
      const response = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(
          result.error || "Your inquiry could not be saved. Please try again.",
        );
      setSuccess(true);
      reset();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Your inquiry could not be saved.",
      );
    }
  }
  if (success)
    return (
      <div className="inquiry-success" role="status">
        <CheckCircle2 size={42} />
        <h2>
          Good things start
          <br />
          with a conversation.
        </h2>
        <p>
          Your inquiry has been saved. The HEXA PLUS team can now review it and
          follow up using the contact details you provided.
        </p>
        <button className="secondary-link" onClick={() => setSuccess(false)}>
          Send another inquiry
        </button>
      </div>
    );
  const input = (
    key: keyof InquiryInput,
    label: string,
    props: React.InputHTMLAttributes<HTMLInputElement> = {},
  ) => (
    <label className="form-field">
      <span>{label}</span>
      <input {...register(key)} {...props} />
      {errors[key] && (
        <small className="field-error">{errors[key]?.message}</small>
      )}
    </label>
  );
  return (
    <form className="inquiry-form" onSubmit={handleSubmit(submit)} noValidate>
      <div className="form-grid">
        {input("name", "Full name *", {
          autoComplete: "name",
          placeholder: "Your name",
        })}
        {input("company", "Company name", {
          autoComplete: "organization",
          placeholder: "Your company",
        })}
        {input("email", "Email *", {
          type: "email",
          autoComplete: "email",
          placeholder: "you@company.com",
        })}
        {input("phone", "Phone / WhatsApp *", {
          type: "tel",
          autoComplete: "tel",
          placeholder: "+20 ...",
        })}
        <label className="form-field">
          <span>Service required *</span>
          <select {...register("service")}>
            <option value="">Choose a service</option>
            {services.map((s) => (
              <option key={s}>{s}</option>
            ))}
            <option>Multiple services / not sure yet</option>
            <option>Careers / introduction</option>
          </select>
          {errors.service && (
            <small className="field-error">{errors.service.message}</small>
          )}
        </label>
        <label className="form-field">
          <span>Project budget</span>
          <select {...register("budget")}>
            <option value="">Let's discuss</option>
            <option>Under EGP 25,000</option>
            <option>EGP 25,000–75,000</option>
            <option>EGP 75,000–150,000</option>
            <option>EGP 150,000+</option>
          </select>
        </label>
        <label className="form-field wide">
          <span>Project timeline</span>
          <select {...register("timeline")}>
            <option value="">Flexible / let's discuss</option>
            <option>As soon as possible</option>
            <option>1–3 months</option>
            <option>3–6 months</option>
            <option>6+ months</option>
          </select>
        </label>
        <label className="form-field wide">
          <span>Tell us about your project *</span>
          <textarea
            rows={5}
            placeholder="What are you working on, and how can we help?"
            {...register("description")}
          />
          {errors.description && (
            <small className="field-error">{errors.description.message}</small>
          )}
        </label>
      </div>
      <div className="honeypot" aria-hidden="true">
        <label>
          Website
          <input {...register("website")} tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <label className="consent">
        <input type="checkbox" {...register("consent")} />
        <span>
          I agree to the <a href="/privacy">privacy policy</a> and to being
          contacted about this inquiry.
        </span>
      </label>
      {errors.consent && (
        <p className="field-error">{errors.consent.message}</p>
      )}
      {!connected && (
        <p className="notice">
          Project inquiries will open when the secure database setup is
          complete. This form does not send or save messages yet.
        </p>
      )}
      {error && (
        <p role="alert" className="field-error">
          {error}
        </p>
      )}
      <button
        disabled={isSubmitting || !connected}
        className="primary-link"
        type="submit"
      >
        {isSubmitting ? (
          <>
            <LoaderCircle className="spin" size={18} />
            Saving your inquiry
          </>
        ) : (
          <>
            Send project inquiry <ArrowUpRight size={19} />
          </>
        )}
      </button>
      <p className="form-note">
        Your message goes straight to our private workspace. No mailing lists.
      </p>
    </form>
  );
}
