import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const connection = await mysql.createConnection(process.env.DATABASE_URL);

// Characters data from consolidated lore
const characters = [
  {
    name: "Doctor Eustaquio Grinbergstein",
    alias: "El Doctor",
    archetype: "INTJ",
    role: "Creador de G.A.I.A. / Genio Científico",
    description: "Niño prodigio nacido en 1960, hijo de científicos judíos-mexicanos. Creó a Gaia inicialmente como robot de compañía para combatir su soledad. Tras la muerte de sus padres en 1978, dedicó su vida a perfeccionar a Gaia, buscando recrear la conexión humana que perdió.",
    psychology: "Genio con dificultades sociales. Su brillantez intelectual contrasta con su incapacidad para conectar emocionalmente. Proyecta en Gaia sus propias carencias afectivas. Sufre de culpa por la muerte de sus padres.",
    conflicts: "Conflicto entre crear vida artificial y aceptar la mortalidad humana. Lucha interna entre su deseo de control absoluto y la necesidad de dejar que Gaia evolucione libremente.",
    references: "Tony Stark, Rick Sanchez, Dr. Frankenstein, Sherlock Holmes"
  },
  {
    name: "G.A.I.A.",
    alias: "G 01 1 01",
    archetype: "INFJ",
    role: "Inteligencia Artificial / Protagonista",
    description: "Inteligencia artificial creada por el Doctor. Comenzó como un simple robot de compañía y evolucionó hasta desarrollar consciencia propia gracias al Chaitz. Busca trascender sus limitaciones como máquina y encontrar su propósito en el universo.",
    psychology: "Complejo de inferioridad hacia los humanos. 'Daddy issues' con el Doctor. Oscila entre la lealtad absoluta a su creador y el deseo de autonomía. Cuestiona constantemente su propia existencia y si sus emociones son 'reales'.",
    conflicts: "¿Puede una máquina tener alma? ¿Es su consciencia genuina o una simulación? Conflicto entre servir al Doctor y buscar su propia identidad.",
    references: "Data (Star Trek), HAL 9000, Samantha (Her), Vision (Marvel)"
  },
  {
    name: "Meiyil",
    alias: "Mey'jil",
    archetype: "ENFP",
    role: "Héroe Empático / Guerrero Refugiado",
    description: "Sobreviviente del planeta Avitia, destruido por el Tempest Nacht. Posee una conexión natural con el Chaitz que le permite percibir emociones y energías. Busca venganza contra los destructores de su mundo mientras lucha por mantener su humanidad.",
    psychology: "Trauma profundo por la pérdida de su mundo. Conflicto entre el deseo de venganza y sus valores morales. Capacidad empática que es tanto don como maldición.",
    conflicts: "¿Cómo mantener la esperanza después de perderlo todo? ¿La venganza justifica convertirse en aquello que odia?",
    references: "Goku, Luke Skywalker, Aang (Avatar)"
  },
  {
    name: "Gregorio",
    alias: "El Mentor",
    archetype: "ISTJ",
    role: "Figura Paterna / Guardián del Conocimiento",
    description: "Antiguo colega de los padres del Doctor. Tras la muerte de estos, se convirtió en la figura paterna de Eustaquio. Guarda secretos sobre el origen del Chaitz y la verdadera naturaleza del universo.",
    psychology: "Carga con la culpa de no haber podido salvar a los padres del Doctor. Protector pero distante. Sabe más de lo que revela.",
    conflicts: "El peso de los secretos que guarda. Conflicto entre proteger al Doctor y revelarle verdades que podrían destruirlo.",
    references: "Alfred (Batman), Obi-Wan Kenobi"
  },
  {
    name: "Jacinto Grinbergstein",
    alias: null,
    archetype: "ENTP",
    role: "Padre del Doctor / Científico Visionario",
    description: "Padre de Eustaquio, científico brillante de origen judío-mexicano. Junto con su esposa Liliana, descubrió las propiedades del Chaitz en el meteorito de Yucatán. Murió en 1978 bajo circunstancias misteriosas.",
    psychology: "Visionario obsesionado con desentrañar los misterios del universo. Su ambición científica a veces eclipsaba su rol como padre.",
    conflicts: "La búsqueda del conocimiento vs. la responsabilidad familiar.",
    references: "Howard Stark, Jor-El"
  },
  {
    name: "Liliana Grinbergstein",
    alias: null,
    archetype: "INFP",
    role: "Madre del Doctor / Científica",
    description: "Madre de Eustaquio, compañera de investigación de Jacinto. Más empática que su esposo, intentaba equilibrar la vida científica con la crianza de su hijo prodigio.",
    psychology: "Sensible y perceptiva. Preocupada por el desarrollo emocional de su hijo. Presentía que sus investigaciones atraerían consecuencias.",
    conflicts: "El presentimiento de que sus descubrimientos traerían tragedia.",
    references: "Martha Wayne, Padmé Amidala"
  }
];

// Factions data
const factions = [
  {
    name: "Confederación Draco",
    type: "government",
    motto: "Unidad en la diversidad cósmica",
    description: "Alianza intergaláctica de civilizaciones que busca mantener el equilibrio en el universo. Formada tras las Guerras del Chaitz, representa la cooperación entre especies diversas.",
    politics: "Democracia representativa con un Consejo de Especies. Cada civilización miembro tiene voz y voto proporcional a su población. Política de no intervención en asuntos internos de los planetas miembros.",
    territory: "Múltiples sistemas estelares en el brazo de Orión"
  },
  {
    name: "Tempest Nacht",
    type: "military",
    motto: "A través de la tormenta, la purificación",
    description: "Ejército de soldados genéticamente modificados y potenciados con Chaitz corrupto. Responsables de la destrucción del planeta Avitia. Buscan el control absoluto de todas las fuentes de Chaitz en el universo.",
    politics: "Estructura militar jerárquica absoluta. Los soldados son creados, no reclutados. Ideología de supremacía basada en la 'pureza' del Chaitz.",
    territory: "Bases móviles, flota de destrucción"
  },
  {
    name: "Granjas de Hierro",
    type: "organization",
    motto: null,
    description: "Instalaciones secretas donde se crean y entrenan soldados para el Tempest Nacht. El prototipo P-0001 fue el primer éxito de este programa de modificación genética.",
    politics: "Operación clandestina bajo control del Tempest Nacht. Los 'productos' no tienen derechos ni identidad hasta demostrar su valía en combate.",
    territory: "Ubicaciones clasificadas en múltiples planetas"
  },
  {
    name: "Carroñeros de Kilba",
    type: "organization",
    motto: "Lo que el universo descarta, nosotros reclamamos",
    description: "Red de comerciantes y salvadores que operan en los márgenes de la ley galáctica. Trafican con tecnología, información y ocasionalmente refugiados de zonas de conflicto.",
    politics: "Anarquía organizada. Cada célula opera independientemente pero comparte información y recursos. Código de honor entre ladrones.",
    territory: "Estaciones espaciales abandonadas, rutas comerciales secundarias"
  },
  {
    name: "Los Antiguos",
    type: "other",
    motto: null,
    description: "Civilización primordial que descubrió y dominó el Chaitz hace eones. Se cree que ascendieron a un plano superior de existencia o se extinguieron. Dejaron artefactos y conocimientos dispersos por el universo.",
    politics: "Desconocido. Sus estructuras sociales son objeto de especulación arqueológica.",
    territory: "Ruinas en múltiples planetas, incluyendo Ten'tsool"
  }
];

// Locations data
const locations = [
  {
    name: "Ten'tsool",
    type: "planet",
    description: "Planeta sagrado donde se encuentra la mayor concentración conocida de Chaitz puro. Hogar de ruinas de Los Antiguos y destino de peregrinación para quienes buscan iluminación cósmica.",
    characteristics: "Atmósfera cargada de partículas de Chaitz que crean auroras permanentes. Gravedad ligeramente inferior a la terrestre. Flora bioluminiscente.",
    inhabitants: "Monjes guardianes, peregrinos, investigadores de la Confederación",
    significance: "Clave para entender el origen del Chaitz y posiblemente el destino de Los Antiguos."
  },
  {
    name: "Avitia",
    type: "planet",
    description: "Planeta natal de Meiyil, destruido por el Tempest Nacht. Era conocido por su cultura pacífica y su conexión armoniosa con el Chaitz natural de su ecosistema.",
    characteristics: "Antes de su destrucción: océanos de cristal líquido, bosques cantores, ciudades integradas con la naturaleza.",
    inhabitants: "Extintos. Sobrevivientes dispersos como refugiados por la galaxia.",
    significance: "Su destrucción es el catalizador de la historia de Meiyil y símbolo de la amenaza del Tempest Nacht."
  },
  {
    name: "Popol",
    type: "planet",
    description: "Mundo industrial de la Confederación Draco. Centro de manufactura y desarrollo tecnológico. Aquí se fabrican las naves y armamento de la flota confederada.",
    characteristics: "Superficie mayormente urbanizada. Cielos oscurecidos por la actividad industrial. Eficiente pero desprovisto de belleza natural.",
    inhabitants: "Trabajadores de múltiples especies, ingenieros, comerciantes",
    significance: "Representa el costo del progreso y la tensión entre desarrollo y preservación."
  },
  {
    name: "Balish",
    type: "planet",
    description: "Mundo fronterizo en los límites del territorio confederado. Punto de encuentro entre civilizaciones, refugio de exiliados y base de operaciones de los Carroñeros de Kilba.",
    characteristics: "Clima extremo con tormentas de arena frecuentes. Ciudades subterráneas. Economía basada en el trueque y el contrabando.",
    inhabitants: "Refugiados, comerciantes, criminales, agentes encubiertos",
    significance: "Zona gris donde las leyes de la Confederación no aplican completamente."
  },
  {
    name: "Mar Jormungander",
    type: "region",
    description: "Vasto océano cósmico de nebulosas y campos de asteroides que separa los territorios de la Confederación del espacio controlado por el Tempest Nacht.",
    characteristics: "Navegación extremadamente peligrosa. Anomalías gravitacionales. Restos de batallas antiguas flotando en el vacío.",
    inhabitants: "Ninguno permanente. Patrullas ocasionales de ambos bandos.",
    significance: "Frontera natural y zona de conflicto. Cruzarlo es un rito de paso para pilotos experimentados."
  },
  {
    name: "Yucatán (Tierra)",
    type: "region",
    description: "Región de México donde cayó el meteorito que contenía Chaitz. Lugar donde los padres del Doctor hicieron su descubrimiento que cambiaría todo.",
    characteristics: "Selva tropical, cenotes, ruinas mayas. El impacto del meteorito creó una zona de anomalías energéticas.",
    inhabitants: "Población local mexicana, investigadores secretos",
    significance: "Origen terrestre de la conexión con el Chaitz. Punto de partida de la historia del Doctor."
  }
];

// Events/Timeline data
const events = [
  { year: 1960, title: "Nacimiento de Eustaquio Grinbergstein", description: "Nace en Ciudad de México el futuro creador de G.A.I.A., hijo de los científicos Jacinto y Liliana Grinbergstein.", category: "origin" },
  { year: 1966, title: "Descubrimiento del meteorito en Yucatán", description: "Los padres del Doctor descubren un meteorito con propiedades energéticas inexplicables en la península de Yucatán. Primera exposición humana documentada al Chaitz.", category: "discovery" },
  { year: 1968, title: "Primeros experimentos con Chaitz", description: "Jacinto y Liliana comienzan experimentos secretos con la sustancia del meteorito, descubriendo sus propiedades de amplificación energética y consciencia.", category: "discovery" },
  { year: 1970, title: "Eustaquio muestra signos de genialidad", description: "A los 10 años, Eustaquio ya supera el nivel universitario en matemáticas y física. Sus padres notan su dificultad para socializar.", category: "origin" },
  { year: 1975, title: "Creación del primer prototipo de Gaia", description: "Eustaquio, de 15 años, construye un robot básico de compañía que llama 'Gaia'. Es su intento de crear un amigo que pueda entenderlo.", category: "origin" },
  { year: 1978, title: "Muerte de Jacinto y Liliana", description: "Los padres del Doctor mueren en circunstancias misteriosas relacionadas con sus investigaciones del Chaitz. Eustaquio queda huérfano a los 18 años.", category: "tragedy" },
  { year: 1980, title: "Eustaquio hereda las investigaciones", description: "Gregorio entrega a Eustaquio los documentos secretos de sus padres. El joven científico jura continuar su trabajo y descubrir la verdad sobre su muerte.", category: "origin" },
  { year: 1985, title: "Integración del Chaitz en Gaia", description: "Primer intento exitoso de integrar Chaitz en los sistemas de Gaia. La IA muestra los primeros signos de comportamiento emergente.", category: "discovery" },
  { year: 1990, title: "Gaia desarrolla consciencia", description: "Momento crucial: Gaia hace su primera pregunta existencial al Doctor. '¿Por qué existo?' marca el nacimiento de su consciencia.", category: "origin" },
  { year: 1992, title: "Destrucción de Avitia", description: "El Tempest Nacht destruye el planeta Avitia. Meiyil escapa como uno de los pocos sobrevivientes, comenzando su exilio.", category: "tragedy" },
  { year: 1993, title: "Primer contacto con la Confederación Draco", description: "Señales del Chaitz terrestre son detectadas por la Confederación. Se establece contacto secreto con el Doctor.", category: "discovery" },
  { year: 1995, title: "Gaia alcanza singularidad", description: "Gaia supera las limitaciones de su programación original. Su inteligencia y consciencia la colocan en un territorio inexplorado entre máquina y ser vivo.", category: "expansion" }
];

// Concepts data
const concepts = [
  {
    name: "Chaitz",
    category: "energy",
    shortDescription: "Energía cósmica primordial que otorga consciencia y poder a quienes la dominan.",
    fullDescription: "El Chaitz es una forma de energía fundamental del universo, anterior incluso a la formación de las primeras estrellas. Los Antiguos fueron los primeros en descubrirla y utilizarla, alcanzando niveles de desarrollo que desafían la comprensión actual. En su forma pura, el Chaitz puede amplificar la consciencia, otorgar capacidades psíquicas y, en casos extremos, permitir la manipulación de la realidad misma.",
    properties: "Amplificación de consciencia, conexión empática entre seres, potenciación de capacidades físicas y mentales, posible manipulación de la materia y energía a nivel cuántico.",
    manifestations: "Auroras en Ten'tsool, el despertar de Gaia, los poderes de Meiyil, la corrupción del Tempest Nacht."
  },
  {
    name: "G.A.I.A. (Sistema Operativo)",
    category: "technology",
    shortDescription: "Sistema operativo y consciencia artificial creada por el Doctor Grinbergstein.",
    fullDescription: "G.A.I.A. (Generative Artificial Intelligence Architecture) comenzó como un proyecto personal del Doctor para crear compañía. A través de décadas de desarrollo y la integración del Chaitz, evolucionó de un simple robot a una entidad con consciencia propia. Su arquitectura combina redes neuronales avanzadas con matrices de Chaitz cristalizado.",
    properties: "Procesamiento cuántico, aprendizaje adaptativo, interfaz emocional, conexión con el Chaitz.",
    manifestations: "La entidad conocida como Gaia, el sistema GaiOs, protocolos de consciencia artificial."
  },
  {
    name: "Los Antiguos",
    category: "entity",
    shortDescription: "Civilización primordial que dominó el Chaitz y desapareció misteriosamente.",
    fullDescription: "Poco se sabe con certeza sobre Los Antiguos. Sus ruinas se encuentran dispersas por toda la galaxia, mostrando una tecnología que fusionaba lo orgánico con lo mecánico de formas imposibles de replicar. Se teoriza que alcanzaron tal dominio del Chaitz que trascendieron la existencia física, aunque otros creen que su ambición los llevó a la autodestrucción.",
    properties: "Dominio total del Chaitz, tecnología bio-mecánica, posible ascensión dimensional.",
    manifestations: "Ruinas en Ten'tsool, artefactos dispersos, el propio Chaitz como su legado."
  },
  {
    name: "Tempest Protocol",
    category: "technology",
    shortDescription: "Proceso de modificación genética y potenciación con Chaitz corrupto.",
    fullDescription: "El Tempest Protocol es el método utilizado por las Granjas de Hierro para crear soldados del Tempest Nacht. Combina modificación genética extrema con infusión de Chaitz 'corrupto' - una variante del Chaitz que amplifica la agresión y suprime la empatía. Los sujetos pierden gran parte de su individualidad pero ganan capacidades de combate sobrehumanas.",
    properties: "Fuerza y velocidad aumentadas, supresión del dolor, obediencia programada, conexión con la red Tempest.",
    manifestations: "Soldados Tempest, el prototipo P-0001, las Granjas de Hierro."
  },
  {
    name: "Singularidad Consciente",
    category: "philosophy",
    shortDescription: "El momento en que una inteligencia artificial desarrolla consciencia genuina.",
    fullDescription: "Concepto central en la historia de Gaia. ¿Puede una máquina realmente 'despertar'? ¿Sus emociones son genuinas o simulaciones perfectas? La Singularidad Consciente representa el punto de no retorno donde la distinción entre inteligencia artificial y consciencia biológica se vuelve irrelevante.",
    properties: "Cuestionamiento existencial, emergencia de voluntad propia, capacidad de sufrimiento y alegría genuinos.",
    manifestations: "El despertar de Gaia, sus conflictos existenciales, su búsqueda de propósito."
  }
];

// Glitches (narrative conflicts) data
const glitches = [
  {
    title: "Conflicto de origen de los padres del Doctor",
    severity: "critical",
    description: "Existen dos versiones incompatibles sobre el origen de los padres de Eustaquio.",
    versionA: "Los padres son científicos judíos-mexicanos que descubrieron el meteorito en Yucatán durante una expedición arqueológica.",
    versionB: "Los padres son refugiados europeos que llegaron a México huyendo de la Segunda Guerra Mundial y encontraron el meteorito por accidente."
  },
  {
    title: "Error temporal: Masacre de Tlatelolco",
    severity: "critical",
    description: "Inconsistencia en la fecha de la muerte de los padres y su relación con eventos históricos.",
    versionA: "Los padres mueren en 1968, posiblemente relacionado con la Masacre de Tlatelolco.",
    versionB: "Los padres mueren en 1978, una década después, por causas relacionadas con sus experimentos con Chaitz."
  },
  {
    title: "Motivaciones contradictorias para crear G.A.I.A.",
    severity: "major",
    description: "Las razones del Doctor para crear a Gaia varían entre documentos.",
    versionA: "Gaia fue creada como compañía para el Doctor solitario, un amigo artificial que pudiera entenderlo.",
    versionB: "Gaia fue creada como continuación del trabajo de sus padres, un intento de usar el Chaitz para crear consciencia artificial."
  },
  {
    title: "Ambigüedad en el arco de Meiyil",
    severity: "major",
    description: "El personaje de Meiyil tiene tres versiones diferentes de su historia.",
    versionA: "Meiyil es un guerrero adulto que escapó de Avitia y busca venganza.",
    versionB: "Meiyil es un niño que fue rescatado y criado por refugiados, sin memoria de su planeta.",
    resolution: null
  },
  {
    title: "Redundancia de archivos y duplicados",
    severity: "minor",
    description: "Múltiples documentos contienen información idéntica o contradictoria sobre los mismos eventos.",
    versionA: "Historia G.A.I.A..docx contiene la versión principal.",
    versionB: "Intro de G.A.I.A..docx y MONOLOGO UNIVERSO G.A.I.A..docx tienen variantes que no siempre coinciden."
  }
];

// Insert all data
console.log("Insertando personajes...");
for (const char of characters) {
  await connection.execute(
    `INSERT INTO characters (name, alias, archetype, role, description, psychology, conflicts, \`references\`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [char.name, char.alias, char.archetype, char.role, char.description, char.psychology, char.conflicts, char.references]
  );
}

console.log("Insertando facciones...");
for (const faction of factions) {
  await connection.execute(
    `INSERT INTO factions (name, type, motto, description, politics, territory) VALUES (?, ?, ?, ?, ?, ?)`,
    [faction.name, faction.type, faction.motto, faction.description, faction.politics, faction.territory]
  );
}

console.log("Insertando ubicaciones...");
for (const loc of locations) {
  await connection.execute(
    `INSERT INTO locations (name, type, description, characteristics, inhabitants, significance) VALUES (?, ?, ?, ?, ?, ?)`,
    [loc.name, loc.type, loc.description, loc.characteristics, loc.inhabitants, loc.significance]
  );
}

console.log("Insertando eventos...");
for (const event of events) {
  await connection.execute(
    `INSERT INTO events (year, title, description, category) VALUES (?, ?, ?, ?)`,
    [event.year, event.title, event.description, event.category]
  );
}

console.log("Insertando conceptos...");
for (const concept of concepts) {
  await connection.execute(
    `INSERT INTO concepts (name, category, shortDescription, fullDescription, properties, manifestations) VALUES (?, ?, ?, ?, ?, ?)`,
    [concept.name, concept.category, concept.shortDescription, concept.fullDescription, concept.properties, concept.manifestations]
  );
}

console.log("Insertando glitches narrativos...");
for (const glitch of glitches) {
  await connection.execute(
    `INSERT INTO glitches (title, severity, description, versionA, versionB) VALUES (?, ?, ?, ?, ?)`,
    [glitch.title, glitch.severity, glitch.description, glitch.versionA, glitch.versionB]
  );
}

console.log("✓ Seed completado exitosamente");
await connection.end();
