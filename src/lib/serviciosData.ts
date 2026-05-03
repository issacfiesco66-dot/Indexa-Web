export interface ServicioBenefit {
  titulo: string;
  descripcion: string;
  icon: "rocket" | "chart" | "magic" | "shield" | "bolt" | "target" | "clock" | "users" | "money" | "growth";
}

export interface ServicioFeature {
  titulo: string;
  descripcion: string;
}

export interface ServicioStat {
  valor: string;
  label: string;
  sublabel?: string;
}

export interface ServicioFAQ {
  pregunta: string;
  respuesta: string;
}

export interface ServicioMetric {
  label: string;
  before: string;
  after: string;
  delta: string;
}

export interface Servicio {
  slug: string;
  // SEO
  seoTitle: string; // <title> – include "México" + intent
  seoDescription: string; // <meta description>
  seoKeywords: string[]; // long-tail commercial intent keywords
  serviceType: string; // schema.org Service.serviceType (broad category)
  audienceType: string; // who it serves
  // Card on home
  cardTitle: string;
  cardDescription: string;
  cardGradient: string;
  cardBg: string;
  cardIconPath: string;
  cardAccent: string; // hex / tailwind class for accent

  // Detail page
  heroBadge: string;
  heroTitle: string;
  heroHighlight: string;
  heroAfterHighlight?: string;
  heroSubtitle: string;
  heroPitch: string; // strong promise
  heroVisual:
    | "websiteOrbit"
    | "adsRadar"
    | "seoDataFlow"
    | "analyticsPulse"
    | "chatbotNetwork"
    | "automationMesh";
  primaryColor: string; // hex
  secondaryColor: string; // hex

  promiseStrip: string; // 1-line bold promise

  whatItDoes: {
    titulo: string;
    descripcion: string;
    items: ServicioFeature[];
  };

  benefits: ServicioBenefit[];

  process: {
    titulo: string;
    pasos: { numero: string; titulo: string; descripcion: string }[];
  };

  metrics?: ServicioMetric[]; // before/after metrics

  stats: ServicioStat[];

  whoIsItFor: {
    titulo: string;
    items: string[];
  };

  faq: ServicioFAQ[];

  ctaTitle: string;
  ctaSubtitle: string;
}

export const servicios: Servicio[] = [
  // ─────────────────────────────────────────────────────────────────
  {
    slug: "sitios-web-ia",
    seoTitle: "Páginas Web con IA para PYMES en México | Sitios que Convierten",
    seoDescription:
      "Crea tu página web profesional con inteligencia artificial en menos de 3 minutos. Diseñada para convertir visitas en clientes vía WhatsApp. Para negocios en México desde $299/mes. 14 días gratis.",
    seoKeywords: [
      "página web pyme méxico",
      "crear página web con inteligencia artificial",
      "sitio web profesional para negocio",
      "página web con whatsapp integrado",
      "diseño web pyme méxico",
      "página web automática con IA",
      "crear sitio web sin programar",
      "página web para pequeño negocio",
    ],
    serviceType: "Diseño y desarrollo de páginas web con IA para PYMES",
    audienceType: "Pequeñas y medianas empresas en México que buscan presencia digital profesional",
    cardTitle: "Sitios Web con IA",
    cardDescription:
      "No solo te hacemos una web bonita: te construimos una máquina de captar clientes 24/7. Diseño inteligente que convierte visitas en ventas.",
    cardGradient: "from-blue-500 to-cyan-400",
    cardBg: "bg-blue-500/10",
    cardIconPath:
      "M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5a17.92 17.92 0 0 1-8.716-2.247m0 0A8.966 8.966 0 0 1 3 12c0-1.264.26-2.467.73-3.418",
    cardAccent: "#00b4ff",
    heroBadge: "Sitios Web con IA",
    heroTitle: "Tu sitio web no debería verse bonito.",
    heroHighlight: "Debería vender por ti.",
    heroSubtitle:
      "Generamos tu sitio web profesional en menos de 3 minutos con inteligencia artificial. No es plantilla genérica: es una landing pensada para que la persona que entra termine escribiéndote por WhatsApp.",
    heroPitch:
      "Tienes una web hace años y nunca te ha llegado un cliente por ahí. Eso no es tu culpa: te vendieron una página, no una máquina de conversión. Lo arreglamos.",
    heroVisual: "websiteOrbit",
    primaryColor: "#00b4ff",
    secondaryColor: "#0066ff",
    promiseStrip:
      "Cada visitante que entra ve una sola cosa: un motivo claro para escribirte hoy.",
    whatItDoes: {
      titulo: "Lo que hacemos exactamente",
      descripcion:
        "No es un constructor genérico. Es un sitio diseñado pieza por pieza para tu giro, tu ciudad y el cliente que tú quieres atraer.",
      items: [
        {
          titulo: "Copy persuasivo escrito por IA experta en conversión",
          descripcion:
            "Cada texto está pensado para responder la pregunta real del visitante: '¿por qué debería elegirte a ti?'. Nada de relleno corporativo.",
        },
        {
          titulo: "Botón de WhatsApp inteligente",
          descripcion:
            "El visitante no busca tu correo: quiere chatear ya. El botón flota, vibra al scroll y precarga un mensaje listo para que el cliente solo le dé enviar.",
        },
        {
          titulo: "Diseño responsivo de élite",
          descripcion:
            "Probado en 50+ tamaños de pantalla. Carga en menos de 1.2 segundos. Google premia velocidad con mejor posición.",
        },
        {
          titulo: "Galería, testimonios y FAQs que cierran ventas",
          descripcion:
            "La estructura sigue el patrón AIDA (Atención → Interés → Deseo → Acción) usado por las marcas que más venden online.",
        },
        {
          titulo: "Editor visual sin código",
          descripcion:
            "Cambia precios, fotos, horarios o tu menú en segundos desde tu celular. Sin desarrolladores, sin esperas.",
        },
        {
          titulo: "SSL, hosting y dominio",
          descripcion:
            "Todo incluido y gestionado. Tú no te preocupas por nada técnico — solo por contestar a los clientes que llegan.",
        },
      ],
    },
    benefits: [
      {
        titulo: "Conversión 3-5x mayor que una web tradicional",
        descripcion:
          "El diseño está optimizado siguiendo los patrones que usan los unicornios tech para convertir.",
        icon: "rocket",
      },
      {
        titulo: "Listo en 3 minutos, no en 3 meses",
        descripcion:
          "La IA construye tu sitio mientras tomas un café. Puedes editar después si quieres.",
        icon: "bolt",
      },
      {
        titulo: "WhatsApp directo en cada sección",
        descripcion:
          "Los visitantes nunca están a más de 1 click de escribirte. Eso multiplica los leads.",
        icon: "target",
      },
      {
        titulo: "Sin costos ocultos",
        descripcion:
          "Hosting, SSL, dominio, edición y soporte: todo incluido en una sola mensualidad.",
        icon: "shield",
      },
    ],
    process: {
      titulo: "Así pasamos de cero a tu primer cliente online",
      pasos: [
        {
          numero: "01",
          titulo: "Cuéntanos de tu negocio en 60 segundos",
          descripcion:
            "Solo 4 datos: nombre, giro, ciudad y WhatsApp. Nada más.",
        },
        {
          numero: "02",
          titulo: "La IA escribe y diseña tu sitio",
          descripcion:
            "Un modelo entrenado en miles de webs que convierten genera tu primera versión.",
        },
        {
          numero: "03",
          titulo: "Personalízalo desde tu celular",
          descripcion:
            "Cambia textos, sube fotos, ajusta colores. Sin código, sin diseñadores.",
        },
        {
          numero: "04",
          titulo: "Publica y empieza a recibir clientes",
          descripcion:
            "Activamos SEO local + WhatsApp + analíticas en automático.",
        },
      ],
    },
    metrics: [
      {
        label: "Tiempo para tener web",
        before: "2 a 8 semanas",
        after: "Menos de 3 minutos",
        delta: "1000x más rápido",
      },
      {
        label: "Costo de arranque",
        before: "$8,000 a $50,000 MXN",
        after: "Desde $299/mes",
        delta: "Hasta 95% menos",
      },
      {
        label: "Tasa de conversión típica",
        before: "0.5% – 1%",
        after: "3% – 7%",
        delta: "5x más leads",
      },
    ],
    stats: [
      { valor: "<3 min", label: "En lo que se construye" },
      { valor: "1.2 s", label: "Velocidad de carga" },
      { valor: "+340%", label: "Conversión promedio" },
    ],
    whoIsItFor: {
      titulo: "Es para ti si...",
      items: [
        "Tu web actual lleva años sin traerte un solo cliente",
        "Te avergüenza compartir el link de tu sitio",
        "Pagas hosting/dominio y no sabes ni para qué",
        "Quieres parecer la opción más profesional de tu zona",
        "Tu competencia ya aparece en Google y tú no",
        "Te cansaste de pagarle a freelancers que desaparecen",
      ],
    },
    faq: [
      {
        pregunta: "¿Cuánto tarda en estar lista mi web?",
        respuesta:
          "Menos de 3 minutos. La IA genera la primera versión completa con tus datos. Ese mismo día puedes empezar a recibir clientes.",
      },
      {
        pregunta: "¿Qué pasa si ya tengo un dominio?",
        respuesta:
          "Lo conectamos sin costo. Si no tienes dominio, te ayudamos a registrar uno o usas el subdominio gratuito de INDEXA.",
      },
      {
        pregunta: "¿Puedo editarla yo después?",
        respuesta:
          "Sí. Tienes un panel visual sin código. Cambias textos, fotos, precios y horarios desde tu celular. Sin esperar a nadie.",
      },
      {
        pregunta: "¿Y si no me gusta?",
        respuesta:
          "Tienes 14 días de prueba sin tarjeta. Si no te encanta, cancelas en un click. Cero compromiso.",
      },
    ],
    ctaTitle: "Tu próximo cliente está buscando en Google ahora mismo",
    ctaSubtitle:
      "Mientras lees esto, alguien busca tu giro en tu ciudad. La pregunta es: ¿te encuentra a ti o a tu competencia?",
  },
  // ─────────────────────────────────────────────────────────────────
  {
    slug: "marketing-automatizado",
    seoTitle: "Marketing Automatizado con IA para PYMES | Meta Ads y Google Ads en México",
    seoDescription:
      "Tus campañas de Facebook, Instagram y Google Ads optimizadas por IA cada 6 minutos. Reduce el costo por cliente hasta 60% sin contratar agencia. Pagas solo el plan, sin comisiones.",
    seoKeywords: [
      "marketing digital pyme méxico",
      "facebook ads para pymes",
      "google ads automatizado",
      "publicidad en instagram para negocios",
      "agencia marketing digital méxico",
      "campañas meta ads pyme",
      "marketing automatizado con ia",
      "anuncios facebook negocio local",
    ],
    serviceType: "Gestión y optimización automatizada de campañas de publicidad digital",
    audienceType: "PYMES en México que invierten en publicidad digital y buscan reducir costo por adquisición",
    cardTitle: "Marketing Automatizado",
    cardDescription:
      "Tus campañas de Facebook, Instagram y Google funcionando solas, optimizadas por IA, gastando solo donde hay clientes reales.",
    cardGradient: "from-indexa-orange to-amber-400",
    cardBg: "bg-indexa-orange/10",
    cardIconPath:
      "M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 1 1 0-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 0 1-1.44-4.282m3.102.069a18.03 18.03 0 0 1-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 0 1 8.835 2.535M10.34 6.66a23.847 23.847 0 0 0 8.835-2.535m0 0A23.74 23.74 0 0 0 18.795 3m.38 1.125a23.91 23.91 0 0 1 1.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 0 0 1.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 0 1 0 3.46",
    cardAccent: "#ff6600",
    heroBadge: "Marketing Automatizado",
    heroTitle: "Deja de tirar dinero a Facebook Ads.",
    heroHighlight: "Empieza a invertirlo.",
    heroSubtitle:
      "Conectamos tu cuenta de Meta y Google, y nuestra IA decide en tiempo real qué anuncio funciona, a quién mostrarlo y cuánto pagar por cada click. Tú solo recibes los clientes.",
    heroPitch:
      "El 80% de los anuncios de PYMES en México pierden dinero porque nadie los optimiza. Aquí los optimizamos cada 6 minutos sin que muevas un dedo.",
    heroVisual: "adsRadar",
    primaryColor: "#ff6600",
    secondaryColor: "#ffaa00",
    promiseStrip:
      "Cada peso invertido en publicidad regresa convertido en mensajes de WhatsApp.",
    whatItDoes: {
      titulo: "Lo que hacemos exactamente",
      descripcion:
        "Conectamos Meta Ads y Google Ads a un cerebro de IA que sabe vender mejor que la mayoría de las agencias.",
      items: [
        {
          titulo: "Conexión nativa con Meta y Google",
          descripcion:
            "Vinculamos tus cuentas de Facebook, Instagram y Google Ads desde un solo panel. Sin cambiar de pestaña.",
        },
        {
          titulo: "Creativos generados por IA",
          descripcion:
            "Imágenes, textos y videos cortos generados al estilo de tu marca. Probamos 8 variantes y dejamos solo la que más convierte.",
        },
        {
          titulo: "Audiencias inteligentes",
          descripcion:
            "Detectamos a las personas con mayor probabilidad de comprarte por su comportamiento, no por su edad o género.",
        },
        {
          titulo: "Optimización automática 24/7",
          descripcion:
            "Cada 6 minutos analizamos rendimiento. Pausamos lo que pierde, escalamos lo que gana. Sin que muevas un dedo.",
        },
        {
          titulo: "Reportes humanos, no técnicos",
          descripcion:
            "Te decimos en español: 'gastaste $X, te llegaron Y mensajes, costaron $Z cada uno'. Sin métricas confusas.",
        },
        {
          titulo: "WhatsApp como destino",
          descripcion:
            "Cada anuncio termina en una conversación de WhatsApp con el cliente, no en una página fría.",
        },
      ],
    },
    benefits: [
      {
        titulo: "Reduces el costo por cliente hasta 60%",
        descripcion:
          "La IA elimina el desperdicio. Solo gasta donde hay personas listas para comprar.",
        icon: "money",
      },
      {
        titulo: "Funciona 24/7 sin pausa",
        descripcion:
          "No duerme, no se enferma, no se va de vacaciones. Optimiza incluso a las 3 AM.",
        icon: "clock",
      },
      {
        titulo: "Más leads que toda tu competencia local",
        descripcion:
          "Mientras ellos pagan agencias caras, tú tienes un sistema autónomo.",
        icon: "growth",
      },
      {
        titulo: "Sin contratos, sin permanencia",
        descripcion:
          "Cancelas cuando quieras. Aunque honestamente, no vas a querer.",
        icon: "shield",
      },
    ],
    process: {
      titulo: "Cómo arrancamos en 24 horas",
      pasos: [
        {
          numero: "01",
          titulo: "Conectas Meta y Google",
          descripcion:
            "Un click. Sin pasar contraseñas. Login seguro vía OAuth oficial.",
        },
        {
          numero: "02",
          titulo: "La IA aprende tu negocio",
          descripcion:
            "Analiza tu sitio, tu giro y tu zona para entender a quién venderle.",
        },
        {
          numero: "03",
          titulo: "Lanzamos primera campaña",
          descripcion:
            "Activamos con presupuesto pequeño para validar y empezar a aprender.",
        },
        {
          numero: "04",
          titulo: "Escalamos lo que funciona",
          descripcion:
            "Cuando detectamos un anuncio ganador, le inyectamos más presupuesto automáticamente.",
        },
      ],
    },
    metrics: [
      {
        label: "Costo por lead promedio",
        before: "$180 – $400 MXN",
        after: "$45 – $90 MXN",
        delta: "Hasta 75% menos",
      },
      {
        label: "Tiempo para optimizar",
        before: "Reuniones semanales",
        after: "Cada 6 minutos",
        delta: "Tiempo real",
      },
      {
        label: "Mensajes por mes (PYME típica)",
        before: "20 – 40",
        after: "150 – 400",
        delta: "8x más",
      },
    ],
    stats: [
      { valor: "−60%", label: "Costo por cliente" },
      { valor: "8x", label: "Más mensajes" },
      { valor: "24/7", label: "Optimización IA" },
    ],
    whoIsItFor: {
      titulo: "Es para ti si...",
      items: [
        "Has gastado en Facebook Ads y no llegaron clientes",
        "Una agencia te cobra $5,000+ al mes y no ves resultados",
        "No entiendes qué anuncios funcionan y cuáles no",
        "Quieres anunciarte pero no sabes por dónde empezar",
        "Tu producto es local y necesitas atraer gente cerca",
        "Quieres vender más sin contratar otro empleado",
      ],
    },
    faq: [
      {
        pregunta: "¿Cuánto debo invertir mínimo en anuncios?",
        respuesta:
          "Recomendamos arrancar con $3,000 MXN/mes de presupuesto en anuncios. La IA empieza a optimizar desde el primer peso. No hay mínimo obligatorio — eso lo decides tú.",
      },
      {
        pregunta: "¿Indexa cobra comisión sobre el gasto en ads?",
        respuesta:
          "No. Solo pagas tu plan mensual fijo. Lo que gastes en Meta/Google es directo entre tú y la plataforma — sin comisiones nuestras.",
      },
      {
        pregunta: "¿Qué pasa si no tengo cuenta de Meta Ads?",
        respuesta:
          "Te ayudamos a crearla y configurarla en menos de 15 minutos. Es gratis y queda 100% a tu nombre.",
      },
      {
        pregunta: "¿Puedo ver lo que está haciendo la IA?",
        respuesta:
          "Total transparencia: cada decisión se registra en tu panel con explicación en español ('pausé este anuncio porque costó 3x más por click que el promedio').",
      },
    ],
    ctaTitle: "Cada hora que no anuncias, alguien le compra a tu competencia",
    ctaSubtitle:
      "Activa la IA hoy y mañana ya tendrás los primeros mensajes de WhatsApp llegando.",
  },
  // ─────────────────────────────────────────────────────────────────
  {
    slug: "seo-inteligente",
    seoTitle: "SEO Local para PYMES en México | Posicionamiento en Google con IA",
    seoDescription:
      "Posiciona tu negocio en los primeros lugares de Google cuando buscan tu giro en tu ciudad. Tráfico orgánico real, sin pagar publicidad. Optimización técnica completa + Google My Business.",
    seoKeywords: [
      "seo local méxico",
      "posicionamiento web google méxico",
      "seo para pyme cdmx guadalajara monterrey",
      "google my negocio optimización",
      "agencia seo méxico pyme",
      "subir en google búsquedas locales",
      "seo automático con ia",
      "posicionamiento orgánico negocio local",
    ],
    serviceType: "Optimización SEO local y posicionamiento en buscadores",
    audienceType: "Negocios locales en México que dependen de búsquedas geolocalizadas",
    cardTitle: "SEO Inteligente",
    cardDescription:
      "Aparece en los primeros lugares de Google cuando alguien busca lo que vendes, en tu ciudad. Sin pagar publicidad. Sin esfuerzo.",
    cardGradient: "from-emerald-500 to-teal-400",
    cardBg: "bg-emerald-500/10",
    cardIconPath:
      "M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605",
    cardAccent: "#10b981",
    heroBadge: "SEO Inteligente",
    heroTitle: "Si no estás en Google,",
    heroHighlight: "no existes.",
    heroSubtitle:
      "Optimizamos tu sitio para que cuando alguien busque tu giro en tu ciudad, aparezcas tú primero. Tráfico orgánico significa clientes que no pagaste por traer.",
    heroPitch:
      "El 75% de la gente nunca llega a la segunda página de Google. Si no estás arriba, eres invisible — sin importar qué tan bueno seas.",
    heroVisual: "seoDataFlow",
    primaryColor: "#10b981",
    secondaryColor: "#06b6d4",
    promiseStrip:
      "Cada búsqueda de tu giro en tu ciudad = una oportunidad. Te las llevamos todas.",
    whatItDoes: {
      titulo: "Lo que hacemos exactamente",
      descripcion:
        "SEO real, técnico, automatizado. No 'humo'. Te subimos en Google con la misma metodología que usan las marcas grandes.",
      items: [
        {
          titulo: "Optimización on-page automática",
          descripcion:
            "Títulos, descripciones, etiquetas H1/H2, metadata y schema: todo configurado para que Google entienda exactamente qué vendes.",
        },
        {
          titulo: "Schema.org local + LocalBusiness",
          descripcion:
            "Datos estructurados que hacen que aparezcas con foto, horario, teléfono y reseñas en los resultados de Google.",
        },
        {
          titulo: "Velocidad y Core Web Vitals",
          descripcion:
            "Tu sitio carga en menos de 1.5s. Google premia velocidad con mejor posición.",
        },
        {
          titulo: "Páginas de captura por ciudad y servicio",
          descripcion:
            "Generamos páginas SEO para 'tu giro + tu ciudad' que atraen búsquedas locales con alta intención de compra.",
        },
        {
          titulo: "Conexión con Google My Business",
          descripcion:
            "Te ayudamos a optimizar tu ficha de Google. Más reseñas, más fotos, más visibilidad en mapas.",
        },
        {
          titulo: "Reportes mensuales en español",
          descripcion:
            "Sabes exactamente qué palabras te traen tráfico, cuáles compraron y cuántos clientes nuevos obtuviste.",
        },
      ],
    },
    benefits: [
      {
        titulo: "Tráfico que no pagaste por traer",
        descripcion:
          "El SEO bien hecho sigue dándote clientes incluso si dejas de invertir en ads.",
        icon: "growth",
      },
      {
        titulo: "Aparece en el mapa de Google",
        descripcion:
          "Esos primeros 3 resultados con foto y reseñas reciben el 60% de los clicks locales.",
        icon: "target",
      },
      {
        titulo: "Confianza automática",
        descripcion:
          "El primer resultado de Google se considera el más confiable. Eso te ahorra explicar quién eres.",
        icon: "shield",
      },
      {
        titulo: "Resultado que se compone",
        descripcion:
          "A diferencia de los ads, el SEO acumula valor con el tiempo. Cada mes posicionas más.",
        icon: "chart",
      },
    ],
    process: {
      titulo: "Cómo te llevamos al top",
      pasos: [
        {
          numero: "01",
          titulo: "Auditoría técnica completa",
          descripcion:
            "Detectamos los 50+ factores que afectan tu ranking actual.",
        },
        {
          numero: "02",
          titulo: "Investigación de palabras clave",
          descripcion:
            "Identificamos las búsquedas reales con intención de compra en tu zona.",
        },
        {
          numero: "03",
          titulo: "Optimización on-site",
          descripcion:
            "Implementamos todo lo técnico: schema, velocidad, jerarquía, links internos.",
        },
        {
          numero: "04",
          titulo: "Monitoreo y mejora continua",
          descripcion:
            "Cada semana medimos posiciones y ajustamos lo que cae.",
        },
      ],
    },
    metrics: [
      {
        label: "Posición típica en Google",
        before: "Página 4-7",
        after: "Top 3 en local pack",
        delta: "Salto a primera página",
      },
      {
        label: "Tráfico orgánico mensual",
        before: "10 – 50 visitas",
        after: "400 – 2,000 visitas",
        delta: "Hasta 40x más",
      },
      {
        label: "Llamadas y mensajes desde Google",
        before: "0 – 2 al mes",
        after: "30 – 120 al mes",
        delta: "Crecimiento orgánico",
      },
    ],
    stats: [
      { valor: "Top 3", label: "En Google local" },
      { valor: "+40x", label: "Tráfico orgánico" },
      { valor: "1.5 s", label: "Carga del sitio" },
    ],
    whoIsItFor: {
      titulo: "Es para ti si...",
      items: [
        "Tu negocio es local y depende de clientes cercanos",
        "Cuando buscas tu giro + tu ciudad, no apareces",
        "Tu competencia aparece en el mapa de Google y tú no",
        "Estás cansado de depender solo de pagar publicidad",
        "Quieres construir un activo digital que crezca solo",
        "Sabes que la gente te busca, pero no te encuentra",
      ],
    },
    faq: [
      {
        pregunta: "¿Cuánto tarda en verse resultados?",
        respuesta:
          "Las primeras mejoras técnicas aparecen en 2-4 semanas. Posicionamiento sólido en top 3 local: típicamente 60-90 días. SEO no es ads, es construcción de autoridad.",
      },
      {
        pregunta: "¿Garantizan posición 1 en Google?",
        respuesta:
          "Nadie puede garantizar posición exacta — quien lo prometa miente. Lo que sí garantizamos: aplicar todas las prácticas que mueven la aguja y mostrarte el progreso real.",
      },
      {
        pregunta: "¿Qué pasa si tengo competencia muy fuerte?",
        respuesta:
          "Diseñamos estrategia long-tail: ataquemos primero búsquedas con menos competencia y alta intención. Una vez con autoridad, vamos por las grandes.",
      },
      {
        pregunta: "¿El SEO incluye Google My Business?",
        respuesta:
          "Sí, incluido en plan Profesional. Optimizamos tu ficha y te enseñamos a pedir reseñas que sí lleguen.",
      },
    ],
    ctaTitle: "Hoy buscaron 'tu giro en tu ciudad' decenas de personas",
    ctaSubtitle:
      "Si no apareciste tú, apareció tu competencia. Vamos a invertir esa ecuación.",
  },
  // ─────────────────────────────────────────────────────────────────
  {
    slug: "analiticas-tiempo-real",
    seoTitle: "Analíticas y Métricas en Tiempo Real para PYMES | Panel para Negocios México",
    seoDescription:
      "Mide visitas, conversiones, mensajes de WhatsApp y rendimiento de campañas en tiempo real. Decisiones con datos, no con intuición. Panel en español sin curvas de aprendizaje.",
    seoKeywords: [
      "analíticas web pyme",
      "panel de métricas negocio",
      "google analytics para pymes",
      "tracking whatsapp business",
      "métricas conversión sitio web",
      "dashboard ventas digitales",
      "estadísticas web tiempo real",
      "kpi marketing digital pyme méxico",
    ],
    serviceType: "Plataforma de analítica web y de marketing en tiempo real",
    audienceType: "PYMES en México que necesitan medir el desempeño de su presencia digital",
    cardTitle: "Analíticas en Tiempo Real",
    cardDescription:
      "Sabe exactamente cuánta gente ve tu negocio, qué los engancha y qué los hace contactarte. Decisiones con datos, no con intuición.",
    cardGradient: "from-purple-500 to-violet-400",
    cardBg: "bg-purple-500/10",
    cardIconPath:
      "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z",
    cardAccent: "#a855f7",
    heroBadge: "Analíticas en Tiempo Real",
    heroTitle: "Decidir sin datos",
    heroHighlight: "es apostar.",
    heroSubtitle:
      "Cada visita, cada click, cada mensaje de WhatsApp medido en tiempo real. Sabrás qué está vendiendo, qué está estancado y dónde invertir el siguiente peso.",
    heroPitch:
      "La diferencia entre los negocios que crecen y los que desaparecen no es la suerte. Es saber qué está pasando.",
    heroVisual: "analyticsPulse",
    primaryColor: "#a855f7",
    secondaryColor: "#ec4899",
    promiseStrip:
      "Cada decisión que tomes a partir de hoy estará respaldada con datos reales.",
    whatItDoes: {
      titulo: "Lo que medimos por ti",
      descripcion:
        "No es Google Analytics genérico. Es un panel diseñado para PYMES, en español, con métricas que sí importan.",
      items: [
        {
          titulo: "Visitas, fuente y comportamiento",
          descripcion:
            "Cuánta gente entra, de dónde viene (Google, Facebook, WhatsApp, directo) y qué sección les interesa más.",
        },
        {
          titulo: "Tracking de WhatsApp y llamadas",
          descripcion:
            "Cada vez que alguien hace tap en tu botón de WhatsApp o llama, se registra. Por fin sabes cuántos leads de verdad genera tu sitio.",
        },
        {
          titulo: "Embudo de conversión visual",
          descripcion:
            "Vemos cuántos llegan, cuántos hacen scroll, cuántos hacen click y cuántos convierten. Detectamos el cuello de botella.",
        },
        {
          titulo: "Mapas de calor",
          descripcion:
            "Visualiza dónde hace click la gente, hasta dónde hace scroll y qué ignora completamente.",
        },
        {
          titulo: "Rendimiento de campañas",
          descripcion:
            "Cada peso gastado en ads vinculado a cada mensaje recibido. ROI real, no estimado.",
        },
        {
          titulo: "Alertas inteligentes",
          descripcion:
            "Si tus visitas caen un 30% o aumenta el costo por click, te avisamos por WhatsApp. Antes de que sea problema.",
        },
      ],
    },
    benefits: [
      {
        titulo: "Sabes qué funciona y qué no",
        descripcion:
          "Pruebas, mides, decides. Sin adivinar.",
        icon: "chart",
      },
      {
        titulo: "Detectas oportunidades antes",
        descripcion:
          "Si una página convierte mucho, le das más visibilidad. Si una se cae, la corriges.",
        icon: "target",
      },
      {
        titulo: "Hablas con datos, no con anécdotas",
        descripcion:
          "Vendes a tu equipo, socios o inversionistas con números reales.",
        icon: "users",
      },
      {
        titulo: "Cero tablas confusas",
        descripcion:
          "Todo en español natural: 'el lunes te llegaron 23 mensajes, +45% vs la semana pasada'.",
        icon: "magic",
      },
    ],
    process: {
      titulo: "Cómo conviertes datos en clientes",
      pasos: [
        {
          numero: "01",
          titulo: "Conexión instantánea",
          descripcion:
            "El tracking se activa automáticamente en tu sitio INDEXA. No tocas código.",
        },
        {
          numero: "02",
          titulo: "Visualización clara",
          descripcion:
            "Abres tu panel y ves todo en gráficas simples. Sin curvas de aprendizaje.",
        },
        {
          numero: "03",
          titulo: "Recomendaciones IA",
          descripcion:
            "La IA te dice qué cambiar para mejorar tu conversión.",
        },
        {
          numero: "04",
          titulo: "Optimización continua",
          descripcion:
            "Cada semana ajustas basado en lo que los datos te dicen. Y creces.",
        },
      ],
    },
    metrics: [
      {
        label: "Visibilidad de métricas",
        before: "Reportes mensuales o nada",
        after: "Tiempo real",
        delta: "Sin retrasos",
      },
      {
        label: "Decisiones basadas en datos",
        before: "Por intuición",
        after: "Con dashboards",
        delta: "Predecible",
      },
    ],
    stats: [
      { valor: "Real-time", label: "Sin retrasos" },
      { valor: "100%", label: "Tracking de leads" },
      { valor: "1 click", label: "Para conectar" },
    ],
    whoIsItFor: {
      titulo: "Es para ti si...",
      items: [
        "No sabes cuánta gente realmente visita tu web",
        "Pagas anuncios pero no sabes si funcionan",
        "Crees que tu sitio convierte poco pero no estás seguro",
        "Quieres tomar decisiones con datos, no con corazonadas",
        "Tienes que reportar resultados a socios o jefes",
        "Te gusta optimizar y crecer con método",
      ],
    },
    faq: [
      {
        pregunta: "¿Necesito Google Analytics aparte?",
        respuesta:
          "No. Nuestro panel ya integra GA4 + tracking propio + WhatsApp clicks. Todo en un mismo lugar y en español natural.",
      },
      {
        pregunta: "¿Los datos se ven en mi celular?",
        respuesta:
          "Sí. Panel 100% responsive. Lo abres en tu celular y ves todo desde donde estés.",
      },
      {
        pregunta: "¿Qué hago con la información?",
        respuesta:
          "La IA te recomienda acciones concretas: 'la página de servicios pierde al 70% de visitantes — prueba este cambio'. Tú apruebas, ella ejecuta.",
      },
      {
        pregunta: "¿Cumple con privacidad?",
        respuesta:
          "Sí. Todo el tracking respeta GDPR y la normativa mexicana. Anónimo por default y con cookie consent integrado.",
      },
    ],
    ctaTitle: "Lo que no se mide, no se mejora",
    ctaSubtitle:
      "Activa el panel hoy y mañana sabrás más sobre tus clientes que en todo el último año.",
  },
  // ─────────────────────────────────────────────────────────────────
  {
    slug: "chatbot-inteligente",
    seoTitle: "Chatbot con IA para WhatsApp e Instagram | Atención 24/7 para PYMES México",
    seoDescription:
      "Tu vendedor de IA responde mensajes de WhatsApp, Instagram, Messenger y tu web en menos de 3 segundos, agenda citas y califica leads. Cero clientes perdidos por no contestar a tiempo.",
    seoKeywords: [
      "chatbot whatsapp business pyme",
      "chatbot ia para negocio méxico",
      "asistente virtual whatsapp",
      "automatizar respuestas instagram",
      "chatbot ventas 24 horas",
      "atención automatizada whatsapp",
      "chatbot multi canal méxico",
      "agendar citas con whatsapp bot",
    ],
    serviceType: "Implementación de chatbots conversacionales con IA para atención al cliente",
    audienceType: "Negocios en México que reciben muchos mensajes y necesitan responder de forma inmediata",
    cardTitle: "Chatbot Inteligente",
    cardDescription:
      "Un vendedor de IA que responde tus mensajes 24/7, agenda citas, califica leads y nunca pierde a un cliente por no contestar a tiempo.",
    cardGradient: "from-rose-500 to-pink-400",
    cardBg: "bg-rose-500/10",
    cardIconPath:
      "M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z",
    cardAccent: "#f43f5e",
    heroBadge: "Chatbot Inteligente",
    heroTitle: "Cada mensaje sin contestar",
    heroHighlight: "es un cliente perdido.",
    heroSubtitle:
      "Tu IA conversacional responde en WhatsApp, Instagram, Messenger y tu web — 24/7, en segundos, con tu tono. Agenda citas, cotiza, recomienda productos y filtra a los curiosos.",
    heroPitch:
      "El cliente promedio espera 2 minutos antes de irse con la competencia. Tu chatbot responde en 3 segundos. Diferencia: no perder ni un solo prospecto.",
    heroVisual: "chatbotNetwork",
    primaryColor: "#f43f5e",
    secondaryColor: "#ec4899",
    promiseStrip:
      "Mientras duermes, tu chatbot vende. Y mientras vendes, tu chatbot atiende a los siguientes.",
    whatItDoes: {
      titulo: "Lo que hace tu nuevo vendedor de IA",
      descripcion:
        "Integramos un asistente conversacional entrenado con tu información de negocio en todos los canales donde te escriben.",
      items: [
        {
          titulo: "Responde en WhatsApp, Instagram, Messenger y tu web",
          descripcion:
            "Mismo cerebro, todos los canales. Conversaciones unificadas en un solo panel.",
        },
        {
          titulo: "Entrenado con TU información",
          descripcion:
            "Le subes tu menú, precios, servicios, horarios, FAQs. Tu bot habla con conocimiento real de tu negocio.",
        },
        {
          titulo: "Agenda citas en tu calendario",
          descripcion:
            "Conecta con Google Calendar / Calendly. El cliente elige hora y la cita queda agendada sin que tú intervengas.",
        },
        {
          titulo: "Califica leads automáticamente",
          descripcion:
            "Filtra curiosos de compradores reales. Solo cuando hay intención de compra, te pasa la conversación.",
        },
        {
          titulo: "Toma pedidos y cotiza",
          descripcion:
            "Para restaurantes, tiendas y servicios: levanta el pedido completo, cobra con link de pago y te avisa.",
        },
        {
          titulo: "Aprende cada día",
          descripcion:
            "Cada conversación lo entrena más. A los 30 días sabe contestar el 90% de las dudas sin tu ayuda.",
        },
      ],
    },
    benefits: [
      {
        titulo: "Atención inmediata 24/7",
        descripcion:
          "El cliente no espera. Tu bot contesta en menos de 3 segundos a cualquier hora.",
        icon: "clock",
      },
      {
        titulo: "Conviertes 3x más por respuesta rápida",
        descripcion:
          "Estudios muestran que responder en menos de 5 minutos triplica la tasa de cierre.",
        icon: "rocket",
      },
      {
        titulo: "Liberas tiempo del equipo",
        descripcion:
          "Tu vendedora deja de contestar el 'cuánto cuesta' 50 veces al día.",
        icon: "users",
      },
      {
        titulo: "Cero leads perdidos",
        descripcion:
          "Mensajes a las 2 AM contestados. Mensajes en domingo contestados. Mensajes durante una junta contestados.",
        icon: "shield",
      },
    ],
    process: {
      titulo: "Cómo lo entrenamos para vender por ti",
      pasos: [
        {
          numero: "01",
          titulo: "Subes tu información",
          descripcion:
            "Menú, servicios, precios, FAQs y tono. En un panel simple.",
        },
        {
          numero: "02",
          titulo: "Entrenamos al bot",
          descripcion:
            "Procesamos todo y lo ajustamos al estilo de tu marca.",
        },
        {
          numero: "03",
          titulo: "Conectamos los canales",
          descripcion:
            "WhatsApp Business API + Instagram + Messenger + tu web.",
        },
        {
          numero: "04",
          titulo: "Activamos handoff humano",
          descripcion:
            "Cuando el bot detecta que el caso necesita persona, te transfiere automáticamente.",
        },
      ],
    },
    metrics: [
      {
        label: "Tiempo de respuesta",
        before: "30 minutos a 8 horas",
        after: "Menos de 3 segundos",
        delta: "Inmediato",
      },
      {
        label: "Mensajes contestados fuera de horario",
        before: "0%",
        after: "100%",
        delta: "Cobertura total",
      },
      {
        label: "Tasa de conversión de leads",
        before: "8% – 15%",
        after: "25% – 40%",
        delta: "Hasta 3x",
      },
    ],
    stats: [
      { valor: "<3 s", label: "Respuesta promedio" },
      { valor: "24/7", label: "Sin descanso" },
      { valor: "+90%", label: "Resolución sin humano" },
    ],
    whoIsItFor: {
      titulo: "Es para ti si...",
      items: [
        "Recibes muchos mensajes y no alcanzas a contestar",
        "Tu equipo pierde tiempo respondiendo lo mismo todo el día",
        "Has perdido ventas por contestar tarde",
        "Vendes productos/servicios fáciles de cotizar",
        "Quieres atender en domingo sin trabajar el domingo",
        "Tu competencia ya tiene chatbot y tú no",
      ],
    },
    faq: [
      {
        pregunta: "¿Suena robótico?",
        respuesta:
          "No. Usamos modelos de última generación (GPT-4 nivel) con tu tono y vocabulario. La mayoría de tus clientes no notará diferencia.",
      },
      {
        pregunta: "¿Qué pasa si no sabe la respuesta?",
        respuesta:
          "Te transfiere la conversación con un resumen del caso. Tú continúas desde donde se quedó, sin volver a preguntar todo.",
      },
      {
        pregunta: "¿Funciona en WhatsApp Business normal?",
        respuesta:
          "Funciona en WhatsApp Business API (la versión oficial para empresas). Te ayudamos a migrar tu número actual sin que pierdas conversaciones.",
      },
      {
        pregunta: "¿Cuánto cuesta el bot?",
        respuesta:
          "Incluido a partir del plan Profesional. Sin costo por mensaje, sin sorpresas. Limites generosos suficientes para PYMES.",
      },
    ],
    ctaTitle: "Cada mensaje que no contestaste hoy era un cliente nuevo",
    ctaSubtitle:
      "Activa el chatbot y deja de perder ventas por no estar disponible.",
  },
  // ─────────────────────────────────────────────────────────────────
  {
    slug: "automatizaciones",
    seoTitle: "Automatizaciones para Negocios en México | Conecta WhatsApp, CRM, Pagos y Calendar",
    seoDescription:
      "Automatiza tu negocio: WhatsApp, Google Calendar, CRM, pagos y facturación trabajando solos. Recupera 10-20 horas a la semana, reduce no-shows 70% y escala sin contratar más gente.",
    seoKeywords: [
      "automatización procesos pyme méxico",
      "integración whatsapp y crm",
      "automatizar agenda con google calendar",
      "facturación automática méxico",
      "workflow para pymes",
      "automatizar negocio con ia",
      "n8n make zapier méxico",
      "automatizar seguimiento clientes whatsapp",
    ],
    serviceType: "Automatización de procesos de negocio e integración de plataformas",
    audienceType: "Negocios en México que pierden tiempo en tareas operativas repetitivas",
    cardTitle: "Automatizaciones",
    cardDescription:
      "Conecta tu negocio entero: WhatsApp, calendario, CRM, pagos, facturación. Que las tareas repetitivas se hagan solas y tú solo recibas dinero.",
    cardGradient: "from-fuchsia-500 to-indigo-400",
    cardBg: "bg-fuchsia-500/10",
    cardIconPath:
      "M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0M3.124 7.5A8.969 8.969 0 0 1 5.292 3m13.416 0a8.969 8.969 0 0 1 2.168 4.5",
    cardAccent: "#d946ef",
    heroBadge: "Automatizaciones",
    heroTitle: "Cada hora repitiendo tareas",
    heroHighlight: "es una hora que no estás vendiendo.",
    heroSubtitle:
      "Conectamos las herramientas que ya usas (WhatsApp, Google Calendar, hojas de cálculo, CRM, pagos, facturación) para que el flujo de trabajo de tu negocio funcione solo. Cero copy-paste. Cero olvidos.",
    heroPitch:
      "El secreto de las empresas que crecen 10x sin contratar más gente: automatizan todo lo aburrido. Hoy automatizar es para todos, no solo para corporativos.",
    heroVisual: "automationMesh",
    primaryColor: "#d946ef",
    secondaryColor: "#6366f1",
    promiseStrip:
      "Le quitamos a tu equipo las tareas que nadie quiere hacer. Para siempre.",
    whatItDoes: {
      titulo: "Las automatizaciones que conectamos por ti",
      descripcion:
        "No vendemos magia. Conectamos sistemas reales con flujos pensados para PYMES. Resultado: tu negocio trabaja en automático.",
      items: [
        {
          titulo: "Lead captura → CRM → seguimiento",
          descripcion:
            "Cada mensaje en WhatsApp o web entra al CRM con tag, prioridad y secuencia de seguimiento automática.",
        },
        {
          titulo: "Citas → calendario → recordatorio",
          descripcion:
            "El cliente agenda, queda en tu Google Calendar y recibe recordatorios por WhatsApp 24h y 1h antes. Reduce no-shows en 70%.",
        },
        {
          titulo: "Pago confirmado → factura → entrega",
          descripcion:
            "Cliente paga con Stripe / MercadoPago. Se genera factura automática (Factura.com), se actualiza tu inventario y le mandamos confirmación.",
        },
        {
          titulo: "Cliente inactivo → reactivación",
          descripcion:
            "Si un cliente no compra en 30/60/90 días, sale automáticamente con un mensaje personalizado de reactivación.",
        },
        {
          titulo: "Reseñas automáticas",
          descripcion:
            "Cliente cierra compra → 24h después le pedimos reseña en Google. Sube tu reputación local solo.",
        },
        {
          titulo: "Reportes automáticos por WhatsApp",
          descripcion:
            "Cada lunes recibes en WhatsApp: ventas de la semana, leads nuevos, costo por cliente, top productos. En 1 minuto sabes cómo va el negocio.",
        },
        {
          titulo: "Integraciones con +500 herramientas",
          descripcion:
            "Sheets, Notion, HubSpot, Mailchimp, Zapier, n8n, Make. Si lo usas, lo conectamos.",
        },
        {
          titulo: "Workflows personalizados",
          descripcion:
            "¿Tu proceso es único? Nuestro equipo diseña automatizaciones a tu medida. No-code, no-stress.",
        },
      ],
    },
    benefits: [
      {
        titulo: "Recuperas 10-20 horas por semana",
        descripcion:
          "Lo que antes hacía un humano, ahora se hace solo en segundos.",
        icon: "clock",
      },
      {
        titulo: "Cero errores humanos",
        descripcion:
          "No olvidas mandar el recordatorio, no se pierde el lead, no se duplica la factura.",
        icon: "shield",
      },
      {
        titulo: "Escala sin contratar",
        descripcion:
          "Pasas de 50 a 500 clientes al mes sin necesidad de duplicar tu equipo.",
        icon: "growth",
      },
      {
        titulo: "Información unificada",
        descripcion:
          "Todo lo que pasa en tu negocio queda registrado en un solo lugar. Adiós a buscar entre 5 apps.",
        icon: "magic",
      },
    ],
    process: {
      titulo: "Cómo automatizamos tu negocio en 7 días",
      pasos: [
        {
          numero: "01",
          titulo: "Mapeamos tu día a día",
          descripcion:
            "Una sesión de 30 min para entender qué tareas repites más.",
        },
        {
          numero: "02",
          titulo: "Identificamos los 'cuellos'",
          descripcion:
            "Detectamos las 3 automatizaciones que más impacto te darán.",
        },
        {
          numero: "03",
          titulo: "Construimos los flujos",
          descripcion:
            "Conectamos tus herramientas con flujos visuales sin código.",
        },
        {
          numero: "04",
          titulo: "Probamos y lanzamos",
          descripcion:
            "Validamos cada flujo, te capacitamos y ponemos a correr el sistema.",
        },
      ],
    },
    metrics: [
      {
        label: "Tiempo dedicado a tareas operativas",
        before: "20-30 hrs/semana",
        after: "2-5 hrs/semana",
        delta: "Hasta 90% menos",
      },
      {
        label: "Tasa de cancelación de citas (no-show)",
        before: "30% – 40%",
        after: "8% – 12%",
        delta: "70% menos",
      },
      {
        label: "Tiempo entre compra y factura",
        before: "Días",
        after: "Segundos",
        delta: "Instantáneo",
      },
    ],
    stats: [
      { valor: "+15h", label: "Recuperadas/semana" },
      { valor: "−70%", label: "Citas perdidas" },
      { valor: "500+", label: "Apps integrables" },
    ],
    whoIsItFor: {
      titulo: "Es para ti si...",
      items: [
        "Tu equipo se queja de tareas repetitivas",
        "Pierdes leads porque nadie hizo seguimiento",
        "Pasas horas pasando datos de WhatsApp a Excel",
        "Tus clientes no vuelven y no sabes cómo reactivarlos",
        "Quieres crecer sin contratar más personal",
        "Te das cuenta que el problema no es vender, es operar",
      ],
    },
    faq: [
      {
        pregunta: "¿Necesito saber programar?",
        respuesta:
          "Cero código. Nosotros construimos los flujos. Tú solo apruebas y los usas. La interfaz es 100% visual estilo Zapier/Make.",
      },
      {
        pregunta: "¿Qué herramientas pueden conectarse?",
        respuesta:
          "WhatsApp Business, Google Workspace, Microsoft 365, Stripe, MercadoPago, Conekta, Factura.com, HubSpot, Mailchimp, Sheets, Notion, Airtable, Calendly, Slack y +500 más.",
      },
      {
        pregunta: "¿Y si mi proceso es muy específico?",
        respuesta:
          "Justo para eso está nuestro equipo. Diseñamos automatizaciones a la medida de tu negocio. Incluido en plan Profesional/Enterprise.",
      },
      {
        pregunta: "¿Puedo modificar las automatizaciones después?",
        respuesta:
          "Sí. Editor visual con drag-and-drop. Cualquier persona del equipo puede ajustar reglas sin tocar código.",
      },
    ],
    ctaTitle: "Tu negocio puede crecer mientras tú duermes",
    ctaSubtitle:
      "Automatizar no es solo para Amazon. Es para cualquier negocio que entendió que el tiempo es el activo más caro.",
  },
];

export const getServicioBySlug = (slug: string): Servicio | undefined =>
  servicios.find((s) => s.slug === slug);
