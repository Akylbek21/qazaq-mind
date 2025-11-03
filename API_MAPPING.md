# API деректерінің маппингі / API Data Mapping

## Backend API форматы

### Толық JSON құрылымы:

```json
{
  "iq": {
    "total": 10,
    "correct": 2,
    "percentage": 20.0,
    "wrongByDomain": {
      "analytical": 1,
      "pattern": 2,
      "verbal": 1,
      "logic": 2,
      "math": 1,
      "spatial": 1
    }
  },
  "eq": {
    "responses": 0,
    "sentimentAvg": 0.0,
    "percentage": 50.0
  },
  "sq": {
    "total": 7,
    "correct": 3,
    "percentage": 42.857142857142854,
    "points": 15
  },
  "pq": {
    "tasks": 4,
    "completion7d": 0.0,
    "percentage": 0.0
  },
  "aiAdvice": "IQ: ...\nEQ: ...\nSQ: ...\nPQ: ...",
  "aiAnalysis": {
    "usynys": "Ұсыным...",
    "alsizZhak": ["Эмоционалды интеллекттің дамымауы"],
    "kustyZhak": ["Әлеуметтік интеллекттің дамуы"]
  }
}
```

---

## Маппинг кестесі

### 1. IQ (Intellect Quotient)

| Backend поле | Frontend поле | Түрі | Сипаттама |
|--------------|---------------|------|-----------|
| `iq.total` | `iq.total` | number | Жалпы сұрақтар |
| `iq.correct` | `iq.correct` | number | Дұрыс жауаптар |
| `iq.percentage` | `iq.accuracy` | number | Дұрыстық пайызы |
| `iq.percentage` | `iq.percentage` | number | Дұрыстық пайызы |
| `iq.wrongByDomain` | `iq.wrongByDomain` | object | Домендер бойынша қателер |

**Auto-detect hasActivity:**
```javascript
hasActivity: iq.total > 0
```

---

### 2. EQ (Emotional Quotient)

| Backend поле | Frontend поле | Түрі | Сипаттама |
|--------------|---------------|------|-----------|
| `eq.responses` | `eq.totalResponses` | number | Жауаптар саны |
| `eq.responses` | `eq.responses` | number | Жауаптар саны |
| `eq.sentimentAvg` | `eq.avgSentiment` | number | Орташа sentiment (0-1) |
| `eq.sentimentAvg` | `eq.sentimentAvg` | number | Орташа sentiment (0-1) |
| `eq.percentage` | `eq.percentage` | number | EQ пайызы |
| - | `eq.concerns` | array | Мәселелер тізімі |

**Auto-detect hasActivity:**
```javascript
hasActivity: eq.responses > 0
```

---

### 3. SQ (Social Quotient)

| Backend поле | Frontend поле | Түрі | Сипаттама |
|--------------|---------------|------|-----------|
| `sq.total` | `sq.total` | number | Жалпы сұрақтар |
| `sq.correct` | `sq.correct` | number | Дұрыс жауаптар |
| `sq.percentage` | `sq.accuracy` | number | Дұрыстық пайызы |
| `sq.percentage` | `sq.percentage` | number | Дұрыстық пайызы |
| `sq.points` | `sq.points` | number | Жинаған ұпайлар |

**Auto-detect hasActivity:**
```javascript
hasActivity: sq.total > 0
```

---

### 4. PQ (Physical Quotient)

| Backend поле | Frontend поле | Түрі | Сипаттама |
|--------------|---------------|------|-----------|
| `pq.tasks` | `pq.completed` | number | Орындалған тапсырмалар |
| `pq.tasks` | `pq.tasks` | number | Орындалған тапсырмалар |
| `pq.completion7d` | `pq.completionRate` | number | Орындалу пайызы (7 күн) |
| `pq.completion7d` | `pq.completion7d` | number | Орындалу пайызы (7 күн) |
| `pq.percentage` | `pq.percentage` | number | PQ пайызы |

**Auto-detect hasActivity:**
```javascript
hasActivity: pq.tasks > 0
```

---

### 5. AI Analysis (Жаңа!)

#### aiAnalysis объектісі:

| Backend поле | Frontend поле | Түрі | Сипаттама |
|--------------|---------------|------|-----------|
| `aiAnalysis.kustyZhak` | `strengths` | array | Күшті жақтары |
| `aiAnalysis.alsizZhak` | `weaknesses` | array | Әлсіз жақтары |
| `aiAnalysis.usynys` | `recommendations` | array | Ұсынымдар |

**Маппинг логикасы:**
```javascript
// Ескі және жаңа форматты қолдайды
const strengths = data.strengths || aiAnalysis.kustyZhak || [];
const weaknesses = data.weaknesses || aiAnalysis.alsizZhak || [];
const recommendations = data.recommendations || [aiAnalysis.usynys] || [];
```

---

### 6. AI Advice (Жаңа!)

| Backend поле | Frontend поле | Түрі | Сипаттама |
|--------------|---------------|------|-----------|
| `aiAdvice` | `aiAdvice` | string | AI кеңестері (форматталған текст) |

**Формат:**
```
IQ:  
   - Кеңес 1
   - Кеңес 2

EQ:  
   - Кеңес 1
   - Кеңес 2

SQ:  
   - Кеңес 1

PQ:  
   - Кеңес 1
```

**Parsing:**
- Бөлімдерге бөлу: `\n\n(?=[A-Z]{2}:)`
- Әр бөлім: тақырып + items тізімі
- Items: `-` белгісімен басталады

---

## Frontend компоненттері

### 1. AIAdviceCard (Жаңа компонент)

**Props:**
- `aiAdvice` (string) - AI кеңестері

**Мүмкіндіктері:**
- ✨ Expandable/Collapsible
- 🎨 Түсті gradient бөлімдер (IQ, EQ, SQ, PQ)
- 🤖 AI иконкасы
- 💫 Анимацияланған items
- 🌟 Мотивациялық хабар

**Дизайн:**
```jsx
🤖 AI Жеке Кеңестер
   Жасанды интеллект ұсынымдары
   
   [Expand/Collapse ▼]
   
   🧠 IQ дамыту жоспары
      ✓ Кеңес 1
      ✓ Кеңес 2
   
   ❤️ EQ дамыту жоспары
      ✓ Кеңес 1
   
   🌟 Мотивациялық хабар
```

---

### 2. Card (Жақсартылған)

**Қолдайтын түстер:**
- `yellow` (💪) - Күшті жақтары → `kustyZhak`
- `pink` (⚠️) - Әлсіз жақтары → `alsizZhak`
- `green` (💡) - Ұсынымдар → `usynys`

---

## Backward Compatibility (Кері үйлесімділік)

Код екі форматты да қолдайды:

### Ескі формат (Frontend-friendly):
```json
{
  "strengths": ["..."],
  "weaknesses": ["..."],
  "recommendations": ["..."],
  "iq": { "accuracy": 75 },
  "eq": { "totalResponses": 10, "avgSentiment": 0.8 }
}
```

### Жаңа формат (Backend):
```json
{
  "aiAnalysis": {
    "kustyZhak": ["..."],
    "alsizZhak": ["..."],
    "usynys": "..."
  },
  "iq": { "percentage": 75 },
  "eq": { "responses": 10, "sentimentAvg": 0.8 }
}
```

**Маппинг коды автоматты түрде анықтайды:**
```javascript
const accuracy = data.iq.accuracy || data.iq.percentage || 0;
const strengths = data.strengths || aiAnalysis.kustyZhak || [];
```

---

## hasActivity Auto-detection

`hasActivity` поле болмаса, автоматты анықтау:

```javascript
iq.hasActivity = iq.total > 0
eq.hasActivity = eq.responses > 0 || eq.totalResponses > 0
sq.hasActivity = sq.total > 0
pq.hasActivity = pq.tasks > 0 || pq.completed > 0
```

---

## Мысалдар

### 1. Толық деректермен:
```json
{
  "iq": { "total": 10, "correct": 8, "percentage": 80 },
  "aiAdvice": "IQ:\n   - Күн сайын тапсырма шешіңіз",
  "aiAnalysis": {
    "kustyZhak": ["Логика жақсы"],
    "alsizZhak": ["Математика әлсіз"],
    "usynys": "Математиканы дамытыңыз"
  }
}
```

**Нәтиже:**
- ✅ IQ: 80% (8/10)
- 💪 Күшті: "Логика жақсы"
- ⚠️ Әлсіз: "Математика әлсіз"
- 💡 Ұсыным: "Математиканы дамытыңыз"
- 🤖 AI кеңестер: көрсетіледі

### 2. Минималды деректермен:
```json
{
  "iq": { "total": 0 },
  "eq": { "responses": 0 }
}
```

**Нәтиже:**
- 📭 Деректер жоқ
- hasActivity = false
- Карточкалар "Анықталмады" көрсетеді

---

## Testing Checklist

- ✅ Ескі форматпен жұмыс істейді
- ✅ Жаңа форматпен жұмыс істейді
- ✅ aiAdvice көрсетіледі
- ✅ kustyZhak → strengths маппингі
- ✅ alsizZhak → weaknesses маппингі
- ✅ usynys → recommendations маппингі
- ✅ hasActivity auto-detection
- ✅ Екі accuracy және percentage қолдау
- ✅ Екі responses және totalResponses қолдау

---

## Қорытынды

**Барлық функционал қосылды! ✅**

1. ✅ IQ деректері
2. ✅ EQ деректері
3. ✅ SQ деректері
4. ✅ PQ деректері
5. ✅ aiAdvice (жаңа компонент)
6. ✅ aiAnalysis (kustyZhak/alsizZhak/usynys)
7. ✅ Кері үйлесімділік
8. ✅ Auto-detection
9. ✅ Domain icons
10. ✅ Gradient дизайн

**Енді API қайтаратын барлық деректер көрсетіледі! 🎉**

