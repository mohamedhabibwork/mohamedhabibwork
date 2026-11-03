/**
 * Arabic titles and descriptions for the /ar pages whose English meta is written in code.
 * Detail pages take theirs from the translated content.
 */
const OWNER = "محمد حبيب";
const ROLE = "مهندس برمجيات متكامل وقائد فريق";

export const SEO_AR = {
	name: OWNER,
	home: {
		title: `${OWNER} · ${ROLE}`,
		description: `${OWNER}، ${ROLE} بخبرة تزيد على 7 سنوات في بناء منصات ويب قابلة للتوسع، من متطلبات المنتج حتى التشغيل، لفرق في الشرق الأوسط وأوروبا.`,
	},
	projects: {
		title: "مشاريع برمجية ودراسات حالة",
		description: `مشاريع ومنصات برمجية بناها وقادها ${OWNER}، مع دراسات حالة توضح طبيعة كل مشروع والتقنيات المستخدمة فيه.`,
	},
	services: {
		title: "خدمات تطوير البرمجيات",
		description: `خدمات تطوير المنصات البرمجية وقيادة الفرق التقنية من ${OWNER}، لشركات في الشرق الأوسط وأوروبا. اطلب عرضًا أو احجز مكالمة.`,
	},
	blog: {
		description: `ملاحظات ${OWNER} عن هندسة البرمجيات والاستضافة الذاتية والبنية السحابية والأدوات التي يستخدمها يوميًا.`,
	},
};
