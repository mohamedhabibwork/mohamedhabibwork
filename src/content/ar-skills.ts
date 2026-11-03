import { getLocale } from "#/paraglide/runtime";

/** Skill labels are translated only for display: skill evidence matches on the English names. */
const AR_SKILL_LABELS: Record<string, string> = {
	Architecture: "هندسة الأنظمة",
	Backend: "الواجهة الخلفية",
	"Cloud & DevOps": "السحابة وDevOps",
	Data: "البيانات",
	Frontend: "الواجهة الأمامية",
	Leadership: "القيادة",
	Specialties: "تخصصات",
	"Agile / Scrum": "المنهجيات الرشيقة / Scrum",
	"ERP / CRM": "أنظمة ERP وCRM",
	"Event-driven (RabbitMQ / Kafka)":
		"الأنظمة القائمة على الأحداث (RabbitMQ / Kafka)",
	Microservices: "الخدمات المصغّرة",
	"Payment gateways": "بوابات الدفع",
	"REST & GraphQL APIs": "واجهات REST وGraphQL",
	"Real-time systems (WebSocket)": "الأنظمة اللحظية (WebSocket)",
	"System design": "تصميم الأنظمة",
	"Team leadership": "قيادة الفرق",
};

export const skillLabel = (name: string) =>
	getLocale() === "ar" ? (AR_SKILL_LABELS[name] ?? name) : name;
