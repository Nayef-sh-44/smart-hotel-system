const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, PageBreak } = require('docx');

const doc = new Document({
  creator: "HotelLink Team",
  title: "FINAL GRADUATION THESIS",
  description: "HotelLink Application Report",
  styles: {
    default: {
      heading1: { run: { size: 32, bold: true, font: 'Arial' }, paragraph: { alignment: AlignmentType.CENTER, spacing: { before: 240, after: 120 } } },
      heading2: { run: { size: 28, bold: true, font: 'Arial' }, paragraph: { alignment: AlignmentType.RIGHT, spacing: { before: 240, after: 120 } } },
      document: { run: { size: 24, font: 'Arial', rightToLeft: true }, paragraph: { alignment: AlignmentType.RIGHT, spacing: { after: 120, line: 360 } } }
    }
  },
  sections: [
    // 1. Cover Page
    {
      properties: {},
      children: [
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "الجمهورية العربية السورية", bold: true, size: 32, rightToLeft: true })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "جامعة أنطاكية السورية الخاصة", bold: true, size: 32, rightToLeft: true })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "كلية الهندسة – قسم هندسة الحواسيب", bold: true, size: 32, rightToLeft: true })] }),
        new Paragraph({ text: "", spacing: { after: 1440 } }),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "مشروع تخرج أعد لنيل الإجازة في هندسة الحواسيب", bold: true, size: 36, rightToLeft: true })] }),
        new Paragraph({ text: "", spacing: { after: 1440 } }),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'HotelLink: تطبيق هوتلَ لينك لتنظيم عروض الفنادق و الرحلات', bold: true, size: 36, rightToLeft: true })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'HotelLink: A HotelLink Application for Organizing Hotel Offers and Trips', bold: true, size: 32 })] }),
        new Paragraph({ text: "", spacing: { after: 1440 } }),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "إعداد الطلاب", bold: true, size: 32, rightToLeft: true })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "[أدخل أسماء الطلاب هنا]", size: 28, rightToLeft: true })] }),
        new Paragraph({ text: "", spacing: { after: 720 } }),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "إشراف", bold: true, size: 32, rightToLeft: true })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "[أدخل اسم المشرف هنا]", size: 28, rightToLeft: true })] }),
        new Paragraph({ text: "", spacing: { after: 1440 } }),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "العام الدراسي: 2025-2026", bold: true, size: 28, rightToLeft: true })] }),
      ],
    },
    // 2. Blank Page
    {
      properties: { type: 'continuous' },
      children: [
        new Paragraph({ children: [new PageBreak()] }),
        new Paragraph({ text: "" }),
      ]
    },
    // 3. Dedication
    {
      properties: { page: { margin: { top: 1440 } } },
      children: [
        new Paragraph({ text: "الإهداء", heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER }),
        new Paragraph({ text: "إلى من مهدوا لنا طريق العلم، وإلى كل من ساهم في إنجاز هذا العمل.", rightToLeft: true, alignment: AlignmentType.CENTER }),
      ],
    },
    // 4. Arabic Abstract
    {
      properties: { page: { margin: { top: 1440 } } },
      children: [
        new Paragraph({ text: "الملخص", heading: HeadingLevel.HEADING_1 }),
        new Paragraph({ text: "يتناول هذا المشروع تصميم وتطوير تطبيق \"HotelLink\"، وهو منصة ذكية لحجز الفنادق وتنظيم الرحلات السياحية. يهدف المشروع إلى تقديم حل شامل للمستخدمين للبحث عن الفنادق، مقارنة أسعارها، والاستفادة من نظام تسعير ديناميكي وعروض فورية، بالإضافة إلى بناء خطة رحلة كاملة مع حساب التكاليف التقريبية. يعتمد النظام على معمارية حديثة باستخدام Node.js و Express في الواجهة الخلفية، وقاعدة بيانات Microsoft SQL Server، بينما تم بناء الواجهة الأمامية باستخدام React و Tailwind CSS.", rightToLeft: true }),
        new Paragraph({ text: "يتميز التطبيق بنظام توصية ذكي يقترح الفنادق بناءً على تفضيلات المستخدم (مثل السعر، التقييم، والمرافق)، ونظام ولاء ومكافآت، بالإضافة إلى لوحة تحكم متقدمة لمديري الفنادق لمراقبة الأداء ومقارنته مع المنافسين. أثبتت نتائج الاختبار كفاءة النظام في التعامل مع عدد كبير من الفنادق (أكثر من 480 فندقاً في 20 مدينة) وتقديم أداء سريع وموثوق.", rightToLeft: true }),
        new Paragraph({ text: "الكلمات المفتاحية: حجز فنادق، تنظيم رحلات، تسعير ديناميكي، نظام توصية، React، Node.js.", rightToLeft: true, bold: true }),
      ],
    },
    // 5. English Abstract
    {
      properties: { page: { margin: { top: 1440 } } },
      children: [
        new Paragraph({ text: "Abstract", heading: HeadingLevel.HEADING_1 }),
        new Paragraph({ text: "This project involves the design and development of \"HotelLink\", a smart application for hotel booking and trip organization. The project aims to provide a comprehensive solution for users to search for hotels, compare prices, and benefit from a dynamic pricing system and flash deals, in addition to building a complete trip plan with estimated costs. The system relies on a modern architecture using Node.js and Express in the backend, a Microsoft SQL Server database, while the frontend is built using React and Tailwind CSS.", rightToLeft: false }),
        new Paragraph({ text: "The application features a smart recommendation system that suggests hotels based on user preferences, a loyalty and rewards program, as well as an advanced dashboard for hotel managers to monitor performance and benchmark against competitors. Testing results demonstrated the system's efficiency in handling a large number of hotels (over 480 hotels in 20 cities) and delivering fast, reliable performance.", rightToLeft: false }),
        new Paragraph({ text: "Keywords: Hotel Booking, Trip Planning, Dynamic Pricing, Recommendation System, React, Node.js.", rightToLeft: false, bold: true }),
      ],
    },
    // 6. Table of Contents
    {
      properties: { page: { margin: { top: 1440 } } },
      children: [
        new Paragraph({ text: "الفهرس", heading: HeadingLevel.HEADING_1 }),
        new Paragraph({ text: "[سيتم إدراج جدول المحتويات هنا باستخدام ميزات معالج النصوص]", rightToLeft: true }),
      ],
    },
    // 7. List/Table of Terms
    {
      properties: { page: { margin: { top: 1440 } } },
      children: [
        new Paragraph({ text: "جدول المصطلحات", heading: HeadingLevel.HEADING_1 }),
        new Paragraph({ text: "- React: مكتبة جافاسكريبت لبناء واجهات المستخدم.", rightToLeft: true }),
        new Paragraph({ text: "- Node.js: بيئة تشغيل جافاسكريبت للواجهة الخلفية.", rightToLeft: true }),
        new Paragraph({ text: "- SQL Server: نظام إدارة قواعد البيانات العلائقية من مايكروسوفت.", rightToLeft: true }),
        new Paragraph({ text: "- JWT (JSON Web Token): معيار مفتوح لمشاركة بيانات الأمان والمصادقة بشكل موثوق.", rightToLeft: true }),
        new Paragraph({ text: "- Dynamic Pricing: التسعير الديناميكي لتغيير الأسعار بناءً على الطلب والمواسم.", rightToLeft: true }),
      ],
    },
    // 8. List of Figures
    {
      properties: { page: { margin: { top: 1440 } } },
      children: [
        new Paragraph({ text: "فهرس الأشكال", heading: HeadingLevel.HEADING_1 }),
        new Paragraph({ text: "[سيتم إدراج قائمة الأشكال المدرجة في التقرير هنا]", rightToLeft: true }),
      ],
    },
    // 9. General Introduction
    {
      properties: { page: { margin: { top: 1440 } } },
      children: [
        new Paragraph({ text: "مقدمة عامة", heading: HeadingLevel.HEADING_1 }),
        new Paragraph({ text: "في ظل التطور التكنولوجي المتسارع والاعتماد المتزايد على الإنترنت في تخطيط السفر، تبرز الحاجة إلى منصات متكاملة لا تقتصر على حجز الغرف الفندقية فقط، بل تمتد لتشمل تخطيط الرحلات بالكامل. يهدف هذا المشروع إلى سد هذه الفجوة من خلال تقديم نظام متكامل يوفر تجربة مستخدم سلسة وغنية بالميزات الذكية مثل التوصية المخصصة والتسعير الديناميكي.", rightToLeft: true }),
      ],
    },
    // 10. Project Objectives
    {
      properties: { page: { margin: { top: 1440 } } },
      children: [
        new Paragraph({ text: "الهدف من المشروع", heading: HeadingLevel.HEADING_1 }),
        new Paragraph({ text: "1. تطوير منصة ويب متكاملة لحجز الفنادق (Hotel Booking).\n2. توفير أداة لتخطيط الرحلات (Trip Plan) وحساب التكاليف التقريبية (الإقامة، المواصلات، الطعام).\n3. بناء نظام تسعير ديناميكي (Dynamic Pricing) يعتمد على المواسم، أيام الأسبوع، والطلب.\n4. تقديم نظام توصية ذكي يطابق تفضيلات المستخدم مع الفنادق المتاحة عبر مرشحات متقدمة.\n5. توفير لوحة تحكم شاملة لمديري الفنادق (Manager Portal) لإدارة الغرف، العروض الفورية، وبرنامج الولاء، مع ميزة مقارنة الأداء (Competitor Benchmarking).", rightToLeft: true }),
      ],
    },
    // 11. Literature Review
    {
      properties: { page: { margin: { top: 1440 } } },
      children: [
        new Paragraph({ text: "الدراسة المرجعية والأعمال السابقة", heading: HeadingLevel.HEADING_1 }),
        new Paragraph({ text: "توجد العديد من المنصات العالمية لحجز الفنادق مثل Booking.com و Agoda. تركز هذه المنصات بشكل أساسي على الحجز والمراجعات وتقييمات العملاء. بالمقارنة مع هذه الأنظمة التقليدية، يضيف تطبيق HotelLink ميزات متخصصة مثل التخطيط المتكامل للرحلة (Trip Planning) الذي يتيح للمستخدم إضافة مدن متعددة وحساب ميزانية يومية تقديرية للرحلة ككل. بالإضافة إلى ذلك، يقدم النظام لوحة أداء ذكية لمدير الفندق تتيح له مقارنة أسعاره وإشغاله مع السوق المحلي، وهي ميزات نادراً ما تتوفر في منصة واحدة مجتمعة.", rightToLeft: true }),
      ],
    },
    // 12. Analysis
    {
      properties: { page: { margin: { top: 1440 } } },
      children: [
        new Paragraph({ text: "التحليل", heading: HeadingLevel.HEADING_1 }),
        new Paragraph({ text: "تم تحليل متطلبات النظام لمعالجة الصعوبات التي يواجهها المسافرون في تجميع حجوزاتهم وتوقع التكاليف. تم استنتاج المتطلبات التالية:", rightToLeft: true }),
        new Paragraph({ text: "- المتطلبات الوظيفية: محرك بحث ذكي للغرف، فلاتر متقدمة (السعر، التقييم، المرافق)، نظام العروض الفورية (Flash Deals)، نظام حساب التكلفة الكلية للرحلة (الفندق، المواصلات، الطعام)، إدارة حسابات وبرامج ولاء، نظام تقييم بعد الحجز.", rightToLeft: true }),
        new Paragraph({ text: "- المتطلبات غير الوظيفية: أمان البيانات، الأداء العالي لتسريع البحث في قواعد بيانات الفنادق، إمكانية التوسع (Scalability) عبر بنية الحاويات (Docker).", rightToLeft: true }),
        new Paragraph({ text: "- أدوار المستخدمين: زائر (Guest) يمكنه البحث، مستخدم مسجل (Customer) يمكنه الحجز والتخطيط، مدير فندق (Hotel Manager) يدير فندقاً واحداً، ومدير نظام (Admin) للإشراف العام.", rightToLeft: true }),
      ],
    },
    // 13. System Design and Hierarchy
    {
      properties: { page: { margin: { top: 1440 } } },
      children: [
        new Paragraph({ text: "التصميم وهرمية النظام", heading: HeadingLevel.HEADING_1 }),
        new Paragraph({ text: "يتكون النظام من ثلاث طبقات رئيسية (Three-Tier Architecture):", rightToLeft: true }),
        new Paragraph({ text: "1. واجهة المستخدم (Frontend): تعتمد على React لإنشاء صفحات ديناميكية بنظام المكونات (Components)، مع تنسيقات Tailwind CSS. يتم نقل البيانات عبر واجهات API.", rightToLeft: true }),
        new Paragraph({ text: "2. الواجهة الخلفية (Backend): بيئة Node.js مع إطار عمل Express، حيث تتم معالجة طلبات البحث، التسعير، الحجز، والمصادقة.", rightToLeft: true }),
        new Paragraph({ text: "3. طبقة البيانات (Database): قاعدة بيانات Microsoft SQL Server تستخدم Sequelize كـ ORM لإدارة العلاقات بفعالية بين الكيانات (مثل المستخدمين، الفنادق، الغرف، المراجعات، العروض الفورية، وبرنامج الولاء).", rightToLeft: true }),
        new Paragraph({ text: "[إدراج شكل: مخطط معمارية النظام العام]", rightToLeft: true, bold: true, alignment: AlignmentType.CENTER }),
        new Paragraph({ text: "[إدراج شكل: مخطط الكيانات والعلاقات ERD]", rightToLeft: true, bold: true, alignment: AlignmentType.CENTER }),
      ],
    },
    // 14. Implementation
    {
      properties: { page: { margin: { top: 1440 } } },
      children: [
        new Paragraph({ text: "التنفيذ", heading: HeadingLevel.HEADING_1 }),
        new Paragraph({ text: "المصادقة والأمان: تم تطبيق المصادقة باستخدام JSON Web Tokens (JWT) والتحقق من الأدوار (Role-based Authorization) في مسارات (Routes) الواجهة الخلفية. تُشفر كلمات المرور باستخدام bcrypt.", rightToLeft: true }),
        
        new Paragraph({ text: "إدارة الفنادق والغرف:", heading: HeadingLevel.HEADING_2 }),
        new Paragraph({ text: "يُدير كل مدير فندقه المخصص له. يمكنه تحديث الصور (يتم تخزينها وتقديمها عبر مسارات ثابتة)، وإضافة أنواع غرف بأسعار أساسية (بالدولار الأمريكي USD)، مع إدارة المرافق المتاحة.", rightToLeft: true }),
        
        new Paragraph({ text: "نظام البحث والتوصية:", heading: HeadingLevel.HEADING_2 }),
        new Paragraph({ text: "يُنفذ النظام بحثاً أولياً (Hard Filters) لتحديد الفنادق التي تمتلك غرفاً شاغرة وتطابق الموقع والتواريخ المحددة. ثم تطبق خوارزمية التوصية ترتيباً للمقترحات بناءً على تقييمات الفندق، السعر، والمرافق المفضلة لدى المستخدم.", rightToLeft: true }),
        
        new Paragraph({ text: "التسعير الديناميكي (Dynamic Pricing):", heading: HeadingLevel.HEADING_2 }),
        new Paragraph({ text: "يعتمد تسعير الغرفة في النظام على خط أنابيب (Pricing Pipeline) حقيقي: السعر الأساسي للغرفة يُعدّل وفق قواعد التسعير الديناميكي (حسب الموسم والطلب)، ثم يُطرح منه العرض الفوري (Flash Deal) في حال وجوده ضمن المدة الزمنية المحددة، يليه تطبيق خصم درجة الولاء (Loyalty Tier)، وأخيراً إضافة ضريبة 3%.", rightToLeft: true }),
        
        new Paragraph({ text: "تخطيط الرحلات (Trip Plan):", heading: HeadingLevel.HEADING_2 }),
        new Paragraph({ text: "ميزة تتيح بناء مسار الرحلة واختيار تواريخ وغرف معينة لكل مدينة. يتكفل النظام بحساب التكاليف الإجمالية مضافاً إليها تكلفة تقديرية يومية للطعام والمواصلات للمدينة المقصودة. أخيراً، يمكن للمستخدم تحميل تقرير بصيغة PDF وتأكيد الحجوزات المخططة.", rightToLeft: true }),
      ],
    },
    // 15. Testing
    {
      properties: { page: { margin: { top: 1440 } } },
      children: [
        new Paragraph({ text: "الاختبارات", heading: HeadingLevel.HEADING_1 }),
        new Paragraph({ text: "لتأكيد موثوقية التطبيق، تم إجراء السيناريوهات التالية:", rightToLeft: true }),
        new Paragraph({ text: "- اختبارات الأدوار (Roles): التأكد من عدم قدرة العميل العادي على الدخول للوحة إدارة الفنادق (Manager Portal) وعدم قدرة المدير على إدارة فنادق لا تخصه.", rightToLeft: true }),
        new Paragraph({ text: "- اختبار البحث والتصفية: التحقق من دقة النتائج عند التصفية بالسعر، وعدد النجوم، والخدمات.", rightToLeft: true }),
        new Paragraph({ text: "- اختبار الحجز (Booking): محاكاة إتمام الحجز واقتطاع الغرف المحجوزة من العدد الإجمالي المتوفر في الفندق لضمان التزامن.", rightToLeft: true }),
        new Paragraph({ text: "- اختبار التسعير الديناميكي: محاكاة حساب السعر الكلي مع وجود عرض فوري ومكافأة ولاء بنسبة محددة للتأكد من حساب المبلغ بدقة في الفاتورة النهائية.", rightToLeft: true }),
      ],
    },
    // 16. Results
    {
      properties: { page: { margin: { top: 1440 } } },
      children: [
        new Paragraph({ text: "النتيجة", heading: HeadingLevel.HEADING_1 }),
        new Paragraph({ text: "تم نشر التطبيق واختباره بنجاح ببيانات حقيقية (أكثر من 480 فندق حقيقي في 20 مدينة حول العالم). أظهرت النتائج استجابة سريعة جداً لواجهة المستخدم بفضل React وواجهات برمجة التطبيقات (APIs) المخصصة. نظام التسعير الديناميكي عمل بدقة وعكس الأسعار الصحيحة للمستخدم النهائي قبل الدفع. أثبتت لوحة المدير فعاليتها في عرض إحصائيات الإشغال اليومي. الخرائط (Maps) التي دُمجت لعرض الفنادق القريبة أضافت قيمة عملية لتجربة الاستخدام.", rightToLeft: true }),
        new Paragraph({ text: "[إدراج لقطة شاشة: الصفحة الرئيسية ونتائج البحث]", rightToLeft: true, bold: true, alignment: AlignmentType.CENTER }),
        new Paragraph({ text: "[إدراج لقطة شاشة: تفاصيل الفندق وصفحة الحجز]", rightToLeft: true, bold: true, alignment: AlignmentType.CENTER }),
        new Paragraph({ text: "[إدراج لقطة شاشة: أداة تخطيط الرحلات Trip Plan]", rightToLeft: true, bold: true, alignment: AlignmentType.CENTER }),
        new Paragraph({ text: "[إدراج لقطة شاشة: لوحة تحكم مدير الفندق]", rightToLeft: true, bold: true, alignment: AlignmentType.CENTER }),
      ],
    },
    // 17. Conclusion
    {
      properties: { page: { margin: { top: 1440 } } },
      children: [
        new Paragraph({ text: "الخاتمة", heading: HeadingLevel.HEADING_1 }),
        new Paragraph({ text: "يمثل مشروع HotelLink خطوة متقدمة في مجال تطبيقات السفر، حيث يتخطى مفهوم الحجز الفندقي البسيط ليصبح مساعداً شخصياً لتنظيم الرحلات وحساب التكاليف. دمج تقنيات حديثة مثل React و Node.js ضمن بنية Docker، وتطبيق مفاهيم التسعير الديناميكي والتوصية الذكية، أثبت القدرة على بناء منصة منافسة وقابلة للتطوير لتشمل خدمات سياحية أخرى في المستقبل.", rightToLeft: true }),
      ],
    },
    // 18. References
    {
      properties: { page: { margin: { top: 1440 } } },
      children: [
        new Paragraph({ text: "المراجع", heading: HeadingLevel.HEADING_1 }),
        new Paragraph({ text: "[1] Node.js Foundation. (2025). Node.js Official Documentation. Retrieved from https://nodejs.org", rightToLeft: false }),
        new Paragraph({ text: "[2] Meta Platforms, Inc. (2025). React - A JavaScript library for building user interfaces. Retrieved from https://reactjs.org", rightToLeft: false }),
        new Paragraph({ text: "[3] Sequelize Contributors. (2025). Sequelize: Feature-rich ORM for modern Node.js. Retrieved from https://sequelize.org", rightToLeft: false }),
        new Paragraph({ text: "[4] Microsoft. (2025). Microsoft SQL Server Documentation. Retrieved from https://docs.microsoft.com/en-us/sql/", rightToLeft: false }),
        new Paragraph({ text: "[5] Tailwind Labs. (2025). Tailwind CSS Framework. Retrieved from https://tailwindcss.com", rightToLeft: false }),
        new Paragraph({ text: "[6] Auth0. (2025). JSON Web Tokens Introduction. Retrieved from https://jwt.io/introduction", rightToLeft: false }),
        new Paragraph({ text: "[7] Docker Inc. (2025). Docker Compose Documentation. Retrieved from https://docs.docker.com/compose/", rightToLeft: false }),
      ],
    }
  ]
});

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync("FINAL_REPORT.docx", buffer);
  console.log("Document FINAL_REPORT.docx created successfully.");
}).catch((err) => {
  console.error(err);
});
