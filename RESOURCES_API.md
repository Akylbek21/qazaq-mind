# 📚 Resources API Documentation / Ресурстар API құжаттамасы

## 📋 Overview / Шолу

Мұғалімдерге арналған ресурстар API-сы: әдістемелік материалдар, сабақ жоспарлары, тапсырмалар және т.б.

---

## 🔗 API Endpoints

### 1. Барлық ресурстарды алу

**Endpoint:**
```
GET /api/resources
```

**Authorization:**
```
Bearer <token>
```

**Response:**
```json
[
  {
    "id": 1,
    "title": "Сыныпты басқару нұсқаулығы",
    "url": "https://www.edutopia.org/classroom-management",
    "description": "Сыныпта тәртіпті сақтау, оқушыларды мотивациялау, оң климат қалыптастыру туралы практикалық кеңестер",
    "tags": "teacher,methodology,classroom"
  },
  {
    "id": 2,
    "title": "STEAM тапсырмалар жинағы",
    "url": "https://www.stem.org.uk/resources",
    "description": "Ғылым, технология, инженерия, өнер және математика бойынша қызықты тапсырмалар мен жобалар",
    "tags": "teacher,steam,activities"
  }
]
```

---

### 2. Ресурстарды іздеу

**Endpoint:**
```
GET /api/resources?q=<search_query>
```

**Parameters:**
- `q` (string) - Іздеу сұранысы

**Example:**
```
GET /api/resources?q=steam
```

**Response:**
```json
[
  {
    "id": 2,
    "title": "STEAM тапсырмалар жинағы",
    "url": "https://www.stem.org.uk/resources",
    "description": "Ғылым, технология, инженерия, өнер және математика бойынша қызықты тапсырмалар мен жобалар",
    "tags": "teacher,steam,activities"
  },
  {
    "id": 4,
    "title": "21 ғасыр дағдыларын дамыту",
    "url": "https://www.p21.org/framework",
    "description": "Сыни ойлау, шығармашылық, ынтымақтастық және коммуникация дағдыларын дамыту",
    "tags": "teacher,skills,21st-century"
  }
]
```

---

## 📊 Data Structure / Деректер құрылымы

### Resource Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | number | Уникалды идентификатор |
| `title` | string | Ресурс атауы |
| `url` | string | Сілтеме URL |
| `description` | string | Сипаттама |
| `tags` | string | Тегтер (comma-separated) |

**Example:**
```json
{
  "id": 1,
  "title": "Сыныпты басқару нұсқаулығы",
  "url": "https://www.edutopia.org/classroom-management",
  "description": "Сыныпта тәртіпті сақтау...",
  "tags": "teacher,methodology,classroom"
}
```

---

## 💻 Frontend Integration / Frontend интеграциясы

### API Client (`src/api/resources.js`)

```javascript
import { getJSON } from "./client";

export async function fetchResources(query = "") {
  const q = String(query || "").trim();
  
  if (q && q !== "*") {
    return getJSON(`/resources?q=${encodeURIComponent(q)}`);
  }
  
  return getJSON("/resources");
}
```

---

### Usage / Қолдану

#### 1. Барлық ресурстарды алу

```javascript
import { fetchResources } from "@/api/resources";

const resources = await fetchResources();
// немесе
const resources = await fetchResources("*");
```

#### 2. Іздеу

```javascript
const resources = await fetchResources("steam");
```

---

## 🎨 UI Components / UI компоненттері

### TeacherConsole (`src/pages/TeacherConsole.jsx`)

**Features:**
- ✅ Ресурстарды жүктеу
- ✅ Іздеу
- ✅ Tags display (string → array conversion)
- ✅ Loading states
- ✅ Error handling
- ✅ External links (новая вкладка)

**Code:**
```jsx
const [resQuery, setResQuery] = React.useState("");
const [resources, setResources] = React.useState([]);
const [resLoading, setResLoading] = React.useState(false);
const [resErr, setResErr] = React.useState("");

const loadResources = async (q = "") => {
  setResLoading(true);
  setResErr("");
  try {
    const list = await fetchResources(q.trim());
    setResources(list);
  } catch (e) {
    setResErr(e?.message || "Ресурстарды жүктеу мүмкін емес.");
    setResources([]);
  } finally {
    setResLoading(false);
  }
};

React.useEffect(() => {
  loadResources("*");
}, []);
```

---

## 🏷️ Tags Handling / Тегтерді өңдеу

### Backend Format:
```json
{
  "tags": "teacher,methodology,classroom"
}
```

### Frontend Conversion:
```javascript
{(Array.isArray(r.tags) ? r.tags : String(r.tags).split(","))
  .filter(Boolean)
  .map((t) => (
    <span key={t} className="text-xs px-2 py-1 rounded-lg bg-slate-100 border border-slate-200">
      #{t.trim()}
    </span>
  ))}
```

**Result:**
- `#teacher`
- `#methodology`
- `#classroom`

---

## 🔍 Search Logic / Іздеу логикасы

### Client-side:

```javascript
const onResSearch = () => loadResources(resQuery);
const onResKey = (e) => { 
  if (e.key === "Enter") onResSearch(); 
};
```

### Server-side (күтілетін):

Backend `/api/resources?q=...` endpoint-і мына өрістерден іздеу керек:
- `title`
- `description`
- `tags`

**Example:**
```
/api/resources?q=steam
→ matches "STEAM тапсырмалар жинағы" (title)
→ matches "teacher,steam,activities" (tags)
```

---

## 🎯 User Flow / Пайдаланушы ағыны

```
1. Teacher Console ашу
   ↓
2. "Мұғалім ресурстары" бөлімі
   ↓
3. Іздеу өрісі: "steam" енгізу
   ↓
4. "Іздеу" button немесе Enter
   ↓
5. Loading...
   ↓
6. Нәтижелер көрсетіледі
   ↓
7. Ресурс картасын басу
   ↓
8. Жаңа вкладка ашылады (external link)
```

---

## 📱 UI Design / UI дизайны

### Search Bar:
```
┌────────────────────────────────────────┬──────────┐
│ іздеу: classroom, steam, methodology…  │  Іздеу   │
└────────────────────────────────────────┴──────────┘
```

### Resource Card:
```
┌────────────────────────────────────────┐
│ Сыныпты басқару нұсқаулығы             │
│                                        │
│ Сыныпта тәртіпті сақтау, оқушыларды   │
│ мотивациялау, оң климат қалыптастыру  │
│ туралы практикалық кеңестер           │
│                                        │
│ #teacher #methodology #classroom       │
└────────────────────────────────────────┘
```

---

## ⚠️ Error Handling / Қателерді өңдеу

### Network Error:
```
Ресурстарды жүктеу мүмкін емес.
```

### Empty Results:
```
Нәтиже жоқ.
```

### Loading State:
```
Жүктелуде…
```

---

## ✅ Features / Мүмкіндіктер

- [x] Барлық ресурстарды жүктеу
- [x] Іздеу
- [x] Tags display (string → array)
- [x] External links (target="_blank")
- [x] Loading states
- [x] Error handling
- [x] Enter key support (search)
- [x] Responsive grid (md:grid-cols-2)
- [x] Hover effects
- [x] Safe URL validation

---

## 🔐 Authorization / Авторизация

**Required:**
- Token: Bearer `<token>`
- Role: TEACHER (күтілетін)

**Access:**
- `/teacher-console` бетіне кіру үшін TEACHER рөлі керек

---

## 🚀 Testing / Тестілеу

### Test қадамдары:

1. **Жүйеге кіру (TEACHER):**
   - Username: (teacher account)
   - Password: ...

2. **Teacher Console ашу:**
   - Navigate: `/teacher-console`

3. **Ресурстар жүктелуін тексеру:**
   - Automatic load on mount
   - Барлық ресурстар көрінеді (8 items)

4. **Іздеу тестілеу:**
   - Input: "steam"
   - Click: "Іздеу" button
   - Result: STEAM-related resources

5. **Tags тексеру:**
   - Tags көрінеді: `#teacher`, `#methodology`, etc.
   - Дұрыс форматталған

6. **External link тестілеу:**
   - Resource card click
   - Жаңа вкладка ашылады
   - URL дұрыс

---

## 📊 Sample Data / Мысал деректер

### Backend Response:
```json
[
  {
    "id": 1,
    "title": "Сыныпты басқару нұсқаулығы",
    "url": "https://www.edutopia.org/classroom-management",
    "description": "Сыныпта тәртіпті сақтау, оқушыларды мотивациялау, оң климат қалыптастыру туралы практикалық кеңестер",
    "tags": "teacher,methodology,classroom"
  },
  {
    "id": 2,
    "title": "STEAM тапсырмалар жинағы",
    "url": "https://www.stem.org.uk/resources",
    "description": "Ғылым, технология, инженерия, өнер және математика бойынша қызықты тапсырмалар мен жобалар",
    "tags": "teacher,steam,activities"
  },
  {
    "id": 3,
    "title": "Дифференциацияланған оқыту әдістері",
    "url": "https://www.readingrockets.org/article/differentiated-instruction",
    "description": "Әр түрлі деңгейдегі оқушыларды үйірмелі оқыту стратегиялары",
    "tags": "teacher,methodology,differentiation"
  },
  {
    "id": 4,
    "title": "21 ғасыр дағдыларын дамыту",
    "url": "https://www.p21.org/framework",
    "description": "Сыни ойлау, шығармашылық, ынтымақтастық және коммуникация дағдыларын дамыту",
    "tags": "teacher,skills,21st-century"
  },
  {
    "id": 5,
    "title": "Оқушылардың эмоционалды дамуы",
    "url": "https://casel.org/fundamentals-of-sel/",
    "description": "Эмоционалды зияттылықты (EQ) дамыту, өзін-өзі тану, әлеуметтік дағдылар",
    "tags": "teacher,sel,emotions"
  },
  {
    "id": 6,
    "title": "Инклюзивті білім беру ресурстары",
    "url": "https://www.inclusiveschooling.org/",
    "description": "Барлық оқушыларды, олардың қажеттіліктерін ескере отырып, оқыту",
    "tags": "teacher,inclusion,special-needs"
  },
  {
    "id": 7,
    "title": "Сабақ жоспары мысалдары",
    "url": "https://www.lessonplanet.com/",
    "description": "Әртүрлі пәндер мен тақырыптар бойынша сабақ жоспарларының мысалдары",
    "tags": "teacher,lesson-plans,resources"
  },
  {
    "id": 8,
    "title": "Оқушыларды бағалау стратегиялары",
    "url": "https://www.edutopia.org/assessment",
    "description": "Тұрақты бағалау, формативті бағалау, өзін-өзі бағалау әдістері",
    "tags": "teacher,assessment,evaluation"
  }
]
```

---

## 📝 Modified Files / Өзгертілген файлдар

1. **src/api/resources.js** (ЖАҢА)
   - `fetchResources(query)` функциясы

2. **src/pages/TeacherConsole.jsx**
   - Tags handling: string → array conversion
   - `filter(Boolean)` + `trim()`

---

## ✅ Checklist

### Backend:
- [ ] GET `/api/resources` endpoint дайын
- [ ] GET `/api/resources?q=...` іздеу жұмыс істейді
- [ ] Authorization (Bearer token) тексеріледі
- [ ] TEACHER role керек ме?

### Frontend:
- [x] `src/api/resources.js` жасалды
- [x] `fetchResources()` функциясы
- [x] TeacherConsole интеграциясы
- [x] Tags string → array conversion
- [x] Loading states
- [x] Error handling
- [x] Search functionality
- [x] External links

### Testing:
- [ ] Ресурстар жүктеледі (барлығы)
- [ ] Іздеу жұмыс істейді
- [ ] Tags дұрыс көрінеді
- [ ] External links ашылады
- [ ] Error handling дұрыс
- [ ] Loading states көрінеді

---

**Барлығы дайын! Тек backend `/api/resources` endpoint қосу керек.** 🚀

