export type Field = {
  key: string;
  label: string;
  type: string;
  required?: boolean;
  options?: string[];
  relation?: string;
  min?: number;
  max?: number;
};
export type Module = {
  table: string;
  label: string;
  ar: string;
  permission: string;
  fields: Field[];
  statusKey?: string;
  readOnly?: boolean;
  noCreate?: boolean;
  invoice?: boolean;
};
export const modules: Record<string, Module> = {
  clients: {
    table: "clients",
    label: "Clients",
    ar: "العملاء",
    permission: "clients",
    fields: [
      {
        key: "name",
        label: "Name",
        type: "text",
        required: true,
      },
      {
        key: "company",
        label: "Company",
        type: "text",
      },
      {
        key: "email",
        label: "Email",
        type: "email",
      },
      {
        key: "phone",
        label: "Phone / WhatsApp",
        type: "text",
      },
      {
        key: "industry",
        label: "Industry",
        type: "text",
      },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: ["prospect", "active", "inactive", "archived"],
        required: true,
      },
      {
        key: "account_manager_id",
        label: "Account manager",
        type: "relation",
        relation: "profiles",
      },
      {
        key: "notes",
        label: "Notes",
        type: "textarea",
      },
    ],
  },
  leads: {
    table: "leads",
    label: "Leads",
    ar: "الفرص البيعية",
    permission: "leads",
    fields: [
      {
        key: "name",
        label: "Full name",
        type: "text",
        required: true,
      },
      {
        key: "company",
        label: "Company",
        type: "text",
      },
      {
        key: "email",
        label: "Email",
        type: "email",
      },
      {
        key: "phone",
        label: "Phone / WhatsApp",
        type: "text",
      },
      {
        key: "source",
        label: "Source",
        type: "text",
      },
      {
        key: "service",
        label: "Interested service",
        type: "text",
      },
      {
        key: "budget",
        label: "Budget range",
        type: "text",
      },
      {
        key: "timeline",
        label: "Timeline",
        type: "text",
      },
      {
        key: "description",
        label: "Project description",
        type: "textarea",
      },
      {
        key: "stage",
        label: "Stage",
        type: "select",
        options: [
          "new",
          "contacted",
          "qualified",
          "proposal_sent",
          "negotiation",
          "won",
          "lost",
        ],
        required: true,
      },
      {
        key: "expected_value_minor",
        label: "Expected value (EGP)",
        type: "money",
      },
      {
        key: "assigned_to",
        label: "Assigned to",
        type: "relation",
        relation: "profiles",
      },
      {
        key: "follow_up_date",
        label: "Follow-up date",
        type: "date",
      },
      {
        key: "notes",
        label: "Notes",
        type: "textarea",
      },
    ],
    statusKey: "stage",
  },
  projects: {
    table: "projects",
    label: "Projects",
    ar: "المشروعات",
    permission: "projects",
    fields: [
      {
        key: "name",
        label: "Name",
        type: "text",
        required: true,
      },
      {
        key: "client_id",
        label: "Client",
        type: "relation",
        relation: "clients",
      },
      {
        key: "description",
        label: "Description",
        type: "textarea",
      },
      {
        key: "category",
        label: "Category",
        type: "text",
      },
      {
        key: "start_date",
        label: "Start date",
        type: "date",
      },
      {
        key: "deadline",
        label: "Deadline",
        type: "date",
      },
      {
        key: "budget_minor",
        label: "Budget (EGP)",
        type: "money",
      },
      {
        key: "manager_id",
        label: "Project manager",
        type: "relation",
        relation: "profiles",
      },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: [
          "planning",
          "in_progress",
          "review",
          "on_hold",
          "completed",
          "cancelled",
        ],
        required: true,
      },
      {
        key: "priority",
        label: "Priority",
        type: "select",
        options: ["low", "normal", "high", "urgent"],
      },
      {
        key: "progress",
        label: "Progress %",
        type: "number",
        min: 0,
        max: 100,
      },
      {
        key: "notes",
        label: "Notes",
        type: "textarea",
      },
    ],
  },
  milestones: {
    table: "project_milestones",
    label: "Milestones",
    ar: "المراحل",
    permission: "projects",
    fields: [
      {
        key: "name",
        label: "Name",
        type: "text",
        required: true,
      },
      {
        key: "project_id",
        label: "Project",
        type: "relation",
        relation: "projects",
      },
      {
        key: "deadline",
        label: "Deadline",
        type: "date",
      },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: ["planned", "in_progress", "completed"],
        required: true,
      },
      {
        key: "notes",
        label: "Notes",
        type: "textarea",
      },
    ],
  },
  tasks: {
    table: "tasks",
    label: "Tasks",
    ar: "المهام",
    permission: "tasks",
    fields: [
      {
        key: "title",
        label: "Task title",
        type: "text",
        required: true,
      },
      {
        key: "description",
        label: "Description",
        type: "textarea",
      },
      {
        key: "project_id",
        label: "Project",
        type: "relation",
        relation: "projects",
      },
      {
        key: "client_id",
        label: "Client",
        type: "relation",
        relation: "clients",
      },
      {
        key: "assigned_to",
        label: "Assigned to",
        type: "relation",
        relation: "profiles",
      },
      {
        key: "deadline",
        label: "Deadline",
        type: "date",
      },
      {
        key: "priority",
        label: "Priority",
        type: "select",
        options: ["low", "normal", "high", "urgent"],
      },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: ["to_do", "in_progress", "in_review", "completed"],
        required: true,
      },
    ],
  },
  comments: {
    table: "task_comments",
    label: "Task comments",
    ar: "تعليقات المهام",
    permission: "tasks",
    fields: [
      {
        key: "task_id",
        label: "Task",
        type: "relation",
        relation: "tasks",
        required: true,
      },
      {
        key: "body",
        label: "Comment",
        type: "textarea",
        required: true,
      },
    ],
  },
  "project-members": {
    table: "project_members",
    label: "Project team",
    ar: "فريق المشروع",
    permission: "projects",
    fields: [
      {
        key: "project_id",
        label: "Project",
        type: "relation",
        relation: "projects",
        required: true,
      },
      {
        key: "profile_id",
        label: "Team member",
        type: "relation",
        relation: "profiles",
        required: true,
      },
    ],
  },
  team: {
    table: "profiles",
    label: "Team",
    ar: "الفريق",
    permission: "team",
    fields: [
      {
        key: "name",
        label: "Name",
        type: "text",
        required: true,
      },
      {
        key: "email",
        label: "Email",
        type: "email",
        required: true,
      },
      {
        key: "phone",
        label: "Phone",
        type: "text",
      },
      {
        key: "job_title",
        label: "Job title",
        type: "text",
      },
      {
        key: "department_id",
        label: "Department",
        type: "relation",
        relation: "departments",
      },
      {
        key: "joining_date",
        label: "Joining date",
        type: "date",
      },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: ["active", "inactive"],
        required: true,
      },
      {
        key: "role_id",
        label: "Role",
        type: "relation",
        relation: "roles",
        required: true,
      },
    ],
    noCreate: true,
  },
  departments: {
    table: "departments",
    label: "Departments",
    ar: "الأقسام",
    permission: "team",
    fields: [
      {
        key: "name",
        label: "Name",
        type: "text",
        required: true,
      },
    ],
  },
  services: {
    table: "services",
    label: "Services",
    ar: "الخدمات",
    permission: "services",
    fields: [
      { key: "description_ar", label: "Arabic description", type: "textarea" },
      { key: "benefits_ar", label: "Arabic benefits", type: "textarea" },
      {
        key: "deliverables_ar",
        label: "Arabic deliverables",
        type: "textarea",
      },
      { key: "workflow_ar", label: "Arabic workflow", type: "textarea" },
      { key: "pricing_ar", label: "Arabic pricing", type: "textarea" },
      {
        key: "name",
        label: "Name",
        type: "text",
        required: true,
      },
      {
        key: "name_ar",
        label: "Arabic name",
        type: "text",
      },
      {
        key: "slug",
        label: "URL slug",
        type: "text",
        required: true,
      },
      {
        key: "division",
        label: "Division",
        type: "select",
        options: ["digital", "marketing"],
        required: true,
      },
      {
        key: "description",
        label: "Description",
        type: "textarea",
        required: true,
      },
      {
        key: "benefits",
        label: "Benefits (one per line)",
        type: "textarea",
      },
      {
        key: "deliverables",
        label: "Deliverables (one per line)",
        type: "textarea",
      },
      {
        key: "workflow",
        label: "Workflow (one per line)",
        type: "textarea",
      },
      {
        key: "pricing",
        label: "Pricing text",
        type: "text",
      },
      {
        key: "show_pricing",
        label: "Show pricing",
        type: "boolean",
      },
      {
        key: "image_url",
        label: "Image URL",
        type: "url",
      },
      {
        key: "featured",
        label: "Featured",
        type: "boolean",
      },
      {
        key: "published",
        label: "Published",
        type: "boolean",
      },
      {
        key: "sort_order",
        label: "Display order",
        type: "number",
      },
    ],
  },
  portfolio: {
    table: "portfolio_projects",
    label: "Portfolio",
    ar: "معرض الأعمال",
    permission: "portfolio",
    fields: [
      { key: "title_ar", label: "Arabic title", type: "textarea" },
      { key: "description_ar", label: "Arabic description", type: "textarea" },
      { key: "category_ar", label: "Arabic category", type: "textarea" },
      { key: "industry_ar", label: "Arabic industry", type: "textarea" },
      { key: "challenge_ar", label: "Arabic challenge", type: "textarea" },
      { key: "solution_ar", label: "Arabic solution", type: "textarea" },
      { key: "results_ar", label: "Arabic results", type: "textarea" },
      {
        key: "services_provided_ar",
        label: "Arabic services provided",
        type: "textarea",
      },
      { key: "external_url", label: "Live project URL", type: "url" },
      {
        key: "title",
        label: "Project title",
        type: "text",
        required: true,
      },
      {
        key: "slug",
        label: "URL slug",
        type: "text",
        required: true,
      },
      {
        key: "client_name",
        label: "Public client name",
        type: "text",
      },
      {
        key: "client_id",
        label: "Client",
        type: "relation",
        relation: "clients",
      },
      {
        key: "category",
        label: "Category",
        type: "text",
      },
      {
        key: "industry",
        label: "Industry",
        type: "text",
      },
      {
        key: "description",
        label: "Description",
        type: "textarea",
      },
      {
        key: "challenge",
        label: "Challenge",
        type: "textarea",
      },
      {
        key: "solution",
        label: "Solution",
        type: "textarea",
      },
      {
        key: "services_provided",
        label: "Services provided (one per line)",
        type: "textarea",
      },
      {
        key: "technologies",
        label: "Technologies (one per line)",
        type: "textarea",
      },
      {
        key: "results",
        label: "Verified results",
        type: "textarea",
      },
      {
        key: "project_date",
        label: "Project date",
        type: "date",
      },
      {
        key: "thumbnail_url",
        label: "Thumbnail URL",
        type: "url",
      },
      {
        key: "video_url",
        label: "Video URL",
        type: "url",
      },
      {
        key: "featured",
        label: "Featured",
        type: "boolean",
      },
      {
        key: "published",
        label: "Published",
        type: "boolean",
      },
      {
        key: "sort_order",
        label: "Display order",
        type: "number",
      },
    ],
  },
  "portfolio-media": {
    table: "portfolio_media",
    label: "Portfolio images",
    ar: "صور الأعمال",
    permission: "portfolio",
    fields: [
      {
        key: "portfolio_project_id",
        label: "Portfolio project",
        type: "relation",
        relation: "portfolio_projects",
        required: true,
      },
      {
        key: "url",
        label: "Image URL",
        type: "url",
        required: true,
      },
      {
        key: "alt",
        label: "Image description",
        type: "text",
        required: true,
      },
      {
        key: "sort_order",
        label: "Order",
        type: "number",
      },
    ],
  },
  content: {
    table: "content_posts",
    label: "Content calendar",
    ar: "تقويم المحتوى",
    permission: "marketing",
    fields: [
      {
        key: "title",
        label: "Content title",
        type: "text",
        required: true,
      },
      {
        key: "client_id",
        label: "Client",
        type: "relation",
        relation: "clients",
      },
      {
        key: "platform",
        label: "Platform",
        type: "select",
        options: [
          "facebook",
          "instagram",
          "linkedin",
          "tiktok",
          "youtube",
          "website",
          "other",
        ],
      },
      {
        key: "content_type",
        label: "Content type",
        type: "select",
        options: ["post", "reel", "story", "article", "video", "other"],
      },
      {
        key: "publishing_date",
        label: "Publishing date",
        type: "date",
      },
      {
        key: "caption",
        label: "Caption",
        type: "textarea",
      },
      {
        key: "hashtags",
        label: "Hashtags",
        type: "text",
      },
      {
        key: "designer_id",
        label: "Designer",
        type: "relation",
        relation: "profiles",
      },
      {
        key: "copywriter_id",
        label: "Copywriter",
        type: "relation",
        relation: "profiles",
      },
      {
        key: "editor_id",
        label: "Video editor",
        type: "relation",
        relation: "profiles",
      },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: [
          "idea",
          "draft",
          "in_production",
          "review",
          "scheduled",
          "published",
        ],
        required: true,
      },
    ],
  },
  campaigns: {
    table: "marketing_campaigns",
    label: "Campaigns",
    ar: "الحملات",
    permission: "marketing",
    fields: [
      {
        key: "name",
        label: "Name",
        type: "text",
        required: true,
      },
      {
        key: "client_id",
        label: "Client",
        type: "relation",
        relation: "clients",
      },
      {
        key: "platform",
        label: "Platform",
        type: "text",
      },
      {
        key: "objective",
        label: "Objective",
        type: "textarea",
      },
      {
        key: "start_date",
        label: "Start date",
        type: "date",
      },
      {
        key: "end_date",
        label: "End date",
        type: "date",
      },
      {
        key: "budget_minor",
        label: "Budget (EGP)",
        type: "money",
      },
      {
        key: "ad_spend_minor",
        label: "Ad spend (EGP)",
        type: "money",
      },
      {
        key: "target_audience",
        label: "Target audience",
        type: "textarea",
      },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: ["planned", "active", "paused", "completed"],
        required: true,
      },
      {
        key: "leads_generated",
        label: "Leads generated",
        type: "number",
      },
      {
        key: "engagement",
        label: "Engagement",
        type: "number",
      },
      {
        key: "reach",
        label: "Reach",
        type: "number",
      },
      {
        key: "conversions",
        label: "Conversions",
        type: "number",
      },
      {
        key: "results",
        label: "Results",
        type: "textarea",
      },
      {
        key: "notes",
        label: "Notes",
        type: "textarea",
      },
    ],
  },
  social: {
    table: "social_accounts",
    label: "Social accounts",
    ar: "حسابات التواصل",
    permission: "marketing",
    fields: [
      {
        key: "name",
        label: "Account name",
        type: "text",
        required: true,
      },
      {
        key: "platform",
        label: "Platform",
        type: "text",
        required: true,
      },
      {
        key: "url",
        label: "Account URL",
        type: "url",
        required: true,
      },
      {
        key: "client_id",
        label: "Client",
        type: "relation",
        relation: "clients",
      },
      {
        key: "notes",
        label: "Notes",
        type: "textarea",
      },
    ],
  },
  invoices: {
    table: "invoices",
    label: "Invoices",
    ar: "الفواتير",
    permission: "finance",
    fields: [
      {
        key: "invoice_number",
        label: "Invoice number",
        type: "text",
        required: true,
      },
      {
        key: "client_id",
        label: "Client",
        type: "relation",
        relation: "clients",
        required: true,
      },
      {
        key: "project_id",
        label: "Project",
        type: "relation",
        relation: "projects",
      },
      {
        key: "issue_date",
        label: "Issue date",
        type: "date",
        required: true,
      },
      {
        key: "due_date",
        label: "Due date",
        type: "date",
        required: true,
      },
      {
        key: "tax_bps",
        label: "Tax (%)",
        type: "percent",
      },
      {
        key: "notes",
        label: "Notes",
        type: "textarea",
      },
    ],
    invoice: true,
  },
  payments: {
    table: "payments",
    label: "Payments",
    ar: "المدفوعات",
    permission: "finance",
    fields: [
      {
        key: "invoice_id",
        label: "Invoice",
        type: "relation",
        relation: "invoices",
        required: true,
      },
      {
        key: "amount_minor",
        label: "Amount (EGP)",
        type: "money",
        required: true,
      },
      {
        key: "paid_at",
        label: "Payment date",
        type: "date",
        required: true,
      },
      {
        key: "method",
        label: "Method",
        type: "select",
        options: ["bank_transfer", "cash", "wallet", "card", "other"],
      },
      {
        key: "reference",
        label: "Reference",
        type: "text",
      },
      {
        key: "notes",
        label: "Notes",
        type: "textarea",
      },
    ],
  },
  expenses: {
    table: "expenses",
    label: "Expenses",
    ar: "المصروفات",
    permission: "finance",
    fields: [
      {
        key: "name",
        label: "Description",
        type: "text",
        required: true,
      },
      {
        key: "project_id",
        label: "Project",
        type: "relation",
        relation: "projects",
      },
      {
        key: "amount_minor",
        label: "Amount (EGP)",
        type: "money",
        required: true,
      },
      {
        key: "category",
        label: "Category",
        type: "text",
      },
      {
        key: "expense_date",
        label: "Date",
        type: "date",
        required: true,
      },
      {
        key: "notes",
        label: "Notes",
        type: "textarea",
      },
    ],
  },
  files: {
    table: "files",
    label: "Files",
    ar: "الملفات",
    permission: "files",
    fields: [
      {
        key: "name",
        label: "File name",
        type: "text",
        required: true,
      },
      {
        key: "folder",
        label: "Folder",
        type: "text",
      },
      {
        key: "client_id",
        label: "Client",
        type: "relation",
        relation: "clients",
      },
      {
        key: "project_id",
        label: "Project",
        type: "relation",
        relation: "projects",
      },
    ],
  },
  notifications: {
    table: "notifications",
    label: "Notifications",
    ar: "الإشعارات",
    permission: "notifications",
    fields: [
      {
        key: "title",
        label: "Title",
        type: "text",
      },
      {
        key: "body",
        label: "Message",
        type: "text",
      },
      {
        key: "read_at",
        label: "Read at",
        type: "text",
      },
    ],
    readOnly: true,
  },
  activity: {
    table: "activity_logs",
    label: "Activity log",
    ar: "سجل النشاط",
    permission: "activity",
    fields: [
      {
        key: "action",
        label: "Action",
        type: "text",
      },
      {
        key: "entity_table",
        label: "Module",
        type: "text",
      },
      {
        key: "entity_id",
        label: "Record",
        type: "text",
      },
      {
        key: "actor_id",
        label: "Performed by",
        type: "text",
      },
      {
        key: "created_at",
        label: "Time",
        type: "text",
      },
    ],
    readOnly: true,
  },
  "lead-activities": {
    table: "lead_activities",
    label: "Lead activity",
    ar: "متابعة الفرص",
    permission: "leads",
    fields: [
      {
        key: "lead_id",
        label: "Lead",
        type: "relation",
        relation: "leads",
        required: true,
      },
      {
        key: "body",
        label: "Activity note",
        type: "textarea",
        required: true,
      },
      {
        key: "kind",
        label: "Activity type",
        type: "select",
        options: ["note", "call", "email", "meeting", "follow_up"],
      },
    ],
  },
  settings: {
    table: "website_settings",
    label: "Website settings",
    ar: "إعدادات الموقع",
    permission: "settings",
    fields: [
      {
        key: "key",
        label: "Setting key",
        type: "text",
        required: true,
      },
      {
        key: "value",
        label: "Value",
        type: "textarea",
        required: true,
      },
      {
        key: "is_public",
        label: "Public setting",
        type: "boolean",
      },
    ],
  },
  testimonials: {
    table: "testimonials",
    label: "Testimonials",
    ar: "آراء العملاء",
    permission: "portfolio",
    fields: [
      { key: "quote_ar", label: "Arabic quote", type: "textarea" },
      {
        key: "name",
        label: "Client name",
        type: "text",
        required: true,
      },
      {
        key: "company",
        label: "Company",
        type: "text",
      },
      {
        key: "quote",
        label: "Approved testimonial",
        type: "textarea",
        required: true,
      },
      {
        key: "published",
        label: "Published",
        type: "boolean",
      },
    ],
  },
  roles: {
    table: "roles",
    label: "Roles",
    ar: "الأدوار",
    permission: "security",
    fields: [
      {
        key: "name",
        label: "Name",
        type: "text",
        required: true,
      },
      {
        key: "description",
        label: "Description",
        type: "textarea",
      },
    ],
    readOnly: true,
  },
  permissions: {
    table: "role_permissions",
    label: "Role permissions",
    ar: "صلاحيات الأدوار",
    permission: "security",
    fields: [
      {
        key: "role_id",
        label: "Role",
        type: "relation",
        relation: "roles",
        required: true,
      },
      {
        key: "permission_id",
        label: "Permission",
        type: "relation",
        relation: "permissions",
        required: true,
      },
    ],
  },
};
modules["task-attachments"] = {
  table: "task_attachments",
  label: "Task attachments",
  ar: "مرفقات المهام",
  permission: "tasks",
  fields: [
    {
      key: "task_id",
      label: "Task",
      type: "relation",
      relation: "tasks",
      required: true,
    },
    {
      key: "file_id",
      label: "File",
      type: "relation",
      relation: "files",
      required: true,
    },
  ],
};
export const tableLabel = (row: Record<string, unknown>) =>
  String(
    row.name ??
      row.title ??
      row.invoice_number ??
      row.key ??
      row.email ??
      row.id ??
      "Record",
  );
