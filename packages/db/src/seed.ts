import { createDb } from "./index";
import {
	contacts,
	experience,
	industries,
	profile,
	projectCategories,
	projects,
	skillSpecializations,
	skills,
} from "./schema";

const db = createDb();

async function clearTables() {
	console.log("Clearing existing data...");
	await db.delete(contacts);
	await db.delete(experience);
	await db.delete(industries);
	await db.delete(projects);
	await db.delete(projectCategories);
	await db.delete(skillSpecializations);
	await db.delete(skills);
	await db.delete(profile);
	console.log("Tables cleared");
}

async function seedProfile() {
	console.log("Seeding profile...");

	const profileData = {
		nameEn: "Mohammad Habib",
		nameAr: "محمد حبيب",
		titleEn: "Senior Full Stack Developer & Team Leader",
		titleAr: "مطور Full Stack أول وقائد فريق",
		taglineEn:
			"Transforming ideas into scalable digital solutions with 7+ years of expertise in enterprise development and team leadership.",
		taglineAr:
			"نحول الأفكار إلى حلول رقمية قابلة للتطوير بأكثر من 7 سنوات من الخبرة في التطوير المؤسسي وقيادة الفرق.",
		email: "contact@mohamedhabib.work",
		whatsapp: "+201151978927",
		linkedin: "https://linkedin.com/in/mohamedhabibwork",
		github: "https://github.com/mohamedhabibwork",
		locationEn: "Egypt • Remote Available Globally",
		locationAr: "مصر • متاح للعمل عن بُعد حول العالم",
		timezone: "GMT+2",
		availabilityEn: "Available for hire — Remote & On-site",
		availabilityAr: "متاح للتوظيف — عن بُعد أو في الموقع",
		bioEn:
			"A passionate Senior Full Stack Developer with a proven track record of transforming complex business requirements into scalable digital solutions. Experienced in leading teams of 5–10 developers, architecting microservices, and delivering enterprise-grade applications across transportation, healthcare, fintech, and e-commerce sectors.",
		bioAr:
			"مطور Full Stack أول شغوف يتمتع بسجل حافل في تحويل متطلبات الأعمال المعقدة إلى حلول رقمية قابلة للتطوير. خبرة في قيادة فرق من 5 إلى 10 مطورين، وتصميم الخدمات المصغرة، وتسليم تطبيقات على مستوى المؤسسات في قطاعات النقل والرعاية الصحية والتكنولوجيا المالية والتجارة الإلكترونية.",
		statsYears: 7,
		statsProjects: 50,
		statsIndustries: 6,
		statsSuccessRate: 95,
	};

	await db.insert(profile).values(profileData);
	console.log("Profile seeded");
}

async function seedSkills() {
	console.log("Seeding skills...");

	const skillsData = [
		{
			nameEn: "PHP & Laravel",
			nameAr: "PHP و Laravel",
			levelEn: "Expert",
			levelAr: "خبير",
			years: 6,
			descriptionEn:
				"Enterprise Solutions • Real-time Systems • API Development",
			descriptionAr:
				"حلول المؤسسات • أنظمة الوقت الفعلي • تطوير واجهات البرمجة",
			categoryEn: "backend",
			categoryAr: "الخلفية",
		},
		{
			nameEn: "Node.js & Express",
			nameAr: "Node.js و Express",
			levelEn: "Advanced",
			levelAr: "متقدم",
			years: 4,
			descriptionEn: "WebSocket • Chat Systems • RESTful APIs • Microservices",
			descriptionAr:
				"WebSocket • أنظمة الدردشة • واجهات RESTful • الخدمات المصغرة",
			categoryEn: "backend",
			categoryAr: "الخلفية",
		},
		{
			nameEn: "Go / Golang",
			nameAr: "Go / Golang",
			levelEn: "Advanced",
			levelAr: "متقدم",
			years: 3,
			descriptionEn:
				"Socket Programming • High Performance • Concurrent Systems",
			descriptionAr: "برمجة المقابس • أداء عالي • الأنظمة المتزامنة",
			categoryEn: "backend",
			categoryAr: "الخلفية",
		},
		{
			nameEn: "Python",
			nameAr: "Python",
			levelEn: "Intermediate",
			levelAr: "متوسط",
			years: 2,
			descriptionEn: "Data Processing • Automation Scripts • AI Integration",
			descriptionAr:
				"معالجة البيانات • سكربتات الأتمتة • تكامل الذكاء الاصطناعي",
			categoryEn: "backend",
			categoryAr: "الخلفية",
		},
		{
			nameEn: "React.js",
			nameAr: "React.js",
			levelEn: "Advanced",
			levelAr: "متقدم",
			years: 4,
			descriptionEn:
				"Hooks • Redux • Modern Patterns • Performance Optimization",
			descriptionAr: "Hooks • Redux • الأنماط الحديثة • تحسين الأداء",
			categoryEn: "frontend",
			categoryAr: "الواجهة الأمامية",
		},
		{
			nameEn: "Vue.js",
			nameAr: "Vue.js",
			levelEn: "Advanced",
			levelAr: "متقدم",
			years: 4,
			descriptionEn: "Composition API • Vuex • Nuxt.js • SSR",
			descriptionAr: "Composition API • Vuex • Nuxt.js • SSR",
			categoryEn: "frontend",
			categoryAr: "الواجهة الأمامية",
		},
		{
			nameEn: "JavaScript ES6+",
			nameAr: "JavaScript ES6+",
			levelEn: "Expert",
			levelAr: "خبير",
			years: 6,
			descriptionEn:
				"TypeScript • Async/Await • Modules • Functional Programming",
			descriptionAr: "TypeScript • Async/Await • الوحدات • البرمجة الوظيفية",
			categoryEn: "frontend",
			categoryAr: "الواجهة الأمامية",
		},
		{
			nameEn: "HTML5 & CSS3",
			nameAr: "HTML5 و CSS3",
			levelEn: "Expert",
			levelAr: "خبير",
			years: 7,
			descriptionEn:
				"Flexbox • Grid • Animations • Responsive Design • Accessibility",
			descriptionAr:
				"Flexbox • Grid • الرسوم المتحركة • التصميم المتجاوب • إمكانية الوصول",
			categoryEn: "frontend",
			categoryAr: "الواجهة الأمامية",
		},
		{
			nameEn: "MySQL",
			nameAr: "MySQL",
			levelEn: "Expert",
			levelAr: "خبير",
			years: 6,
			descriptionEn: "Optimization • Indexing • Replication • Query Tuning",
			descriptionAr: "التحسين • الفهرسة • النسخ المتماثل • ضبط الاستعلامات",
			categoryEn: "database",
			categoryAr: "قواعد البيانات",
		},
		{
			nameEn: "PostgreSQL",
			nameAr: "PostgreSQL",
			levelEn: "Advanced",
			levelAr: "متقدم",
			years: 4,
			descriptionEn:
				"Complex Queries • JSON Support • Full-Text Search • Partitioning",
			descriptionAr:
				"الاستعلامات المعقدة • دعم JSON • البحث النصي الكامل • التجزئة",
			categoryEn: "database",
			categoryAr: "قواعد البيانات",
		},
		{
			nameEn: "AWS Cloud",
			nameAr: "AWS Cloud",
			levelEn: "Advanced",
			levelAr: "متقدم",
			years: 3,
			descriptionEn: "EC2 • RDS • S3 • Lambda • CloudWatch • IAM",
			descriptionAr: "EC2 • RDS • S3 • Lambda • CloudWatch • IAM",
			categoryEn: "cloud",
			categoryAr: "السحابة",
		},
		{
			nameEn: "Docker & DevOps",
			nameAr: "Docker و DevOps",
			levelEn: "Intermediate",
			levelAr: "متوسط",
			years: 2,
			descriptionEn:
				"Containerization • CI/CD Pipelines • Kubernetes • Monitoring",
			descriptionAr: "الحاويات • خطوط CI/CD • Kubernetes • المراقبة",
			categoryEn: "cloud",
			categoryAr: "السحابة",
		},
		{
			nameEn: "Team Leadership",
			nameAr: "قيادة الفريق",
			levelEn: "Advanced",
			levelAr: "متقدم",
			years: 3,
			descriptionEn:
				"Leading teams of 5–10 developers • Mentorship • Code Reviews",
			descriptionAr: "قيادة فرق من 5 إلى 10 مطورين • الإرشاد • مراجعة الكود",
			categoryEn: "leadership",
			categoryAr: "القيادة",
		},
		{
			nameEn: "System Architecture",
			nameAr: "هندسة الأنظمة",
			levelEn: "Advanced",
			levelAr: "متقدم",
			years: 3,
			descriptionEn:
				"Microservices • Scalable Design • Event-Driven Architecture",
			descriptionAr:
				"الخدمات المصغرة • التصميم القابل للتطوير • الهندسة المعتمدة على الأحداث",
			categoryEn: "leadership",
			categoryAr: "القيادة",
		},
		{
			nameEn: "Project Management",
			nameAr: "إدارة المشاريع",
			levelEn: "Intermediate",
			levelAr: "متوسط",
			years: 4,
			descriptionEn: "Agile • Scrum • Sprint Planning • Delivery Management",
			descriptionAr: "Agile • Scrum • تخطيط السبرينت • إدارة التسليم",
			categoryEn: "leadership",
			categoryAr: "القيادة",
		},
	];

	await db.insert(skills).values(skillsData);
	console.log(`Skills seeded: ${skillsData.length} records`);
}

async function seedSkillSpecializations() {
	console.log("Seeding skill specializations...");

	const specializationsData = [
		{
			nameEn: "Real-time Tracking Systems",
			nameAr: "أنظمة التتبع في الوقت الفعلي",
		},
		{
			nameEn: "Payment Gateway Integrations",
			nameAr: "تكامل بوابات الدفع",
		},
		{
			nameEn: "ERP / CRM Solutions",
			nameAr: "حلول ERP / CRM",
		},
		{
			nameEn: "Mobile API Development",
			nameAr: "تطوير واجهات برمجة تطبيقات الجوال",
		},
		{
			nameEn: "Healthcare Management Systems",
			nameAr: "أنظمة إدارة الرعاية الصحية",
		},
		{
			nameEn: "E-commerce Platforms",
			nameAr: "منصات التجارة الإلكترونية",
		},
	];

	await db.insert(skillSpecializations).values(specializationsData);
	console.log(
		`Skill specializations seeded: ${specializationsData.length} records`
	);
}

async function seedProjectCategories() {
	console.log("Seeding project categories...");

	const categoriesData = [
		{ nameEn: "All", nameAr: "الكل", isDefault: true },
		{ nameEn: "Transportation", nameAr: "النقل", isDefault: false },
		{ nameEn: "Healthcare", nameAr: "الرعاية الصحية", isDefault: false },
		{ nameEn: "Navigation", nameAr: "الملاحة", isDefault: false },
		{ nameEn: "FinTech", nameAr: "التكنولوجيا المالية", isDefault: false },
		{ nameEn: "International", nameAr: "دولي", isDefault: false },
		{ nameEn: "Education", nameAr: "التعليم", isDefault: false },
		{ nameEn: "Security", nameAr: "الأمان", isDefault: false },
		{ nameEn: "E-commerce", nameAr: "التجارة الإلكترونية", isDefault: false },
	];

	await db.insert(projectCategories).values(categoriesData);
	console.log(`Project categories seeded: ${categoriesData.length} records`);
}

async function seedProjects() {
	console.log("Seeding projects...");

	const projectsData = [
		{
			projectId: "too-app",
			titleEn: "TOO APP",
			titleAr: "تطبيق توو",
			categoryEn: "Transportation",
			categoryAr: "النقل",
			companyEn: "Mugsult",
			companyAr: "مجسلت",
			descriptionEn:
				"A complete Uber-like ride-hailing platform featuring real-time GPS tracking, integrated payment gateways (Fawry, PayPal), driver and passenger mobile applications, and a comprehensive admin dashboard with analytics and reporting.",
			descriptionAr:
				"منصة كاملة لحجز الرحلات تشبه أوبر، تتميز بتتبع GPS في الوقت الفعلي، وتكامل بوابات الدفع (فوري، باي بال)، وتطبيقات الجوال للسائقين والركاب، ولوحة تحكم إدارية شاملة مع التحليلات والتقارير.",
			featuresEn: [
				"Real-time GPS tracking & intelligent dispatch",
				"Multi-gateway payment integration (Fawry, PayPal, Stripe)",
				"Native driver & passenger mobile apps (iOS & Android)",
				"Admin dashboard with live analytics, heatmaps & reporting",
				"Driver rating system & automated payout management",
			],
			featuresAr: [
				"تتبع GPS في الوقت الفعلي والإرسال الذكي",
				"تكامل بوابات دفع متعددة (فوري، باي بال، ستريب)",
				"تطبيقات جوال أصلية للسائقين والركاب (iOS و Android)",
				"لوحة تحكم إدارية مع تحليلات مباشرة وخرائط حرارية وتقارير",
				"نظام تقييم السائقين وإدارة المدفوعات الآلية",
			],
			techStack: [
				"Laravel",
				"GoLang",
				"MySQL",
				"Socket.io",
				"Redis",
				"Firebase",
			],
			year: "2024–2025",
		},
		{
			projectId: "team1",
			titleEn: "Team1",
			titleAr: "تيم وان",
			categoryEn: "Healthcare",
			categoryAr: "الرعاية الصحية",
			companyEn: "Mugsult",
			companyAr: "مجسلت",
			descriptionEn:
				"A critical healthcare transportation coordination system designed for emergency dispatch, enabling real-time communication between medical teams, patient tracking, and seamless hospital coordination during life-saving operations.",
			descriptionAr:
				"نظام حرج لتنسيق النقل الصحي مصمم لإرسال الطوارئ، يتيح التواصل الفوري بين الفرق الطبية، وتتبع المرضى، والتنسيق السلس مع المستشفيات خلال عمليات الإنقاذ.",
			featuresEn: [
				"Emergency dispatch system with priority routing",
				"Real-time medical team chat with media sharing",
				"Patient tracking, vitals monitoring & ETA alerts",
				"Hospital coordination interface with bed availability",
				"Automated incident reporting & compliance logs",
			],
			featuresAr: [
				"نظام إرسال الطوارئ مع توجيه حسب الأولوية",
				"دردشة فورية للفريق الطبي مع مشاركة الوسائط",
				"تتبع المرضى، ومراقبة العلامات الحيوية، وتنبيهات وقت الوصول",
				"واجهة تنسيق المستشفيات مع توفر الأسرة",
				"التقارير الآلية للحوادث وسجلات الامتثال",
			],
			techStack: [
				"Laravel",
				"Node.js",
				"MySQL",
				"WebSocket",
				"Redis",
				"Twilio",
			],
			year: "2024–2025",
		},
		{
			projectId: "mappy",
			titleEn: "Mappy",
			titleAr: "مابي",
			categoryEn: "Navigation",
			categoryAr: "الملاحة",
			companyEn: "Gulf Communication",
			companyAr: "خليج للاتصالات",
			descriptionEn:
				"A custom mapping and navigation solution built from the ground up, featuring a proprietary mapping engine, intelligent route optimization, location-based services, and enterprise-grade mapping APIs for business integration.",
			descriptionAr:
				"حل خرائط وملاحة مخصص مبني من الصفر، يضم محرك خرائط خاص، وتحسين ذكي للمسارات، وخدمات قائمة على الموقع، وواجهات برمجة تطبيقات للخرائط على مستوى المؤسسات للتكامل التجاري.",
			featuresEn: [
				"Proprietary mapping engine with offline map support",
				"AI-powered route optimization for fuel & time efficiency",
				"Geofencing, POI search & location-based notifications",
				"Enterprise REST APIs for third-party integrations",
				"Real-time traffic overlay & alternate route suggestions",
			],
			featuresAr: [
				"محرك خرائط خاص مع دعم الخرائط بدون إنترنت",
				"تحسين المسارات بالذكاء الاصطناعي لكفاءة الوقود والوقت",
				"الحدود الجغرافية، والبحث عن نقاط الاهتمام، والإشعارات القائمة على الموقع",
				"واجهات REST للمؤسسات للتكامل مع الأطراف الثالثة",
				"طبقة حركة المرور الفورية واقتراحات مسارات بديلة",
			],
			techStack: ["ASP.NET Core", "React", "PostgreSQL", "Mapbox", "Redis"],
			year: "2021–2023",
			url: "https://mapy.world",
		},
		{
			projectId: "too-medical",
			titleEn: "Too Medical",
			titleAr: "توو الطبي",
			categoryEn: "Healthcare",
			categoryAr: "الرعاية الصحية",
			companyEn: "Gulf Communication",
			companyAr: "خليج للاتصالات",
			descriptionEn:
				"A comprehensive medical representative management system enabling real-time tracking of field reps, automated visit scheduling, CRM-style client management, and detailed performance analytics dashboards for pharmaceutical companies.",
			descriptionAr:
				"نظام شامل لإدارة المندوبين الطبيين يتيح تتبع المندوبين في الميدان في الوقت الفعلي، وجدولة الزيارات الآلية، وإدارة العملاء على غرار CRM، ولوحات تحكم مفصلة لتحليلات الأداء لشركات الأدوية.",
			featuresEn: [
				"GPS tracking & geofenced check-ins for medical reps",
				"Smart visit scheduling with route optimization",
				"CRM module for doctors, clinics & pharmacy chains",
				"Performance analytics dashboard with KPI tracking",
				"Sample inventory management & expense reporting",
			],
			featuresAr: [
				"تتبع GPS وتسجيل الوصول ضمن الحدود الجغرافية للمندوبين الطبيين",
				"جدولة ذكية للزيارات مع تحسين المسارات",
				"وحدة CRM للأطباء والعيادات وسلاسل الصيدليات",
				"لوحة تحكم لتحليلات الأداء مع تتبع مؤشرات الأداء الرئيسية",
				"إدارة مخزون العينات والتقارير المصروفات",
			],
			techStack: [
				"Laravel",
				"GoLang",
				"PostgreSQL",
				"ElasticSearch",
				"ERP Integration",
			],
			year: "2021–2023",
		},
		{
			projectId: "paymob-suite",
			titleEn: "Paymob Suite",
			titleAr: "باكج بايموب",
			categoryEn: "FinTech",
			categoryAr: "التكنولوجيا المالية",
			companyEn: "Various Clients",
			companyAr: "عملاء متنوعون",
			descriptionEn:
				"Enterprise financial management systems encompassing ASM and FSM projects, featuring secure payment processing, real-time transaction management, comprehensive financial reporting, and seamless ERP integration for large-scale operations.",
			descriptionAr:
				"أنظمة إدارة مالية للمؤسسات تشمل مشاريع ASM و FSM، تتميز بمعالجة دفع آمنة، وإدارة معاملات في الوقت الفعلي، وتقارير مالية شاملة، وتكامل سلس مع ERP للعمليات واسعة النطاق.",
			featuresEn: [
				"Multi-channel payment gateway integration",
				"Real-time transaction monitoring & fraud detection",
				"Comprehensive financial reporting & analytics suite",
				"Enterprise ERP integration with automated reconciliation",
				"Role-based access control & audit trails",
			],
			featuresAr: [
				"تكامل بوابة دفع متعددة القنوات",
				"مراقبة المعاملات في الوقت الفعلي والكشف عن الاحتيال",
				"حل تقارير مالية وتحليلات شاملة",
				"تكامل ERP للمؤسسات مع التسوية الآلية",
				"التحكم في الوصول القائم على الأدوار وسجلات التدقيق",
			],
			techStack: [
				"Laravel",
				"PostgreSQL",
				"Redis",
				"RabbitMQ",
				"Financial APIs",
			],
			year: "2018–2020",
		},
		{
			projectId: "saudi-portfolio",
			titleEn: "Saudi Digital Portfolio",
			titleAr: "المحفظة الرقمية السعودية",
			categoryEn: "International",
			categoryAr: "دولي",
			companyEn: "Code700 (Riyadh, KSA)",
			companyAr: "Code700 (الرياض، المملكة العربية السعودية)",
			descriptionEn:
				"A complete digital solutions suite developed for the Saudi Arabian market, including Ensany (healthcare), Qaff (cultural platform), Mozn (weather services), and Cashback (rewards system) — all managed with international team coordination and agile delivery.",
			descriptionAr:
				"حلول رقمية كاملة طورت لسوق المملكة العربية السعودية، تشمل إنساني (الرعاية الصحية)، وقاف (منصة ثقافية)، ومزن (خدمات الطقس)، وكاش باك (نظام المكافآت) — كلها تُدار بالتنسيق الدولي للفريق والتسليم الرشيق.",
			featuresEn: [
				"Ensany: Healthcare management & appointment booking",
				"Qaff: Cultural events platform with ticketing",
				"Mozn: Real-time weather forecasting & alerts",
				"Cashback: Rewards engine with merchant partnerships",
				"Unified SSO authentication across all applications",
			],
			featuresAr: [
				"إنساني: إدارة الرعاية الصحية وحجز المواعيد",
				"قاف: منصة الفعاليات الثقافية مع التذاكر",
				"مزن: التنبؤ بالطقس في الوقت الفعلي والتنبيهات",
				"كاش باك: محرك المكافآت مع شراكات التجار",
				"مصادقة SSO موحدة عبر جميع التطبيقات",
			],
			techStack: [
				"Node.js",
				"React",
				"Python",
				"ERPNext",
				"PostgreSQL",
				"Docker",
			],
			year: "2024",
		},
		{
			projectId: "too-bus",
			titleEn: "TOO Bus",
			titleAr: "توو باص",
			categoryEn: "Education",
			categoryAr: "التعليم",
			companyEn: "Gulf Communication",
			companyAr: "خليج للاتصالات",
			descriptionEn:
				"A comprehensive school bus tracking system ensuring student safety through real-time GPS monitoring, automated parent notifications, intelligent route optimization, and driver behavior analytics for educational institutions.",
			descriptionAr:
				"نظام شامل لتتبع حافلات المدارس يضمن سلامة الطلاب من خلال مراقبة GPS في الوقت الفعلي، وإشعارات آلية لأولياء الأمور، وتحسين ذكي للمسارات، وتحليلات سلوك السائقين للمؤسسات التعليمية.",
			featuresEn: [
				"Real-time school bus tracking with live map view",
				"Automated parent notifications for pickup/drop-off",
				"AI-powered route optimization to reduce travel time",
				"Student safety monitoring with attendance verification",
				"Driver behavior scoring & incident alerts",
			],
			featuresAr: [
				"تتبع حافلات المدارس في الوقت الفعلي مع عرض الخريطة المباشر",
				"إشعارات آلية لأولياء الأمور عند الاستلام والتوصيل",
				"تحسين المسارات بالذكاء الاصطناعي لتقليل وقت السفر",
				"مراقبة سلامة الطلاب مع التحقق من الحضور",
				"تقييم سلوك السائق وتنبيهات الحوادث",
			],
			techStack: [
				"Laravel",
				"GoLang",
				"MySQL",
				"GPS Tracking",
				"Firebase",
				"Redis",
			],
			year: "2021–2023",
		},
		{
			projectId: "too-security",
			titleEn: "Too Security",
			titleAr: "توو سيكيوريتي",
			categoryEn: "Security",
			categoryAr: "الأمان",
			companyEn: "Gulf Communication",
			companyAr: "خليج للاتصالات",
			descriptionEn:
				"An enterprise-grade security company management system featuring workforce GPS tracking, automated shift scheduling, comprehensive HR management, and integrated ERP/CRM modules for security operations oversight.",
			descriptionAr:
				"نظام إدارة شركة أمنية على مستوى المؤسسات يتميز بتتبع القوى العاملة عبر GPS، وجدولة الورديات الآلية، وإدارة شاملة للموارد البشرية، ووحدات ERP/CRM متكاملة للإشراف على عمليات الأمن.",
			featuresEn: [
				"Security workforce GPS tracking & patrol verification",
				"Automated shift scheduling with conflict detection",
				"Full HR module: payroll, leaves, performance reviews",
				"ERP & CRM integration for client contract management",
				"Incident reporting with photo evidence & escalation",
			],
			featuresAr: [
				"تتبع القوى الأمنية عبر GPS والتحقق من الدوريات",
				"جدولة الورديات الآلية مع كشف التعارضات",
				"وحدة موارد بشرية كاملة: الرواتب، الإجازات، تقييمات الأداء",
				"تكامل ERP و CRM لإدارة عقود العملاء",
				"التبليغ عن الحوادث مع أدلة صورية والتصعيد",
			],
			techStack: [
				"Laravel",
				"GoLang",
				"PostgreSQL",
				"ERP System",
				"HR Management",
			],
			year: "2021–2023",
		},
		{
			projectId: "ecommerce-solutions",
			titleEn: "E-commerce Solutions",
			titleAr: "حلول التجارة الإلكترونية",
			categoryEn: "E-commerce",
			categoryAr: "التجارة الإلكترونية",
			companyEn: "Rawabet",
			companyAr: "روابط",
			descriptionEn:
				"Comprehensive e-commerce platforms built for multi-vendor marketplaces, featuring integrated ERP systems, CRM solutions, mobile APIs, inventory management, and complete online store administration tools.",
			descriptionAr:
				"منصات تجارة إلكترونية شاملة مبنية لأسواق متعددة البائعين، تتميز بأنظمة ERP متكاملة، وحلول CRM، وواجهات برمجة تطبيقات الجوال، وإدارة المخزون، وأدوات إدارة متجر على الإنترنت كاملة.",
			featuresEn: [
				"Multi-vendor marketplace with vendor dashboards",
				"Integrated ERP for inventory, orders & accounting",
				"Mobile API suite for iOS & Android shopping apps",
				"CRM module for customer segmentation & campaigns",
				"Advanced analytics: sales trends, cart abandonment",
			],
			featuresAr: [
				"سوق متعدد البائعين مع لوحات تحكم للبائعين",
				"ERP متكامل للمخزون والطلبات والمحاسبة",
				"حزمة واجهات برمجة تطبيقات الجوال لتطبيقات التسوق",
				"وحدة CRM لتقسيم العملاء والحملات",
				"تحليلات متقدمة: اتجاهات المبيعات، وتخلي عن سلة التسوق",
			],
			techStack: [
				"Laravel",
				"Vue.js",
				"MySQL",
				"Redis",
				"Stripe",
				"ElasticSearch",
			],
			year: "2020–2021",
		},
		{
			projectId: "learning-platforms",
			titleEn: "Learning Platforms",
			titleAr: "منصات التعلم",
			categoryEn: "Education",
			categoryAr: "التعليم",
			companyEn: "Various Clients",
			companyAr: "عملاء متنوعون",
			descriptionEn:
				"Advanced distance learning platforms supporting live video classes, interactive quizzes, mobile API integrations, NEN certification tracking, and comprehensive educational management for schools and training centers.",
			descriptionAr:
				"منصات تعلم عن بُعد متقدمة تدعم الفصول الدراسية المرئية المباشرة، والاختبارات التفاعلية، وتكامل واجهات برمجة تطبيقات الجوال، وتتبع شهادات NEN، والإدارة التعليمية الشاملة للمدارس ومراكز التدريب.",
			featuresEn: [
				"Live video classrooms with screen sharing & whiteboard",
				"Interactive quizzes with auto-grading & certificates",
				"Mobile apps for iOS & Android with offline content",
				"NEN certification tracking & compliance reporting",
				"LMS dashboard for teachers, students & administrators",
			],
			featuresAr: [
				"فصول دراسية مرئية مباشرة مع مشاركة الشاشة والسبورة",
				"اختبارات تفاعلية مع التصحيح الآلي والشهادات",
				"تطبيقات جوال لـ iOS و Android مع محتوى بدون إنترنت",
				"تتبع شهادات NEN وتقارير الامتثال",
				"لوحة تحكم LMS للمعلمين والطلاب والإداريين",
			],
			techStack: ["Laravel", "Vue.js", "Python", "WebRTC", "AWS", "MongoDB"],
			year: "2018–2020",
		},
	];

	await db.insert(projects).values(projectsData);
	console.log(`Projects seeded: ${projectsData.length} records`);
}

async function seedExperience() {
	console.log("Seeding experience...");

	const experienceData = [
		{
			periodEn: "Sep 2025 – Present",
			periodAr: "سبتمبر 2025 – الحاضر",
			companyEn: "backstoreEIT",
			companyAr: "باك ستور EIT",
			roleEn: "Senior Full Stack Developer (ASP.NET Core) & Team Leader",
			roleAr: "مطور Full Stack أول (ASP.NET Core) وقائد فريق",
			descriptionEn:
				"Leading full-stack development on enterprise projects including EDE and SDDUMP in the UAE. Responsible for technical architecture, team mentorship, code review processes, and delivering scalable applications serving thousands of concurrent users.",
			descriptionAr:
				"قيادة التطوير الكامل في مشاريع المؤسسات بما في ذلك EDE و SDDUMP في الإمارات. المسؤول عن الهندسة المعمارية التقنية، وإرشاد الفريق، وعمليات مراجعة الكود، وتسليم تطبيقات قابلة للتطوير تخدم آلاف المستخدمين المتزامنين.",
			tech: [
				"ASP.NET Core",
				"C#",
				"Entity Framework",
				"Azure",
				"SQL Server",
				"Team Leadership",
			],
			current: true,
		},
		{
			periodEn: "2024 – 2025",
			periodAr: "2024 – 2025",
			companyEn: "Mugsult",
			companyAr: "مجسلت",
			roleEn: "Senior Full Stack Developer & Team Leader",
			roleAr: "مطور Full Stack أول وقائد فريق",
			descriptionEn:
				"Led the development of Team1, a critical emergency transportation platform. Managed a cross-functional team of 8 developers, implemented real-time dispatch algorithms, and established CI/CD pipelines for rapid, reliable deployments.",
			descriptionAr:
				"قيادة تطوير Team1، منصة نقل طوارئ حرجة. إدارة فريق متعدد التخصصات من 8 مطورين، وتنفيذ خوارزميات الإرسال في الوقت الفعلي، وإنشاء خطوط CI/CD للنشر السريع والموثوق.",
			tech: [
				"Laravel",
				"Node.js",
				"GoLang",
				"MySQL",
				"Redis",
				"Docker",
				"Team Leadership",
			],
			current: false,
		},
		{
			periodEn: "2024",
			periodAr: "2024",
			companyEn: "Code700 (Riyadh, KSA)",
			companyAr: "Code700 (الرياض، المملكة العربية السعودية)",
			roleEn: "Senior Developer & Team Leader",
			roleAr: "مطور أول وقائد فريق",
			descriptionEn:
				"Spearheaded multi-application development for the Saudi market (Ensany, Qaff, Mozn, Cashback). Coordinated an international team across 3 time zones, implemented microservices architecture, and delivered all projects ahead of schedule.",
			descriptionAr:
				"قيادة تطوير تطبيقات متعددة لسوق المملكة العربية السعودية (إنساني، قاف، مزن، كاش باك). تنسيق فريق دولي عبر 3 مناطق زمنية، وتنفيذ هندسة الخدمات المصغرة، وتسليم جميع المشاريع قبل الموعد المحدد.",
			tech: [
				"Node.js",
				"React",
				"Python",
				"ERPNext",
				"PostgreSQL",
				"Kubernetes",
			],
			current: false,
		},
		{
			periodEn: "2023 – 2024",
			periodAr: "2023 – 2024",
			companyEn: "Enjoy Driving",
			companyAr: "إنجوي درايفينج",
			roleEn: "Senior Full Stack Developer & Team Leader",
			roleAr: "مطور Full Stack أول وقائد فريق",
			descriptionEn:
				"Led a development team of 6 engineers building driver applications, agent management systems, and store operations platforms. Focused on UX optimization, performance tuning, and establishing engineering best practices.",
			descriptionAr:
				"قيادة فريق تطوير من 6 مهندسين لبناء تطبيقات السائقين، وأنظمة إدارة الوكلاء، ومنصات عمليات المتاجر. التركيز على تحسين تجربة المستخدم، وضبط الأداء، وإنشاء أفضل الممارسات الهندسية.",
			tech: [
				"Laravel",
				"Vue.js",
				"MySQL",
				"Redis",
				"WebSocket",
				"Team Management",
			],
			current: false,
		},
		{
			periodEn: "2021 – 2023",
			periodAr: "2021 – 2023",
			companyEn: "Gulf Communication Company",
			companyAr: "شركة خليج للاتصالات",
			roleEn: "Full Stack Developer",
			roleAr: "مطور Full Stack",
			descriptionEn:
				"Developed and maintained multiple high-impact applications: TOO APP (ride-hailing), TOO Bus (school tracking), Mappy (navigation), Too Medical (rep management), and Too Security (workforce management). Contributed to architecture decisions and mentored junior developers.",
			descriptionAr:
				"تطوير وصيانة تطبيقات عالية التأثير متعددة: TOO APP (حجز الرحلات)، و TOO Bus (تتبع المدارس)، و Mappy (الملاحة)، و Too Medical (إدارة المندوبين)، و Too Security (إدارة القوى العاملة). المساهمة في قرارات الهندسة المعمارية وإرشاد المطورين المبتدئين.",
			tech: [
				"Laravel",
				"GoLang",
				"ASP.NET",
				"PostgreSQL",
				"MySQL",
				"Redis",
				"Docker",
			],
			current: false,
		},
		{
			periodEn: "2020 – 2021",
			periodAr: "2020 – 2021",
			companyEn: "Rawabet Company",
			companyAr: "شركة روابط",
			roleEn: "Full Stack Developer",
			roleAr: "مطور Full Stack",
			descriptionEn:
				"Built comprehensive e-commerce platforms with integrated ERP systems, CRM solutions, and mobile APIs. Specialized in inventory synchronization, payment gateway integrations, and real-time order tracking for online retailers.",
			descriptionAr:
				"بناء منصات تجارة إلكترونية شاملة مع أنظمة ERP متكاملة، وحلول CRM، وواجهات برمجة تطبيقات الجوال. تخصص في مزامنة المخزون، وتكامل بوابات الدفع، وتتبع الطلبات في الوقت الفعلي لتجار التجزئة عبر الإنترنت.",
			tech: [
				"PHP",
				"Laravel",
				"Vue.js",
				"MySQL",
				"ERP",
				"Stripe",
				"ElasticSearch",
			],
			current: false,
		},
		{
			periodEn: "2018 – 2020",
			periodAr: "2018 – 2020",
			companyEn: "Various Companies",
			companyAr: "شركات متنوعة",
			roleEn: "Full Stack Developer",
			roleAr: "مطور Full Stack",
			descriptionEn:
				"Started with distance learning platforms and e-commerce solutions, then specialized in payment gateway integrations including Fawry, Paymob, and PayPal. Gained deep expertise in financial transaction security and reconciliation processes.",
			descriptionAr:
				"بدأت مع منصات التعلم عن بُعد وحلول التجارة الإلكترونية، ثم تخصصت في تكامل بوابات الدفع بما في ذلك فوري، وبايموب، وباي بال. اكتساب خبرة عميقة في أمن المعاملات المالية وعمليات التسوية.",
			tech: [
				"PHP",
				"Vue.js",
				"Payment Gateways",
				"MySQL",
				"Redis",
				"WebSocket",
			],
			current: false,
		},
		{
			periodEn: "2017",
			periodAr: "2017",
			companyEn: "Self-taught",
			companyAr: "تعلم ذاتي",
			roleEn: "Foundation Phase",
			roleAr: "مرحلة الأساس",
			descriptionEn:
				"Began programming journey with C++ fundamentals, then transitioned to web development mastering HTML5, CSS3, and JavaScript. Built personal projects and contributed to open-source to solidify understanding of software engineering principles.",
			descriptionAr:
				"بدأت رحلة البرمجة مع أساسيات C++، ثم انتقلت إلى تطوير الويب بإتقان HTML5 و CSS3 و JavaScript. بنيت مشاريع شخصية وساهمت في المصادر المفتوحة لتعزيز فهم مبادئ هندسة البرمجيات.",
			tech: ["C++", "HTML5", "CSS3", "JavaScript", "Git"],
			current: false,
		},
	];

	await db.insert(experience).values(experienceData);
	console.log(`Experience seeded: ${experienceData.length} records`);
}

async function seedIndustries() {
	console.log("Seeding industries...");

	const industriesData = [
		{
			industryId: "transportation",
			nameEn: "Transportation",
			nameAr: "النقل",
			descriptionEn:
				"Logistics, fleet management, and real-time tracking solutions for transportation businesses. Includes ride-hailing, delivery, and public transit systems.",
			descriptionAr:
				"الخدمات اللوجستية، وإدارة الأسطول، وحلول التتبع في الوقت الفعلي لشركات النقل. تشمل حجز الرحلات، والتوصيل، وأنظمة النقل العام.",
		},
		{
			industryId: "healthcare",
			nameEn: "Healthcare",
			nameAr: "الرعاية الصحية",
			descriptionEn:
				"Medical platforms, emergency services, and healthcare management systems. Covers patient tracking, telemedicine, and hospital coordination.",
			descriptionAr:
				"المنصات الطبية، وخدمات الطوارئ، وأنظمة إدارة الرعاية الصحية. تغطي تتبع المرضى، والطب عن بُعد، والتنسيق المستشفياتي.",
		},
		{
			industryId: "fintech",
			nameEn: "FinTech",
			nameAr: "التكنولوجيا المالية",
			descriptionEn:
				"Payment processing, financial platforms, and transaction management solutions. Includes digital wallets, banking APIs, and fraud detection.",
			descriptionAr:
				"معالجة الدفع، والمنصات المالية، وحلول إدارة المعاملات. تشمل المحافظ الرقمية، وواجهات برمجة التطبيقات المصرفية، والكشف عن الاحتيال.",
		},
		{
			industryId: "ecommerce",
			nameEn: "E-commerce",
			nameAr: "التجارة الإلكترونية",
			descriptionEn:
				"Online retail platforms, inventory systems, and digital marketplace solutions. Covers multi-vendor stores, B2B portals, and mobile commerce.",
			descriptionAr:
				"منصات البيع بالتجزئة عبر الإنترنت، وأنظمة المخزون، وحلول السوق الرقمية. تشمل المتاجر متعددة البائعين، وبوابات B2B، والتجارة عبر الجوال.",
		},
		{
			industryId: "security",
			nameEn: "Security",
			nameAr: "الأمان",
			descriptionEn:
				"Security services management, monitoring systems, and incident response platforms. Includes workforce tracking, patrol verification, and access control.",
			descriptionAr:
				"إدارة خدمات الأمن، وأنظمة المراقبة، ومنصات الاستجابة للحوادث. تشمل تتبع القوى العاملة، والتحقق من الدوريات، ومراقبة الدخول.",
		},
		{
			industryId: "education",
			nameEn: "Education",
			nameAr: "التعليم",
			descriptionEn:
				"Learning management systems, educational platforms, and online course solutions. Covers virtual classrooms, certification tracking, and student analytics.",
			descriptionAr:
				"أنظمة إدارة التعلم، والمنصات التعليمية، وحلول الدورات عبر الإنترنت. تشمل الفصول الافتراضية، وتتبع الشهادات، وتحليلات الطلاب.",
		},
	];

	await db.insert(industries).values(industriesData);
	console.log(`Industries seeded: ${industriesData.length} records`);
}

async function seed() {
	console.log("============================================");
	console.log("   Database Seeding Started");
	console.log("============================================");

	try {
		await clearTables();
		await seedProfile();
		await seedSkills();
		await seedSkillSpecializations();
		await seedProjectCategories();
		await seedProjects();
		await seedExperience();
		await seedIndustries();

		console.log("============================================");
		console.log("   Database Seeding Completed Successfully!");
		console.log("============================================");
	} catch (error) {
		console.error("============================================");
		console.error("   Seeding Failed!");
		console.error("============================================");
		console.error(error);
		process.exit(1);
	}
}

seed();
