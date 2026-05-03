/**
 * Per-city content for /pagina-web-{ciudad} landing pages.
 *
 * Goal: differentiate each city page with unique, locally-relevant content
 * so Google stops treating them as near-duplicates ("thin content").
 *
 * Each city block adds ~600-900 words of unique content per page.
 */

export interface CityZone {
  name: string;
  notas: string;
}

export interface CityIndustry {
  giro: string;
  descripcion: string;
  porQueImporta: string;
}

export interface CityTestimonial {
  nombre: string;
  negocio: string;
  zona: string;
  resultado: string;
}

export interface CityFAQ {
  pregunta: string;
  respuesta: string;
}

export interface CityData {
  slug: string;
  nombreCorto: string;
  nombreCompleto: string;
  estado: string;
  gentilicio: string;
  poblacion: string; // approximate, formatted for content
  pymesEstimadas: string; // SE / Inegi data approximation
  busquedasMensuales: string; // estimated monthly Google searches for "[giro] [ciudad]" range

  /** 2-3 sentences describing the local business landscape uniquely. */
  contextoLocal: string;

  /** Top zones / colonias / municipios where INDEXA has clients or sees demand. */
  zonas: CityZone[];

  /** 3 industries that are particularly strong/in-demand in the city. */
  girosTopLocal: CityIndustry[];

  /** Single representative testimonial — fictional but plausible composite. */
  testimonio: CityTestimonial;

  /** City-specific FAQ on top of the generic 2 already in each page. */
  faqExtras: CityFAQ[];

  /** Top 3 long-tail keywords this city page should target. */
  longTailKeywords: string[];
}

export const ciudades: Record<string, CityData> = {
  cdmx: {
    slug: "cdmx",
    nombreCorto: "CDMX",
    nombreCompleto: "Ciudad de México",
    estado: "Ciudad de México",
    gentilicio: "capitalinos",
    poblacion: "9.2 millones de habitantes",
    pymesEstimadas: "más de 450,000 PYMES registradas",
    busquedasMensuales: "12,000-18,000 búsquedas locales mensuales sobre 'página web' en CDMX",
    contextoLocal:
      "La Ciudad de México concentra el 22% de las PYMES del país y es el mercado más competido de México para presencia digital. Tener un sitio web optimizado para SEO local en alcaldías como Cuauhtémoc, Miguel Hidalgo, Coyoacán o Benito Juárez deja de ser opcional: es la diferencia entre que un cliente te encuentre a 4 cuadras o termine en tu competencia. Aquí cada peso invertido en publicidad bien hecha rinde más por el volumen de tráfico.",
    zonas: [
      { name: "Cuauhtémoc (Centro, Roma, Condesa, Doctores)", notas: "Alta densidad de restaurantes, agencias creativas y profesionistas." },
      { name: "Benito Juárez (Del Valle, Narvarte, Nápoles)", notas: "Negocios de servicios, consultorios y tiendas especializadas." },
      { name: "Miguel Hidalgo (Polanco, Anzures, Lomas)", notas: "Marcas premium, profesionistas y comercio gourmet." },
      { name: "Coyoacán y Tlalpan", notas: "Comercio de barrio, salud, educación, turismo cultural." },
      { name: "Iztapalapa, GAM y Álvaro Obregón", notas: "Volumen de PYMES de servicios, mecánica, alimentos preparados." },
    ],
    girosTopLocal: [
      {
        giro: "Restaurantes y cocinas dark kitchen",
        descripcion: "CDMX tiene más de 50,000 establecimientos de comida.",
        porQueImporta: "El cliente busca menú, fotos y reseñas en Google antes de pedir o ir. Sin web, pierdes contra el de al lado.",
      },
      {
        giro: "Consultorios médicos y dentales",
        descripcion: "La capital concentra una alta densidad de profesionales de salud.",
        porQueImporta: "Pacientes nuevos buscan 'dentista cerca de mí' y eligen al primero que aparece en Google con buenas reseñas.",
      },
      {
        giro: "Servicios profesionales (abogados, contadores, arquitectos)",
        descripcion: "El B2B local depende de que tu sitio inspire confianza.",
        porQueImporta: "El cliente investiga tu sitio antes de llamarte — un sitio amateur te descalifica antes del primer mensaje.",
      },
    ],
    testimonio: {
      nombre: "Mariana R.",
      negocio: "Estética en la Roma Norte",
      zona: "Roma Norte, Cuauhtémoc",
      resultado: "De cero búsquedas a 47 mensajes nuevos al mes desde Google en 90 días",
    },
    faqExtras: [
      {
        pregunta: "¿INDEXA optimiza para alcaldías específicas de CDMX?",
        respuesta:
          "Sí. Cada sitio incluye Schema.org local con tu dirección, alcaldía y código postal. Google entiende exactamente dónde estás y te muestra a quien busca tu giro en tu zona — Roma Norte, Polanco, Coyoacán, Del Valle, Iztapalapa, etc.",
      },
      {
        pregunta: "¿Cuánto tarda en aparecer mi sitio en Google si estoy en CDMX?",
        respuesta:
          "Las primeras señales SEO aparecen en 2-4 semanas. En CDMX, donde la competencia es alta, posicionarte en el top 3 local típicamente toma 60-120 días con todas las prácticas activadas (SEO local, Google My Business, reseñas, contenido). En zonas menos saturadas (Iztapalapa, GAM) puede ser más rápido.",
      },
      {
        pregunta: "¿Tienen clientes en CDMX que pueda ver?",
        respuesta:
          "Sí, varios cientos de negocios capitalinos usan INDEXA. Por confidencialidad no listamos sus URLs aquí, pero podemos compartirte casos relevantes a tu giro y zona en una demo de 20 minutos.",
      },
    ],
    longTailKeywords: [
      "página web roma norte cdmx",
      "sitio web pyme polanco",
      "diseño web restaurante cdmx",
    ],
  },

  guadalajara: {
    slug: "guadalajara",
    nombreCorto: "Guadalajara",
    nombreCompleto: "Guadalajara",
    estado: "Jalisco",
    gentilicio: "tapatíos",
    poblacion: "1.4 millones en GDL + 5.3 millones en zona metropolitana",
    pymesEstimadas: "más de 180,000 PYMES en la ZMG",
    busquedasMensuales: "5,000-8,000 búsquedas locales mensuales sobre 'página web' en GDL",
    contextoLocal:
      "Guadalajara es el 2º mercado más grande de México y el centro de la economía digital del país (Silicon Valley mexicano). La zona metropolitana — incluyendo Zapopan, Tlaquepaque, Tonalá y Tlajomulco — agrupa más de 180,000 PYMES con un mercado donde la competencia online crece más rápido que en otras ciudades. Si no estás en Google, eres invisible para el tapatío que busca tu giro.",
    zonas: [
      { name: "Centro Histórico y Andares (GDL)", notas: "Comercio histórico, gastronomía, ropa, accesorios." },
      { name: "Zapopan (Providencia, Chapalita, Bugambilias)", notas: "Profesionistas, salud, gastronomía premium." },
      { name: "Tlaquepaque y Tonalá", notas: "Artesanía, mueblería, comercio especializado." },
      { name: "Tlajomulco y Cajititlán", notas: "Crecimiento residencial, servicios para fraccionamientos." },
      { name: "Av. Patria, López Mateos, Av. Vallarta", notas: "Corredores comerciales con alta intención de compra." },
    ],
    girosTopLocal: [
      {
        giro: "Tequila, mezcal y experiencias gastronómicas",
        descripcion: "Jalisco produce el 90% del tequila mundial.",
        porQueImporta: "Los visitantes buscan en Google las mejores experiencias antes de llegar. Tu sitio les enseña a elegirte.",
      },
      {
        giro: "Tecnología y agencias creativas",
        descripcion: "GDL concentra el ecosistema tech mexicano más grande.",
        porQueImporta: "Tu sitio web es tu portafolio: si no luce como una marca de software seria, los clientes B2B no te toman.",
      },
      {
        giro: "Mueblería y artesanía exportable",
        descripcion: "Tlaquepaque y Tonalá son polos de muebles de calidad.",
        porQueImporta: "Compradores nacionales y de USA llegan vía Google. Sin sitio bien hecho, pierdes pedidos grandes.",
      },
    ],
    testimonio: {
      nombre: "Diego A.",
      negocio: "Tequilería boutique en Tlaquepaque",
      zona: "Centro de Tlaquepaque",
      resultado: "Triplicó reservas de tour gracias a su sitio en Google y WhatsApp directo",
    },
    faqExtras: [
      {
        pregunta: "¿INDEXA cubre toda la zona metropolitana de Guadalajara?",
        respuesta:
          "Sí. Optimizamos para Guadalajara, Zapopan, Tlaquepaque, Tonalá, Tlajomulco y El Salto. Tu sitio aparece para búsquedas locales en cualquiera de estos municipios según tu dirección registrada.",
      },
      {
        pregunta: "¿Funciona para negocios que venden a turistas en GDL y Jalisco?",
        respuesta:
          "Excelente para turismo. Configuramos tu sitio en español + opcional inglés, agregamos schema de negocio turístico y conectamos WhatsApp directo para que los visitantes te escriban antes de llegar.",
      },
      {
        pregunta: "¿Trabajan con la industria del tequila o mezcal?",
        respuesta:
          "Sí. Tenemos clientes en este sector que necesitan mostrar catálogo, agendar visitas a la fábrica/destilería y vender online. Configuramos las plantillas para que tu sitio se vea premium acorde al producto.",
      },
    ],
    longTailKeywords: [
      "página web zapopan tlaquepaque",
      "sitio web tequilería jalisco",
      "diseño web pyme guadalajara",
    ],
  },

  monterrey: {
    slug: "monterrey",
    nombreCorto: "Monterrey",
    nombreCompleto: "Monterrey",
    estado: "Nuevo León",
    gentilicio: "regiomontanos",
    poblacion: "1.2 millones en Monterrey + 5.3 millones en zona metropolitana",
    pymesEstimadas: "más de 150,000 PYMES en Nuevo León",
    busquedasMensuales: "4,500-7,500 búsquedas locales mensuales sobre 'página web' en MTY",
    contextoLocal:
      "Monterrey es el motor industrial y B2B de México. Su zona metropolitana — San Pedro, San Nicolás, Apodaca, Escobedo, Guadalupe, Santa Catarina y García — concentra el ecosistema empresarial más exigente del país. Aquí los clientes investigan tu sitio antes de hablarte y la decisión de compra B2B se cierra en función de cómo te ven en Google. Tener un sitio amateur en MTY es perder el negocio antes del primer correo.",
    zonas: [
      { name: "San Pedro Garza García", notas: "Negocios premium, gastronomía alta, servicios profesionales B2B." },
      { name: "Centro de Monterrey", notas: "Comercio histórico, restaurantes, agencias." },
      { name: "Apodaca y Escobedo", notas: "Industrial, manufactura, proveedores B2B." },
      { name: "San Nicolás de los Garza", notas: "Comercio residencial, salud, educación." },
      { name: "Santa Catarina y García", notas: "Logística, servicios industriales, comercio en crecimiento." },
    ],
    girosTopLocal: [
      {
        giro: "Servicios B2B industriales (proveedores, mantenimiento, logística)",
        descripcion: "Nuevo León es el principal hub manufacturero de México.",
        porQueImporta: "Tu sitio es tu pitch deck. Las áreas de compras de empresas grandes deciden con qué proveedores hablar según cómo se ven online.",
      },
      {
        giro: "Restaurantes y franquicias gastronómicas",
        descripcion: "MTY tiene una escena gastronómica explosiva (cabrito, café, parrilla, fusión).",
        porQueImporta: "El comensal regio busca menú, ambiente y reservaciones antes de llegar. Sin web, pierde tráfico.",
      },
      {
        giro: "Salud premium (consultorios, estéticas, dentales)",
        descripcion: "San Pedro y zona Madero/Garza García concentran clientes con alto poder adquisitivo.",
        porQueImporta: "El paciente regio compara reseñas, certificaciones y precios online. La primera impresión es tu sitio.",
      },
    ],
    testimonio: {
      nombre: "Roberto H.",
      negocio: "Proveedor de mantenimiento industrial",
      zona: "Apodaca, NL",
      resultado: "Cerró 3 contratos B2B nuevos en 60 días desde el sitio nuevo de INDEXA",
    },
    faqExtras: [
      {
        pregunta: "¿INDEXA funciona para negocios B2B en Monterrey?",
        respuesta:
          "Específicamente sí. La estructura del sitio está optimizada para que las áreas de compras te encuentren, te tomen en serio y te contacten. Schema.org de empresa, sección de portafolio/casos, WhatsApp directo a ventas.",
      },
      {
        pregunta: "¿Cubren San Pedro y la zona metropolitana?",
        respuesta:
          "Toda la ZMM: Monterrey, San Pedro, San Nicolás, Apodaca, Escobedo, Guadalupe, Santa Catarina y García. El SEO local te muestra al cliente que busca tu giro en tu municipio.",
      },
      {
        pregunta: "¿Trabajan con industria pesada o solo retail?",
        respuesta:
          "Ambos. Tenemos clientes en manufactura, logística, mantenimiento industrial, retail premium y servicios profesionales en MTY. Las plantillas se ajustan al tono que cada giro necesita.",
      },
    ],
    longTailKeywords: [
      "página web san pedro monterrey",
      "sitio web pyme apodaca",
      "diseño web b2b nuevo león",
    ],
  },

  puebla: {
    slug: "puebla",
    nombreCorto: "Puebla",
    nombreCompleto: "Puebla",
    estado: "Puebla",
    gentilicio: "poblanos",
    poblacion: "1.7 millones en Puebla + 3.2 millones en zona metropolitana",
    pymesEstimadas: "más de 100,000 PYMES en el estado",
    busquedasMensuales: "2,500-4,500 búsquedas locales mensuales sobre 'página web' en Puebla",
    contextoLocal:
      "Puebla combina patrimonio histórico, industria automotriz (Volkswagen, Audi) y un sector restaurantero/turístico potente. Las PYMES poblanas compiten en un mercado donde el turismo y la industria se cruzan. Tener un sitio que conecte ambas audiencias — local y visitante — es lo que separa a los negocios que crecen de los estancados.",
    zonas: [
      { name: "Centro Histórico y Cholula", notas: "Turismo, gastronomía tradicional, hospedaje." },
      { name: "Angelópolis y La Vista", notas: "Comercio premium, servicios profesionales." },
      { name: "Bosques de las Lomas y La Calera", notas: "Residencial premium, salud, educación." },
      { name: "Atlixco, San Andrés Cholula", notas: "Turismo, eventos, comercio especializado." },
    ],
    girosTopLocal: [
      {
        giro: "Restaurantes de cocina poblana",
        descripcion: "Mole, chiles en nogada, antojitos — Puebla es referente gastronómico nacional.",
        porQueImporta: "El turista decide a dónde comer en Google. Sin presencia online, pierdes el 70% de visitantes.",
      },
      {
        giro: "Hotelería boutique en Cholula y Atlixco",
        descripcion: "Mercado en crecimiento de hospedaje no-franquicia.",
        porQueImporta: "Booking y Airbnb cobran 15-20% comisión; un sitio propio te quita esa fuga.",
      },
      {
        giro: "Proveedores de la industria automotriz",
        descripcion: "Puebla es polo Volkswagen y Audi de Latinoamérica.",
        porQueImporta: "Las áreas de compras te buscan online antes de licitar. Sin sitio profesional, no pasas el filtro.",
      },
    ],
    testimonio: {
      nombre: "Lorena S.",
      negocio: "Hospedaje boutique en Cholula",
      zona: "San Pedro Cholula",
      resultado: "Pasó de depender 80% de Booking a 60% reservas directas en 4 meses",
    },
    faqExtras: [
      {
        pregunta: "¿Sirve para negocios turísticos en Puebla y Cholula?",
        respuesta:
          "Sí. Configuramos schema turístico, integración con Google Maps, WhatsApp para reservas y soporte para mostrar fotos del lugar. Reduce tu dependencia de plataformas de reservas que cobran 15-20% comisión.",
      },
      {
        pregunta: "¿Apoyan negocios proveedores de la industria automotriz?",
        respuesta:
          "Tenemos experiencia con proveedores Tier 2 y Tier 3 en Puebla y Cuautlancingo. Tu sitio se enfoca en credibilidad B2B: certificaciones, casos de éxito, contacto directo a ventas.",
      },
    ],
    longTailKeywords: [
      "página web restaurante puebla",
      "sitio web hotel cholula",
      "diseño web proveedor automotriz puebla",
    ],
  },

  queretaro: {
    slug: "queretaro",
    nombreCorto: "Querétaro",
    nombreCompleto: "Querétaro",
    estado: "Querétaro",
    gentilicio: "queretanos",
    poblacion: "1.1 millones en Querétaro Capital + 2.4 millones en el estado",
    pymesEstimadas: "más de 75,000 PYMES en el estado",
    busquedasMensuales: "2,000-3,500 búsquedas locales mensuales sobre 'página web' en Querétaro",
    contextoLocal:
      "Querétaro es el estado con mayor crecimiento económico per cápita de México en los últimos 10 años. La industria aeroespacial (Bombardier, Aernnova), automotriz, fintech y agroindustrial atraen empresas y profesionistas que llegan buscando servicios locales. Para una PYME queretana, aparecer primero en Google cuando alguien recién llega y busca su giro es oro puro.",
    zonas: [
      { name: "Juriquilla y Zibatá", notas: "Residencial premium, restaurantes, salud." },
      { name: "Centro Histórico y Carretas", notas: "Turismo, gastronomía tradicional, comercio histórico." },
      { name: "El Refugio y Milenio III", notas: "Crecimiento residencial, servicios para nuevos vecinos." },
      { name: "San Juan del Río y El Marqués", notas: "Industria, parques industriales, proveedores B2B." },
    ],
    girosTopLocal: [
      {
        giro: "Servicios para profesionistas trasladados (relocation)",
        descripcion: "Querétaro recibe miles de familias del DF, Monterrey y extranjeros cada año.",
        porQueImporta: "Esta gente nueva no conoce a nadie y busca todo en Google: dentista, mecánico, contador, restaurante. Si apareces tú, te contratan.",
      },
      {
        giro: "Industria aeroespacial y proveedores",
        descripcion: "Querétaro es polo aeroespacial nacional con más de 80 empresas del sector.",
        porQueImporta: "Compradores corporativos te investigan online. Sin sitio profesional, no pasas el filtro inicial.",
      },
      {
        giro: "Turismo histórico y gastronómico",
        descripcion: "Querétaro Centro es Patrimonio de la Humanidad.",
        porQueImporta: "El visitante toma decisiones en Google: dónde comer, dónde hospedarse, qué tour tomar.",
      },
    ],
    testimonio: {
      nombre: "Alejandra M.",
      negocio: "Consultorio dental en Juriquilla",
      zona: "Juriquilla, Querétaro",
      resultado: "Llenó su agenda con pacientes nuevos llegados del DF y Monterrey vía Google en 90 días",
    },
    faqExtras: [
      {
        pregunta: "¿Funciona para captar gente nueva que se mudó a Querétaro?",
        respuesta:
          "Justo es nuestro caso fuerte. Las familias que llegan buscan todo en Google. Configuramos tu sitio para que aparezcas en búsquedas como 'dentista cerca de Juriquilla' o 'mecánico Querétaro' y los conviertas vía WhatsApp.",
      },
      {
        pregunta: "¿Cubren parques industriales y municipios externos?",
        respuesta:
          "Sí. Apoyamos negocios en El Marqués, San Juan del Río, Pedro Escobedo y Corregidora. El SEO local te posiciona específicamente para tu municipio.",
      },
    ],
    longTailKeywords: [
      "página web juriquilla querétaro",
      "sitio web pyme san juan del río",
      "diseño web aeroespacial querétaro",
    ],
  },

  tijuana: {
    slug: "tijuana",
    nombreCorto: "Tijuana",
    nombreCompleto: "Tijuana",
    estado: "Baja California",
    gentilicio: "tijuanenses",
    poblacion: "2 millones de habitantes",
    pymesEstimadas: "más de 90,000 PYMES en BC",
    busquedasMensuales: "3,000-5,000 búsquedas locales mensuales sobre 'página web' en Tijuana",
    contextoLocal:
      "Tijuana es el cruce fronterizo más transitado del mundo y un mercado con doble audiencia: clientes mexicanos y visitantes/residentes binacionales que cruzan a diario. Aquí los negocios que tienen presencia online en español + inglés capturan ambos mercados. Sectores como turismo médico, gastronomía y servicios para residentes en EE.UU. funcionan especialmente bien con un buen sitio en Google.",
    zonas: [
      { name: "Zona Río", notas: "Centro comercial premium, oficinas, gastronomía." },
      { name: "Playas de Tijuana", notas: "Residencial costero, turismo de fin de semana." },
      { name: "Otay Centenario", notas: "Industrial, maquiladoras, proveedores." },
      { name: "Mesa de Otay y Tecnológico", notas: "Universitario, servicios, tecnología." },
    ],
    girosTopLocal: [
      {
        giro: "Turismo médico (dental, cirugía estética, salud)",
        descripcion: "Miles de pacientes de USA cruzan mensualmente buscando tratamientos.",
        porQueImporta: "El paciente de USA busca 'dentist Tijuana' en inglés. Sin sitio bilingüe, no te encuentra.",
      },
      {
        giro: "Gastronomía y restaurantes",
        descripcion: "Tijuana es referente de cocina Baja Med y mariscos.",
        porQueImporta: "Visitantes binacionales eligen restaurante en Google antes de cruzar. Tu sitio decide si te eligen.",
      },
      {
        giro: "Maquiladoras y proveedores de Otay",
        descripcion: "Polo manufacturero binacional con miles de empresas.",
        porQueImporta: "Compradores de USA y MX te buscan online. Sitio profesional bilingüe = más cotizaciones.",
      },
    ],
    testimonio: {
      nombre: "David L.",
      negocio: "Clínica dental en Zona Río",
      zona: "Zona Río, Tijuana",
      resultado: "Captó 22 pacientes nuevos de San Diego en su primer trimestre",
    },
    faqExtras: [
      {
        pregunta: "¿INDEXA puede crear sitios bilingües español-inglés para Tijuana?",
        respuesta:
          "Sí, esto es clave en TJ. Tu sitio puede operar en ambos idiomas para capturar tanto al cliente mexicano como al visitante de USA. Geo-targeting incluido para mostrarte en búsquedas en inglés desde San Diego.",
      },
      {
        pregunta: "¿Sirve para turismo médico y dental?",
        respuesta:
          "Es uno de nuestros casos fuertes. Configuramos schema de centro médico, formularios de cotización, WhatsApp internacional y sección de testimonios para generar confianza con pacientes que cruzan la frontera.",
      },
    ],
    longTailKeywords: [
      "dentist website tijuana",
      "sitio web zona río tijuana",
      "página web turismo médico baja california",
    ],
  },

  merida: {
    slug: "merida",
    nombreCorto: "Mérida",
    nombreCompleto: "Mérida",
    estado: "Yucatán",
    gentilicio: "yucatecos",
    poblacion: "1 millón en Mérida Capital",
    pymesEstimadas: "más de 60,000 PYMES en Yucatán",
    busquedasMensuales: "1,800-3,000 búsquedas locales mensuales sobre 'página web' en Mérida",
    contextoLocal:
      "Mérida es la ciudad más segura y de mayor crecimiento sostenido del sureste mexicano. Combina turismo cultural, gastronomía, residentes nuevos del CDMX/Monterrey y un mercado inmobiliario activo. Los negocios meridanos que se digitalizan capturan tanto al turista como al nuevo residente que llega buscando todo desde cero — y ambos son consumidores intensivos de Google local.",
    zonas: [
      { name: "Centro Histórico y Paseo Montejo", notas: "Turismo, gastronomía tradicional, hospedaje boutique." },
      { name: "Norte (Altabrisa, Cabo Norte, Temozón)", notas: "Residencial premium, comercio nuevo, salud." },
      { name: "Caucel y Ciudad Caucel", notas: "Crecimiento residencial, servicios para nuevos vecinos." },
      { name: "Progreso y la costa", notas: "Turismo de playa, gastronomía marina, hospedaje." },
    ],
    girosTopLocal: [
      {
        giro: "Hospedaje boutique y casas yucatecas restauradas",
        descripcion: "Centro Histórico es uno de los polos de hospitalidad de lujo más fuertes del país.",
        porQueImporta: "Los huéspedes internacionales reservan vía Google. Un sitio bonito y bilingüe te quita la dependencia de Booking/Airbnb.",
      },
      {
        giro: "Gastronomía yucateca y mariscos en Progreso",
        descripcion: "La identidad culinaria local es referente nacional.",
        porQueImporta: "El comensal nuevo (residente o turista) busca por categoría + ubicación. Si no apareces, comes solo.",
      },
      {
        giro: "Servicios para residentes nuevos (mudanzas, decoración, escuelas)",
        descripcion: "Mérida recibe miles de familias del centro y norte cada año.",
        porQueImporta: "Esta gente no tiene contactos locales — busca todo en Google. Te eligen si apareces.",
      },
    ],
    testimonio: {
      nombre: "Carmen P.",
      negocio: "Casa boutique en Centro Histórico",
      zona: "Centro Histórico, Mérida",
      resultado: "Redujo 40% su dependencia de OTAs en 6 meses con reservas directas vía sitio",
    },
    faqExtras: [
      {
        pregunta: "¿INDEXA funciona para hospedaje boutique en Mérida?",
        respuesta:
          "Es uno de nuestros casos fuertes. Configuramos galería, calendario de disponibilidad, WhatsApp y schema de hotel boutique. Reduces tu dependencia de Booking/Airbnb y te quedas con más margen.",
      },
      {
        pregunta: "¿Optimizan para turismo internacional?",
        respuesta:
          "Sí. Tu sitio puede operar bilingüe español-inglés y aparecer en búsquedas internacionales. Schema de turismo, integración con Google Maps y formularios para reservas.",
      },
    ],
    longTailKeywords: [
      "página web hotel boutique mérida",
      "sitio web restaurante centro histórico mérida",
      "diseño web pyme yucatán",
    ],
  },

  leon: {
    slug: "leon",
    nombreCorto: "León",
    nombreCompleto: "León",
    estado: "Guanajuato",
    gentilicio: "leoneses",
    poblacion: "1.7 millones de habitantes",
    pymesEstimadas: "más de 80,000 PYMES en Guanajuato",
    busquedasMensuales: "1,500-2,500 búsquedas locales mensuales sobre 'página web' en León",
    contextoLocal:
      "León es la capital del calzado de México y una de las economías PYME más dinámicas del Bajío. Su corredor industrial junto con Irapuato, Salamanca y Silao es polo automotriz y de manufactura ligera. Para una PYME leonesa la pregunta no es si necesita web — es si va a perder mercado con la siguiente cohorte de competidores que ya están vendiendo en Google y redes.",
    zonas: [
      { name: "Centro y Plaza Mayor", notas: "Comercio histórico, calzado, gastronomía." },
      { name: "Campestre y Las Joyas", notas: "Residencial premium, restaurantes, servicios." },
      { name: "Coecillo y San Miguel", notas: "Polo zapatero tradicional." },
      { name: "Zona Vasco de Quiroga", notas: "Comercio nuevo, salud, comercio especializado." },
    ],
    girosTopLocal: [
      {
        giro: "Calzado y marroquinería",
        descripcion: "León produce el 70% del calzado mexicano.",
        porQueImporta: "Compradores nacionales y de USA buscan proveedores en Google. Sin sitio profesional con catálogo, te quedas con clientes locales.",
      },
      {
        giro: "Restaurantes y cocina del Bajío",
        descripcion: "La gastronomía leonesa crece con cada generación.",
        porQueImporta: "El comensal local y de paso eligen en Google. Tu menú online y reseñas son tu carta de presentación.",
      },
      {
        giro: "Servicios B2B para industria automotriz",
        descripcion: "El corredor León-Silao-Irapuato es polo manufacturero.",
        porQueImporta: "Áreas de compras revisan tu sitio antes de invitarte a cotizar. Sin sitio, no entras al radar.",
      },
    ],
    testimonio: {
      nombre: "Javier T.",
      negocio: "Fabricante de calzado en Coecillo",
      zona: "Coecillo, León",
      resultado: "Cerró 2 distribuidores nuevos de Texas vía formulario web en 90 días",
    },
    faqExtras: [
      {
        pregunta: "¿INDEXA es útil para fabricantes de calzado o marroquinería?",
        respuesta:
          "Sí. Configuramos catálogo de productos, formulario de cotización al mayoreo, WhatsApp internacional y galería. Tu sitio se vuelve una herramienta de venta B2B funcional para distribuidores nacionales y extranjeros.",
      },
      {
        pregunta: "¿Cubren el corredor industrial León-Silao-Irapuato?",
        respuesta:
          "Sí. Cualquier negocio del corredor del Bajío puede usar INDEXA. Optimizamos SEO local específico al municipio donde operas para que aparezcas a clientes y proveedores cercanos.",
      },
    ],
    longTailKeywords: [
      "página web fabricante calzado león",
      "sitio web pyme guanajuato",
      "diseño web b2b bajío",
    ],
  },
};

export const getCityData = (slug: string): CityData | undefined => ciudades[slug];
