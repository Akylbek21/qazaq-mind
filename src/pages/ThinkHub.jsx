import React from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ======================== САҚТАУ / УТИЛИТ ======================== */
const LS_UNLOCKS = "abai_sq_unlocks_v1";
const load = () => { try { return JSON.parse(localStorage.getItem(LS_UNLOCKS) || "{}"); } catch { return {}; } };
const save = (v) => localStorage.setItem(LS_UNLOCKS, JSON.stringify(v));

/* ========================== ДЕРЕК/ВИКТОРИНА ====================== */
/* image: /public ішіне салынған суреттер — /1.jpg, /2.jpg, /3.jpg, /4.jpg  */
const QUIZZES = [
  {
    id: "jusan-iisi",
    title: "«Жусан иісі» — Сайын Мұратбеков",
    cover: "/1.jpg",
    threshold: 8,
    introHtml: `
      <h3 class="text-xl font-bold text-slate-900">Жусан иісі</h3>
      <p class="mt-2 text-slate-700">
        «Жусан иісі» – қазақ жазушысы Сайын Мұратбековтің балалық шақ пен ауыл өмірін 
        бейнелейтін лирикалық әңгімесі. Басты кейіпкер Аян – тағдырдың тауқыметін ерте 
        сезінген, жетімдік пен соғыстың салқынын көрген, бірақ соған қарамастан ішкі 
        мейірімін, ар-намысын жоғалтпаған бала.
      </p>
      <p class="mt-2 text-slate-700">
        Атаудағы «жусан иісі» символдық бейне: ол туған жердің тынысы, балалықтың 
        тазалығы мен өткенге деген сағыныш сезімін жеткізеді. Автор ауыл тіршілігінің 
        қарапайым көріністері арқылы адамгершілік, төзім, еңбекқорлық сияқты құндылықтарды 
        алға тартады.
      </p>
      <div class="mt-3 grid md:grid-cols-2 gap-4">
        <div>
          <h4 class="font-semibold text-slate-900">Кілт тақырыптар</h4>
          <ul class="mt-1 list-disc list-inside text-slate-700">
            <li>Балалық шақ, жетімдік, соғыс жылдарының салқыны</li>
            <li>Туған жерге сағыныш, естеліктің күші</li>
            <li>Еңбек, төзім, қарапайымдық пен мейірім</li>
            <li>Достық: Аян мен ауыл балаларымен қарым-қатынас</li>
            <li>Символ: жусан иісі – өткенге апаратын «көшеткі»</li>
          </ul>
        </div>
        <div>
          <h4 class="font-semibold text-slate-900">Кейіпкерлер</h4>
          <ul class="mt-1 list-disc list-inside text-slate-700">
            <li><b>Аян</b> – төзімді, сезімтал, қайсар бала</li>
            <li><b>Қозыбақ</b> – құрбы, достықтың тірегі (кей нұсқада)</li>
            <li><b>Ауыл адамдары</b> – орта, құндылықтар көзі</li>
          </ul>
          <h4 class="mt-3 font-semibold text-slate-900">Кеңістік/уақыт</h4>
          <p class="text-slate-700">Соғыс жылдары, қазақ ауылының тынысы.</p>
        </div>
      </div>
      <p class="mt-3 text-slate-700">
        <b>Неге оқу керек?</b> Бұл әңгіме арқылы оқушы «иіс» сияқты нәзік сезімдік детальдің 
        үлкен идеяны – сағыныш пен естелікті – қалай арқалай алатынын көреді. 
      </p>
    `,
    questions: [
      { q: "🌿 + 👃 = ? — атаудың негізгі идеясына қатысы?", options: [
        "«Жусан иісі» – балалық пен сағыныш белгісі",
        "«Жусан иісі» – соғыс кезіндегі ауыр тұрмыс көрінісі",
        "«Жусан иісі» – табиғаттың хош иісін суреттеу",
        "«Жусан иісі» – достық символы",
      ], a: 0, exp: "Жусан – туған жер, балалық шақты еске түсіретін ностальгиялық иіс." },
      { q: "Фото-тапсырма: көрініс қай тұсты еске салады?", image: "/1.jpg", options: [
        "Аянның балалық шағы", "Соғыс жылдарындағы ауыл өмірі", "Соғыстан кейінгі кезең", "Қозыбақтың ауылға келуі",
      ], a: 1, exp: "Дала мен жусан — соғыс жылдарындағы сағыныштың символы." },
      { q: "🦊 + 💪 + 😢 — ребустегі кейіпкер?", options: ["Аян","Қозыбақ","Шолпан","Автор"], a: 0, exp: "Аян — айлакер, төзімді, мұңды." },
      { q: "«Жусан иісі Аянға бала күнін еске түсірді…» — тәсіл?", options: ["Метафора","Эпитет","Символ","Перифраз"], a: 2, exp: "Жусан иісі — өткенге сағыныштың символы." },
      { q: "Аянның ауыр жағдайы оны қандай адам етті?", options: ["Ренжігіш, тұйық","Төзімді, еңбекқор","Өшпенді, қатал","Немқұрайлы"], a: 1, exp: "Қиындықтар оны шыңдайды." },
      { q: "Оқиғаларды дұрыс ретте:", options: ["2-3-4-1","3-2-4-1","1-3-2-4","2-4-1-3"], a: 1, exp: "3 → 2 → 4 → 1." },
      { q: "😢 + 🌿 + 🏡 — идея?", options: [
        "Балалық сағыныш пен туған жерге сүйіспеншілік","Соғыстың жеңісі","Табиғат сұлулығы","Жетімнің кек алуы",
      ], a: 0 },
      { q: "«Ертегі айтқан сайын… көзіне жас» — күй?", options: ["Қорқыныш","Сағыныш пен мұң","Реніш","Қуаныш"], a: 1 },
      { q: "Аян орнына — өмір жолын қалай өзгертер едің?", options: [
        "Соғысқа кетер едім","Ауылда қалып, ертегі айту","Жаңа өмір бастау","Өткенді ұмытпауға тырысу",
      ], a: 3, exp: "Өткен — оның болмысының бөлігі." },
      { q: "👦 + 🌿 + 💭 + 🕰️ — негізгі идея?", options: [
        "Өмірдің өткіншілігі","Соғыс — зұлмат","Естеліктің мәңгілігі, балалық сағыныш","Табиғат пен адам бірлігі",
      ], a: 2 },
    ],
  },

  {
    id: "ushkan-uia",
    title: "«Ұшқан ұя» — Бауыржан Момышұлы",
    cover: "/2.jpg",
    threshold: 8,
    introHtml: `
      <h3 class="text-xl font-bold text-slate-900">«Ұшқан ұя»</h3>
      <p class="mt-2 text-slate-700">
        Мемуарлық сипаттағы шығармада автор өзінің балалық шағын, отбасы тәрбиесін, 
        ұлттық салт-дәстүр мен әдептің тұлға қалыптастырудағы орнын баяндайды. 
        «Ұя» – рухани бастау, адамдық мінездің қаланатын ошағы; «ұшу» – ержетіп, 
        өмір жолына аттану астары.
      </p>
      <p class="mt-2 text-slate-700">
        Ең көрнекті бейнелердің бірі – <b>Бопай әже</b>: даналықтың, ұлағаттың символы. 
        Әженің әңгімелері, батасы, тыйым-ырымдары – ұлттық педагогиканың тірі мектебі. 
        Кітапта еңбекке баулу, үлкенді сыйлау, ұят, намыс, жауапкершілік секілді 
        құндылықтар жүйелі көрініс табады.
      </p>
      <div class="mt-3 grid md:grid-cols-2 gap-4">
        <div>
          <h4 class="font-semibold text-slate-900">Кілт тақырыптар</h4>
          <ul class="mt-1 list-disc list-inside text-slate-700">
            <li>Отбасы құндылығы, ұрпақ сабақтастығы</li>
            <li>Ұлттық дәстүр, тіліміз бен діліміз</li>
            <li>Еңбек, тәртіп, жауапкершілік</li>
            <li>Рух, намыс, батылдықтың бастауын түсіндіру</li>
          </ul>
        </div>
        <div>
          <h4 class="font-semibold text-slate-900">Символика</h4>
          <ul class="mt-1 list-disc list-inside text-slate-700">
            <li><b>Ұя</b> – отбасы, тәрбиенің гүлі</li>
            <li><b>Ұшу</b> – ересек өмірге қадам, өз жолын табу</li>
          </ul>
          <h4 class="mt-3 font-semibold text-slate-900">Кейіпкерлер</h4>
          <p class="text-slate-700">Бауыржан (әңгімелеуші), Бопай әже, әке-шеше, ауыл адамдары.</p>
        </div>
      </div>
      <p class="mt-3 text-slate-700">
        <b>Қорытынды идея:</b> «Ұяда не көрсең, ұшқанда соны ілерсің» – отбасы мен 
        дәстүрден басталған тәрбие кейін бүкіл өміріңе бағыт береді.
      </p>
    `,
    questions: [
      { q: "🏠 + 🕊️ — атаумен байланысы?", options: [
        "Отбасылық тәрбие мен рухани бастау","Соғыс тақырыбы","Ерлік пен батырлық","Табиғат көрінісі",
      ], a: 0, exp: "Ұя — тәрбие ошағы." },
      { q: "Фото сұрақ: Әже — Бопай байланысты идея?", image: "/2.jpg", options: [
        "Әже — Бопай; тәрбие көпірі","Әке — Момыш; батырлық","Бауыржан — балалық шақ","Ауыл — тыныштық",
      ], a: 0 },
      { q: "«Әжемнің әңгімелері…» нені көрсетеді?", options: [
        "Аңыз-ертегілердің тәрбиелік маңызы","Әженің даналығы, рухани ұстаздығы","Тарихи шындық","Соғыс кезі",
      ], a: 1 },
      { q: "💭 + 🧕 + 📖 — кім?", options: ["Бопай әже","Бауыржан","Момыш","Жиенбай"], a: 0 },
      { q: "Бауыржанның негізгі тәрбие көзі?", options: [
        "Мектеп пен кітап","Халық ауыз әдебиеті, үлкендердің өнегесі","Соғыс туралы әңгімелер","Достар ықпалы",
      ], a: 1 },
      { q: "«Ұя» нені білдіреді?", options: [
        "Ауыл көрінісі","Отбасы, туыстық, рухани байланыс","Табиғи құбылыс","Балалық естелік",
      ], a: 1 },
      { q: "«Ұяда не көрсең…» нақыл мағынасы?", options: [
        "Тәрбиенің өмірдегі рөлін көрсетеді","Батырлық себебі","Жай еске алу","Уақыт өткіншілігі",
      ], a: 0 },
      { q: "😢 + ❤️ + 👵 + 🧒 — сезім?", options: [
        "Сағыныш пен аналық мейірім","Қайғы мен өлім","Батырлық рух","Кек пен ыза",
      ], a: 0 },
      { q: "Уақыт желісі:", options: ["3-1-2-4","1-3-2-4","3-2-1-4","4-3-1-2"], a: 0 },
      { q: "Негізгі идея?", options: [
        "Ана мен әже тәрбиесінің рухани күші","Батырлық пен соғыс","Табиғат пен ауыл","Достық пен махаббат",
      ], a: 0 },
    ],
  },

  {
    id: "ai-men-aisha",
    title: "«Ай мен Айша» — Шерхан Мұртаза",
    cover: "/3.jpg",
    threshold: 8,
    introHtml: `
      <h3 class="text-xl font-bold text-slate-900">«Ай мен Айша»</h3>
      <p class="mt-2 text-slate-700">
        Роман-естелікте автор анасы <b>Айша</b> бейнесі арқылы соғыс жылдарындағы 
        қазақ әйелінің тағдырын, төзімі мен мейірімін, ұлт рухының беріктігін суреттейді. 
        Әке майданға аттанғаннан кейінгі аштық, көш, жазық дала, жұрттың күйкі тұрмысы 
        – бәрі баланың көзқарасымен де, есейген зердемен де беріледі.
      </p>
      <p class="mt-2 text-slate-700">
        <b>«Ай»</b> – үміт пен нұрдың, тазалық пен мейірімнің символы. Айша – сол нұрдың 
        адам кейпіндегі көрінісі. Ана махаббаты мен сабыры – отбасын ғана емес, 
        баланың болашағын да аман сақтайтын күш ретінде бейнеленеді.
      </p>
      <div class="mt-3 grid md:grid-cols-2 gap-4">
        <div>
          <h4 class="font-semibold text-slate-900">Кілт тақырыптар</h4>
          <ul class="mt-1 list-disc list-inside text-slate-700">
            <li>Соғыс зардабы, жоқшылық, көшу</li>
            <li>Ана мейірімі, рухтың беріктігі</li>
            <li>Үміт, жарық, ар-ождан</li>
            <li>Балалықтан есейуге дейінгі сапар</li>
          </ul>
        </div>
        <div>
          <h4 class="font-semibold text-slate-900">Символика</h4>
          <ul class="mt-1 list-disc list-inside text-slate-700">
            <li><b>Ай</b> – нұр, үміт, бағыт</li>
            <li><b>Шам/жарық</b> – қиындық түнегіндегі сенім оты</li>
          </ul>
          <h4 class="mt-3 font-semibold text-slate-900">Кейіпкерлер</h4>
          <p class="text-slate-700">Айша (ана), бала-әңгімелеуші (Шера), ауыл адамдары.</p>
        </div>
      </div>
      <p class="mt-3 text-slate-700">
        <b>Қорытынды идея:</b> Ана жүрегі – ұлттың жүрегі; соғыс та, жоқшылық та әлсірете 
        алмаған мейірім нұры ұрпақ жадында мәңгі қалады.
      </p>
    `,
    questions: [
      { q: "🌙 + 👩 — атаудың астары?", options: [
        "Ай – ананың нұры, Айша – сол мейірімнің бейнесі","Ай – соғыс символы","Айша – жай есім","Ай мен Айша – табиғат-адам байланысы",
      ], a: 0 },
      { q: "Фото сұрақ: идеямен сабақтас?", image: "/3.jpg", options: [
        "Соғыстың салқыны мен ананың тағдыры","Табиғат","Романтика","Мереке",
      ], a: 0 },
      { q: "«Көз жасы мен Ай нұры…» — тәсіл?", options: ["Эпитет","Метафора","Теңеу","Аллегория"], a: 1 },
      { q: "🌾 + 💧 + ❤️ + 👩‍👦 — кім?", options: ["Айша","Ай","Шераның анасы","Әже"], a: 0 },
      { q: "Тарихи кезең?", options: ["ҰОС және кейінгі жылдар","Тәуелсіздік","Кеңес дәуірінің соңы","Ашаршылық"], a: 0 },
      { q: "«Ай» нені білдіреді?", options: [
        "Табиғат көрінісі","Анаға бағытталған үміт пен сағыныш","Балалық естелік","Өлім символы",
      ], a: 1 },
      { q: "«Ана — жердің жүзі…» ойы?", options: ["Ана мен табиғат ұқсастығы","Дін","Ғарыш","Сұлулық сипат"], a: 0 },
      { q: "Оқиға реті:", options: ["4-2-1-3","1-4-2-3","2-4-1-3","4-1-2-3"], a: 0 },
      { q: "😢 + 🌙 + 🕯️ — тақырып?", options: [
        "Ана махаббаты мен өмірге сенім","Табиғат сұлулығы","Соғыс қасіреті мен өлім","Әділетсіздік",
      ], a: 0 },
      { q: "Негізгі идея?", options: [
        "Соғыс зардабы мен ананың мейірімі","Тарихи деректер","Табиғат","Махаббат",
      ], a: 0 },
    ],
  },

  {
    id: "balalyq-saiakhat",
    title: "«Балалық шаққа саяхат» — Естелік проза",
    cover: "/4.jpg",
    threshold: 8,
    introHtml: `
      <h3 class="text-xl font-bold text-slate-900">«Балалық шаққа саяхат»</h3>
      <p class="mt-2 text-slate-700">
        Естелік прозада автор өзінің бала күндерінің қуанышы мен қиын сәттерін, 
        отбасы мен ауыл тіршілігін, мектептегі қызықтарды шынайы әрі жылы юмормен 
        баяндап, оқырманды өткенге «рухани саяхатқа» жетелейді.
      </p>
      <p class="mt-2 text-slate-700">
        Шығармада бала санасының тазалығы, достыққа адалдық, еңбекке баулу, 
        ата-анаға құрмет сияқты құндылықтар көркем эпизодтар арқылы ашылады. 
        <b>«Жол/саяхат»</b> – өсу мен жетілу, тәжірибе жинау символы.
      </p>
      <div class="mt-3 grid md:grid-cols-2 gap-4">
        <div>
          <h4 class="font-semibold text-slate-900">Кілт тақырыптар</h4>
          <ul class="mt-1 list-disc list-inside text-slate-700">
            <li>Отбасы, мейірім, тәрбие</li>
            <li>Достық, адалдық, жауапкершілік</li>
            <li>Еңбек пен оқу – тұлға қалыптасуы</li>
            <li>Балалықтан ересектікке дейінгі жол</li>
          </ul>
        </div>
        <div>
          <h4 class="font-semibold text-slate-900">Кейіпкерлер</h4>
          <ul class="mt-1 list-disc list-inside text-slate-700">
            <li><b>Бекен</b> (автордың бала бейнесі) – алғыр, ашық жан</li>
            <li>Ата-ана, мұғалімдер, достар – тәрбие мен орта</li>
          </ul>
          <h4 class="mt-3 font-semibold text-slate-900">Символика</h4>
          <p class="text-slate-700"><b>Жол</b> – өмір соқпағы, тәжірибе мен арманға апарар бағыт.</p>
        </div>
      </div>
      <p class="mt-3 text-slate-700">
        <b>Қорытынды:</b> Өткенді еске алу – өзіңді танудың басы. Балалық шақтың 
        «шағын ерліктері» кейінгі өмірдің іргетасын қалайды.
      </p>
    `,
    questions: [
      { q: "👦 + 🚲 + 🌄 — байланысы?", options: [
        "Балалық еркіндік пен арман","Саяхаттың басталуы","Достық пен ойын","Соғыс",
      ], a: 0 },
      { q: "Фото сұрақ: қай тұс?", image: "/4.jpg", options: [
        "Баланың ауыл өмірімен байланысы","Қалаға көшу","Соғыс көрінісі","Табиғат",
      ], a: 0 },
      { q: "«Әр күні бір ертегі…» көңіл күйі?", options: ["Сағыныш пен мейірім","Қайғы мен мұң","Қорқыныш","Ашу"], a: 0 },
      { q: "💪 + 📚 + 😄 + 👦 — кім?", options: ["Бекен","Әкесі","Мұғалім","Досы"], a: 0 },
      { q: "Неліктен «саяхат»?", options: [
        "Өткенін қайта еске алу үшін","Арманын орындау үшін","Тарихқа қызықтыру үшін","Ауыл сипаттау үшін",
      ], a: 0 },
      { q: "«Жол» символы?", options: ["Өмір мен өсу жолы","Соғысқа кету","Қала-ауыл байланысы","Үмітсіздік"], a: 0 },
      { q: "🌧️ + 🐴 + 👦 + ❤️ — эмоция?", options: ["Табиғат пен бала үйлесімі","Қорқыныш","Үмітсіздік","Ауыртпалық"], a: 0 },
      { q: "Уақыт реті:", options: ["2-3-1-4","1-2-3-4","3-2-1-4","2-1-3-4"], a: 0 },
      { q: "Басты құндылықтар?", options: ["Отбасы, еңбек, адамгершілік","Батырлық пен соғыс","Білім мен байлық","Табиғат сұлулығы"], a: 0 },
      { q: "Философиялық түйін:", options: ["Өмір өткіншілігі және рухани өсу","Қаланың дамуы","Табиғат көрінісі","Уақыттың тоқтауы"], a: 0 },
    ],
  },

  {
    id: "beisen-bolmys",
    title: "«Бейсен және болмыс» — Санжар Керімбай",
    threshold: 8,
    introHtml: `
      <h3 class="text-xl font-bold text-slate-900">«Бейсен және болмыс»</h3>
      <p class="mt-2 text-slate-700">
        Санжар Керімбайдың еңбегі танымал журналист Бейсен Құранбектің 
        адами келбетін, еңбек пен шыншылдыққа негізделген өмірлік ұстанымын 
        екшей отырып, болмыс (экзистенция) туралы терең ой қозғайды. 
        Кітапта экзистенциализм және логотерапия қағидалары адамның қиындық 
        үстінде мән табуын түсіндіретін тірек ретінде ұсынылады.
      </p>
      <div class="mt-3 grid md:grid-cols-2 gap-4">
        <div>
          <h4 class="font-semibold text-slate-900">Негізгі акценттер</h4>
          <ul class="mt-1 list-disc list-inside text-slate-700">
            <li>Еңбек – мәнге апарар жол</li>
            <li>Шыншылдық, қарапайымдық, жауапкершілік</li>
            <li>Қызмет ету – адамдық борыш</li>
          </ul>
        </div>
        <div>
          <h4 class="font-semibold text-slate-900">Тірек ұғымдар</h4>
          <ul class="mt-1 list-disc list-inside text-slate-700">
            <li><b>Болмыс</b> – адам мен табиғат, еңбек пен сана тұтастығы</li>
            <li><b>Логотерапия</b> – мағына арқылы сауығу, алға басу</li>
          </ul>
        </div>
      </div>
      <p class="mt-3 text-slate-700">
        <b>Қорытынды тезис:</b> «Адамның болмысын ісі танытады» – сөзден гөрі 
        әрекет – нағыз өлшем.
      </p>
    `,
    questions: [
      { q: "Автор кім?", options: ["Шерхан Мұртаза","Санжар Керімбай","Әбіш Кекілбаев","Қалқаман Сарин"], a: 1 },
      { q: "Жанры?", options: ["Роман","Әңгіме","Поэма","Эссе"], a: 1 },
      { q: "Көлденең кроссворд: еңбекқор, шыншыл кейіпкер?", options: ["Әкім","Бейсен","Жақып","Болмыс"], a: 1 },
      { q: "«Болмыс» атауда нені білдіреді?", options: ["Табиғи өмір мен шындықты","Кейіпкердің аты","Қала","Тау"], a: 0 },
      { q: "Негізгі ой?", options: ["Табиғатты қорғау — борыш","Адамның болмысы еңбекте танылады","Білім алу — басты мақсат","Қалалық өмір — жеңіл"], a: 1 },
      { q: "Бейсен қандай?", options: ["Еңбекқор, шыншыл","Мақтаншақ","Қорқақ","Кекшіл"], a: 0 },
      { q: "Тік кроссворд: табиғат пен адам байланысы…", options: ["Болмыс","Тұлға","Жүйе","Сезім"], a: 0 },
      { q: "Негізгі идея?", options: ["Адам мен табиғат үйлесімі керек","Байлыққа ұмтылу","Қалалық мәдениет","Жастар еркелігі"], a: 0 },
      { q: "«Адамның болмысын ісі танытады» кімге тән?", options: ["Әкім","Болмыс","Бейсен","Жақып"], a: 2 },
      { q: "Ребус: 🌍 + 👂 + «с» — ұғым?", options: ["Болмыс","Сезім","Үнсіздік","Тыңдас"], a: 0 },
    ],
  },
];

/* ========================== КӨМЕКШІ UI =========================== */
const Progress = ({ value }) => (
  <div className="w-full bg-slate-200/70 rounded-full h-2.5 overflow-hidden">
    <div className="h-2.5 rounded-full bg-gradient-to-r from-[#1F7A8C] via-[#1aa6b5] to-[#0ea5a5]" style={{ width: `${value}%` }} />
  </div>
);

function ResultBadge({ ok }) {
  return (
    <span className={`ml-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${ok ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
      {ok ? "Дұрыс" : "Бұрыс"}
    </span>
  );
}

function PhotoFrame({ src, alt }) {
  if (!src) return null;
  return (
    <figure className="group relative mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 shadow-md">
      <img src={src} alt={alt || "photo"} loading="lazy" className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-black/5" />
    </figure>
  );
}

/* ============================= БЕТ =============================== */
export default function ThinkHub() {
  const [unlocks, setUnlocks] = React.useState(load());
  const [active, setActive] = React.useState(null); // quiz object
  const [phase, setPhase]   = React.useState("intro"); // "intro" | "quiz" | "result"
  const [step, setStep]     = React.useState(0);
  const [answers, setAnswers] = React.useState([]);
  const [showResult, setShowResult] = React.useState(false);

  const openQuiz = (qz) => {
    setActive(qz);
    setPhase("intro");
    setStep(0);
    setAnswers(Array(qz.questions.length).fill(null));
    setShowResult(false);
  };
  const closeQuiz = () => setActive(null);

  const selectAnswer = (idx) => { const next = [...answers]; next[step] = idx; setAnswers(next); };
  const nextQ = () => setStep((s) => Math.min(s + 1, (active?.questions.length || 1) - 1));
  const prevQ = () => setStep((s) => Math.max(0, s - 1));

  const startTest = () => setPhase("quiz");

  const finish = () => {
    const total = active.questions.length;
    const score = active.questions.reduce((s, q, i) => s + (answers[i] === q.a ? 1 : 0), 0);
    const passed = score >= (active.threshold || total);
    setShowResult(true);
    setPhase("result");
    if (passed) {
      const next = { ...unlocks, [active.id]: { opened: true, score, total, ts: Date.now() } };
      setUnlocks(next); save(next);
    }
  };

  const claimPrize = () => {
    if (!active) return;
    const u = unlocks[active.id];
    if (!u?.opened) return;
    alert("Құттықтаймыз! Кітап ашылды. Жоғарыдағы сілтемені пайдаланыңыз.");
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-4xl font-extrabold text-slate-900">
        Abai Insight (SQ) — <span className="text-[#f59e0b]">ТЕСТ алдында МАЗМҰН</span>
      </motion.h1>
      <p className="mt-2 text-slate-600">Әр тест басталардан бұрын сол шығарма туралы қысқаша мазмұн көрсетіледі.</p>

      {/* Каталог */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {QUIZZES.map((qz) => {
          const u = unlocks[qz.id];
          return (
            <div key={qz.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-amber-100 to-orange-100 flex items-center justify-center text-xl">📘</div>
                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-slate-900">{qz.title}</h3>
                  <p className="text-xs text-slate-500">Өту шегі: <b>{qz.threshold ?? qz.questions.length}</b> / {qz.questions.length}</p>
                </div>
                {u?.opened && <span className="ml-auto rounded-full bg-emerald-100 text-emerald-700 px-2 py-1 text-xs font-semibold">АШЫҚ</span>}
              </div>

              {qz.cover && (
                <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
                  <img src={qz.cover} alt={qz.title} className="w-full h-36 object-cover" />
                </div>
              )}

              <div className="mt-4 flex gap-2">
                <button onClick={() => openQuiz(qz)} className="rounded-xl bg-sky-600 text-white px-4 py-2 text-sm font-semibold">
                  Мазмұнын оқу → Тест
                </button>
                <a
                  href={qz.prizeUrl || "#"}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => { if (!u?.opened) { e.preventDefault(); alert("Алдымен тесттен өтіңіз 🙂"); } }}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold border ${
                    u?.opened ? "border-emerald-300 text-emerald-700" : "border-slate-300 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  Кітапты ашу
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Модал */}
      <AnimatePresence>
        {active && (
          <motion.div
            key={active.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 flex items-end md:items-center justify-center p-4"
            onClick={closeQuiz}
          >
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="relative max-h-[90vh] w-full md:w-[920px] rounded-2xl bg-white p-6 shadow-xl overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center text-xl">📖</div>
                <div className="min-w-0">
                  <h3 className="text-xl font-bold text-slate-900">{active.title}</h3>
                  <p className="text-xs text-slate-500">
                    {phase === "quiz" ? <>Сұрақтар: {active.questions.length} • Өту шегі: {active.threshold ?? active.questions.length}</> : "Алдымен қысқаша мазмұнды оқыңыз"}
                  </p>
                </div>
                <button onClick={closeQuiz} className="ml-auto rounded-xl border px-3 py-2 text-sm font-semibold">Жабу</button>
              </div>

              {/* INTRO → QUIZ → RESULT */}
              {phase === "intro" && (
                <div className="mt-5">
                  {active.cover && <PhotoFrame src={active.cover} alt={active.title} />}
                  <div className="prose max-w-none prose-sm md:prose-base">
                    <div dangerouslySetInnerHTML={{ __html: active.introHtml }} />
                  </div>
                  <div className="mt-5 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                    <span>Дайын болсаң, тестке өт.</span>
                    <button onClick={() => setPhase("quiz")} className="rounded-xl bg-amber-500 text-white px-4 py-2 font-semibold">Тестті бастау</button>
                  </div>
                </div>
              )}

              {phase === "quiz" && (
                <>
                  <div className="mt-4">
                    <Progress value={Math.round(((step + 1) / active.questions.length) * 100)} />
                    <div className="mt-2 text-right text-xs text-slate-500">
                      {step + 1} / {active.questions.length}
                    </div>
                  </div>

                  <div className="mt-4">
                    <h4 className="text-lg font-bold text-slate-900">{active.questions[step].q}</h4>
                    <PhotoFrame src={active.questions[step].image} alt={active.title} />

                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                      {active.questions[step].options.map((opt, i) => {
                        const selected = answers[step] === i;
                        return (
                          <button
                            key={i}
                            onClick={() => { const n=[...answers]; n[step]=i; setAnswers(n); }}
                            className={`text-left rounded-xl border-2 p-4 transition ${
                              selected ? "border-sky-600 bg-sky-50" : "border-slate-200 hover:border-sky-300 hover:bg-sky-50/40"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`mt-0.5 h-2.5 w-2.5 rounded-full ${selected ? "bg-sky-600" : "bg-slate-300"}`} />
                              <span className="text-slate-800"><b>{String.fromCharCode(65 + i)})</b> {opt}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {answers[step] != null && (
                      <div className="mt-3 text-sm">
                        <span className="text-slate-600">Таңдалған жауап: </span>
                        <b>{String.fromCharCode(65 + answers[step])}</b>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <button
                      onClick={() => prevQ()}
                      disabled={step === 0}
                      className={`rounded-xl px-4 py-2 font-semibold border ${step === 0 ? "text-slate-400 border-slate-200 cursor-not-allowed" : "border-slate-300"}`}
                    >
                      ⟵ Артқа
                    </button>
                    {step < active.questions.length - 1 ? (
                      <button
                        onClick={() => setStep((s) => s + 1)}
                        disabled={answers[step] == null}
                        className={`rounded-xl px-4 py-2 font-semibold ${answers[step] == null ? "bg-slate-200 text-slate-500 cursor-not-allowed" : "bg-sky-600 text-white"}`}
                      >
                        Келесі ⟶
                      </button>
                    ) : (
                      <button
                        onClick={finish}
                        disabled={answers.some((a) => a == null)}
                        className={`rounded-xl px-4 py-2 font-semibold ${
                          answers.some((a) => a == null) ? "bg-slate-200 text-slate-500 cursor-not-allowed" : "bg-emerald-600 text-white"
                        }`}
                      >
                        Тапсыру ✓
                      </button>
                    )}
                  </div>
                </>
              )}

              {phase === "result" && showResult && (
                <ResultView active={active} answers={answers} unlocks={unlocks} onClaim={claimPrize} />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* =========================== НӘТИЖЕ ============================== */
function ResultView({ active, answers, unlocks, onClaim }) {
  const total = active.questions.length;
  const score = active.questions.reduce((s, q, i) => s + (answers[i] === q.a ? 1 : 0), 0);
  const passed = score >= (active.threshold ?? total);
  const opened = unlocks?.[active.id]?.opened;

  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${passed ? "bg-emerald-100" : "bg-rose-100"}`}>{passed ? "🎉" : "🧐"}</div>
        <div>
          <div className="font-bold text-slate-900">Нәтиже: {score} / {total}</div>
          <div className="text-sm text-slate-600">Өту шегі: {active.threshold ?? total} — {passed ? "ӨТТІҢІЗ! Кітап ашылды." : "Әзірге жетпеді, тағы бір әрекет жасап көріңіз."}</div>
        </div>
      </div>

      <div className="mt-4">
        {active.questions.map((q, i) => {
          const ok = answers[i] === q.a;
          return (
            <div key={i} className="mt-3 rounded-xl border border-slate-200 p-3">
              <div className="font-medium text-slate-900">{i + 1}. {q.q} <ResultBadge ok={ok} /></div>
              {q.image && <div className="mt-2 overflow-hidden rounded-lg border border-slate-200"><img src={q.image} alt="" className="w-full h-40 object-cover" /></div>}
              <div className="mt-2 text-sm text-slate-700">Дұрыс жауап: <b>{String.fromCharCode(65 + q.a)})</b></div>
              {q.exp && <div className="mt-1 text-sm text-slate-600">Түсіндірме: {q.exp}</div>}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex gap-2">
        <button onClick={onClaim} disabled={!passed} className={`rounded-xl px-4 py-2 font-semibold ${passed ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-500 cursor-not-allowed"}`}>
          🎁 Кітапты ашу / алу
        </button>
        <a href={active.prizeUrl || "#"} target="_blank" rel="noreferrer" className={`rounded-xl px-4 py-2 font-semibold border ${opened ? "border-emerald-300 text-emerald-700" : "border-slate-300 text-slate-400 cursor-not-allowed"}`}>
          🔗 Кітап сілтемесі
        </a>
      </div>
    </div>
  );
}
