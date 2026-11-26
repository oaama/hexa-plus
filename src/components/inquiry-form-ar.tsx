"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowUpRight, CheckCircle2, LoaderCircle } from "lucide-react";
import { inquirySchema, type InquiryInput } from "@/lib/validation-ar";
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
      if (!response.ok) throw new Error("تعذر حفظ استفسارك. حاول مرة أخرى.");
      setSuccess(true);
      reset();
    } catch (e) {
      setError("تعذر حفظ استفسارك. راجع اتصالك وحاول مرة أخرى.");
    }
  }
  if (success)
    return (
      <div className="inquiry-success" role="status">
        <CheckCircle2 size={42} />
        <h2>
          {" "}
          البدايات الجيدة <br /> تبدأ بحوار.{" "}
        </h2>
        <p>
          {" "}
          تم حفظ استفسارك. يمكن لفريق هيكسا بلس مراجعته والتواصل معك عبر
          البيانات التي قدمتها.{" "}
        </p>
        <button className="secondary-link" onClick={() => setSuccess(false)}>
          {" "}
          إرسال استفسار آخر{" "}
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
        <small className="field-error">
          {/[^\x00-\x7F]/.test(String(errors[key]?.message))
            ? errors[key]?.message
            : "راجع البيانات المدخلة في هذا الحقل."}
        </small>
      )}
    </label>
  );
  return (
    <form className="inquiry-form" onSubmit={handleSubmit(submit)} noValidate>
      <div className="form-grid">
        {input("name", "الاسم الكامل *", {
          autoComplete: "name",
          placeholder: "اسمك",
        })}
        {input("company", "اسم الشركة", {
          autoComplete: "organization",
          placeholder: "شركتك",
        })}
        {input("email", "البريد الإلكتروني *", {
          type: "email",
          autoComplete: "email",
          placeholder: "you@company.com",
        })}
        {input("phone", "الهاتف / واتساب *", {
          type: "tel",
          autoComplete: "tel",
          placeholder: "+20 ...",
        })}
        <label className="form-field">
          <span> الخدمة المطلوبة * </span>
          <select {...register("service")}>
            <option value=""> اختر خدمة </option>
            {services.map((s) => (
              <option key={s}>{s}</option>
            ))}
            <option> عدة خدمات / لم أحدد بعد </option>
            <option> انضم إلينا / تعارف </option>
          </select>
          {errors.service && (
            <small className="field-error">{errors.service.message}</small>
          )}
        </label>
        <label className="form-field">
          <span> ميزانية المشروع </span>
          <select {...register("budget")}>
            <option value=""> نحددها معًا </option>
            <option> أقل من ٢٥٬٠٠٠ جنيه </option>
            <option> ٢٥٬٠٠٠ إلى ٧٥٬٠٠٠ جنيه </option>
            <option> ٧٥٬٠٠٠ إلى ١٥٠٬٠٠٠ جنيه </option>
            <option> أكثر من ١٥٠٬٠٠٠ جنيه </option>
          </select>
        </label>
        <label className="form-field wide">
          <span> المدة المتوقعة </span>
          <select {...register("timeline")}>
            <option value=""> مرنة / نحددها معًا </option>
            <option> في أقرب وقت ممكن </option>
            <option> من شهر إلى ٣ أشهر </option>
            <option> من ٣ إلى ٦ أشهر </option>
            <option> أكثر من ٦ أشهر </option>
          </select>
        </label>
        <label className="form-field wide">
          <span> أخبرنا عن مشروعك * </span>
          <textarea
            rows={5}
            placeholder="ما الذي تخطط له؟ وكيف يمكننا مساعدتك؟"
            {...register("description")}
          />
          {errors.description && (
            <small className="field-error">{errors.description.message}</small>
          )}
        </label>
      </div>
      <div className="honeypot" aria-hidden="true">
        <label>
          {" "}
          الموقع الإلكتروني{" "}
          <input {...register("website")} tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <label className="consent">
        <input type="checkbox" {...register("consent")} />
        <span>
          {" "}
          أوافق على <a href="/ar/privacy"> سياسة الخصوصية </a> وعلى التواصل معي
          بشأن هذا الاستفسار.{" "}
        </span>
      </label>
      {errors.consent && (
        <p className="field-error">{errors.consent.message}</p>
      )}
      {!connected && (
        <p className="notice">
          {" "}
          سيُتاح إرسال الاستفسارات بعد اكتمال إعداد قاعدة البيانات الآمنة. لا
          يحفظ هذا النموذج رسائل حاليًا.{" "}
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
            <LoaderCircle className="spin" size={18} /> جارٍ حفظ استفسارك{" "}
          </>
        ) : (
          <>
            {" "}
            أرسل استفسارك <ArrowUpRight size={19} />
          </>
        )}
      </button>
      <p className="form-note">
        {" "}
        تصل رسالتك مباشرة إلى مساحة عملنا الخاصة. دون اشتراك في قوائم
        بريدية.{" "}
      </p>
    </form>
  );
}
