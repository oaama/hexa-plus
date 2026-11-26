const STEPS: { en: [string, string]; ar: [string, string] }[] = [
  {
    en: ["Planning", "Goals, audience and scope agreed before anything is built."],
    ar: ["التخطيط", "نتفق على الهدف والجمهور ونطاق العمل قبل كتابة أي كود."],
  },
  {
    en: ["Analysis", "Requirements mapped into screens, features and data."],
    ar: ["التحليل", "نحوّل المتطلبات إلى شاشات ومميزات وبيانات واضحة."],
  },
  {
    en: ["Design", "Interfaces designed and reviewed in Arabic and English."],
    ar: ["التصميم", "واجهات تُصمم وتُراجع بالعربية والإنجليزية."],
  },
  {
    en: ["Development", "Built in visible milestones you can follow."],
    ar: ["التطوير", "نبني على مراحل واضحة تتابعها أول بأول."],
  },
  {
    en: ["Testing", "Checked on real devices before anything ships."],
    ar: ["الاختبار", "نختبر على أجهزة حقيقية قبل أي إطلاق."],
  },
  {
    en: ["Deployment", "Launched carefully on reliable, low-cost infrastructure."],
    ar: ["الإطلاق", "إطلاق بعناية على بنية مستقرة وقليلة التكلفة."],
  },
  {
    en: ["Maintenance", "Kept running, updated and improved after launch."],
    ar: ["الصيانة", "متابعة وتحديث وتحسين مستمر بعد الإطلاق."],
  },
];

export function SdlcFlow({
  ar = false,
  compact = false,
}: {
  ar?: boolean;
  compact?: boolean;
}) {
  return (
    <section className={"sdlc" + (compact ? " sdlc-compact" : "")}>
      <div className="section-heading">
        <span className="eyebrow">
          {ar ? "منهجية العمل" : "HOW WE BUILD"}
        </span>
        <h2>
          {ar
            ? "دورة حياة تطوير البرمجيات (SDLC)"
            : "The Software Development Life Cycle"}
        </h2>
        <p>
          {ar
            ? "كل مشروع يمر بنفس المراحل السبع، من أول اجتماع حتى ما بعد الإطلاق."
            : "Every project moves through the same seven stages, from the first conversation to long after launch."}
        </p>
      </div>
      <ol className="flow-steps">
        {STEPS.map((s, i) => (
          <li className="flow-step" key={i}>
            <span className="flow-num">{String(i + 1).padStart(2, "0")}</span>
            <h3>{ar ? s.ar[0] : s.en[0]}</h3>
            <p>{ar ? s.ar[1] : s.en[1]}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
