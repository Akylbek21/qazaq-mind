# Timeout проблемасын диагностикалау / Debugging Timeout Issue

## ❌ Проблема

```
AxiosError: Таймаут запроса. Проверьте API_BASE: /api
code: 'ECONNABORTED'
```

---

## 🔍 Диагностика қадамдары

### 1️⃣ Backend қолжетімділігін тексеру

**PowerShell (жаңа терминал ашыңыз):**

```powershell
# Ping тексеру
ping 85.202.193.138

# HTTP сұраным
curl http://85.202.193.138:8087/api/dashboard

# Немесе Invoke-WebRequest
Invoke-WebRequest -Uri "http://85.202.193.138:8087/api/dashboard" -Method GET
```

**Күтілетін нәтижелер:**

✅ **Жақсы нәтиже:**
```
StatusCode: 401 Unauthorized
(Токен жоқ - бұл дұрыс, backend жауап береді)
```

❌ **Жаман нәтиже:**
```
curl: (7) Failed to connect
(Backend қолжетімсіз)
```

❌ **Timeout:**
```
curl: (28) Operation timed out
(Backend тым баяу немесе firewall блоктайды)
```

---

### 2️⃣ Dev сервер логтарын тексеру

Dev сервер іске қосылғаннан кейін терминалда көруіңіз керек:

```
🔧 Vite Config:
   API Target: http://85.202.193.138:8087
   Mode: development

  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

**Бетті ашқан кезде (сұраным жасалғанда):**
```
📤 Proxy Request: GET /api/dashboard → http://85.202.193.138:8087/api/dashboard
📥 Proxy Response: 200 /api/dashboard
```

**Егер proxy логтары жоқ болса:**
- Dev сервер дұрыс іске қоспаған
- Proxy жұмыс істемейді

---

### 3️⃣ Browser Console тексеру

**F12 → Console:**

```javascript
// API_BASE тексеру
console.log("API_BASE:", import.meta.env.BASE_URL);

// Manual request
fetch('/api/dashboard')
  .then(r => console.log('Status:', r.status))
  .catch(e => console.error('Error:', e));
```

**Күтілетін:**
```
[HTTP] baseURL = /api
[HTTP] timeout = 30000
```

---

### 4️⃣ Network Tab тексеру

**F12 → Network → бетті жаңарту:**

`/api/dashboard` сұранысын табыңыз:

**Headers:**
- Request URL: `http://localhost:5173/api/dashboard` ✅
- Request Method: `GET`
- Status Code: `200 OK` немесе `401 Unauthorized`

**Timing:**
- Queued: ~0ms
- DNS Lookup: 0ms (localhost)
- Connecting: ~0ms
- Waiting (TTFB): ??? ms ⚠️

**Егер Waiting тым ұзақ (>30000ms):**
- Backend тым баяу жауап береді
- Timeout өте қысқа

---

## 🛠️ Шешімдер

### Шешім 1: Timeout ұзарту

**1. Frontend timeout:**

`src/lib/http.js`:
```javascript
const DEFAULT_TIMEOUT = 60000; // 60 секунд
```

**2. Vite proxy timeout:**

`vite.config.js`:
```javascript
proxy: {
  "/api": { 
    timeout: 60000, // 60 секунд
    // ...
  }
}
```

**3. Dev серверді қайта іске қосу:**
```powershell
Ctrl+C
npm run dev
```

---

### Шешім 2: Backend URL тексеру

**Backend іске қосылған ба?**

```powershell
# PowerShell-да тексеру:
Test-NetConnection -ComputerName 85.202.193.138 -Port 8087
```

**Күтілетін нәтиже:**
```
TcpTestSucceeded : True
```

**Егер False болса:**
- Backend сервер өшірулі
- Firewall блоктайды
- Порт дұрыс емес

---

### Шешім 3: Localhost backend қолдану (уақытша)

Егер remote backend жұмыс істемесе, localhost-та backend іске қосыңыз:

**vite.config.js:**
```javascript
const apiTarget = "http://localhost:8087";
```

**src/lib/http.js:**
```javascript
const rawBase = import.meta.env.DEV
  ? "/api"
  : "http://localhost:8087";
```

---

### Шешім 4: Mock data қолдану (уақытша)

Backend мүлдем қолжетімсіз болса, mock data қосыңыз:

**src/api/dashboard.js:**
```javascript
export async function getDashboard() {
  // Development режимде mock data
  if (import.meta.env.DEV && !navigator.onLine) {
    return {
      iq: {
        total: 10,
        correct: 8,
        percentage: 80,
        wrongByDomain: {
          math: 1,
          logic: 1
        }
      },
      eq: {
        responses: 5,
        sentimentAvg: 0.8,
        percentage: 80
      },
      sq: {
        total: 7,
        correct: 6,
        percentage: 85.7,
        points: 20
      },
      pq: {
        tasks: 4,
        completion7d: 75,
        percentage: 75
      },
      aiAdvice: "IQ:\n   - Математиканы жақсартыңыз\nEQ:\n   - Эмоцияларды басқару",
      aiAnalysis: {
        kustyZhak: ["Логика жақсы"],
        alsizZhak: ["Математика әлсіз"],
        usynys: "Математикалық тапсырмалар"
      }
    };
  }
  
  return getJSON("/dashboard");
}
```

---

## 🔧 Толық диагностика қадамдары

### Қадам 1: Backend тексеру

```powershell
# PowerShell ашыңыз (жаңа терминал)

# 1. Ping
ping 85.202.193.138

# 2. Port тексеру
Test-NetConnection -ComputerName 85.202.193.138 -Port 8087

# 3. HTTP сұраным
curl http://85.202.193.138:8087/api/dashboard
```

**Нәтижелер:**
- ✅ Ping: OK, Port: Open, HTTP: 401/200 → Backend жұмыс істейді
- ❌ Ping: Timeout → Желі проблемасы
- ❌ Port: Closed → Backend өшірулі немесе порт дұрыс емес
- ❌ HTTP: Timeout → Backend тым баяу

---

### Қадам 2: Dev сервер қайта іске қосу

```powershell
# VSCode терминалда:
Ctrl+C  # Тоқтату
npm run dev  # Қайта іске қосу
```

**Консольде тексеру:**
```
🔧 Vite Config:
   API Target: http://85.202.193.138:8087
   Mode: development
```

---

### Қадам 3: Браузер тестілеу

```
1. Браузерді жаңарту: Ctrl+Shift+R
2. F12 → Console ашу
3. F12 → Network ашу
4. Жүйеге кіру
5. Network табында /api/dashboard табу
6. Timing тексеру
```

---

### Қадам 4: Логтарды талдау

**Dev сервер терминалында:**
```
📤 Proxy Request: GET /api/dashboard → ...
📥 Proxy Response: 200 /api/dashboard
```

**Егер жоқ болса:**
- Request frontend-тен жібермейді
- Proxy trigger болмайды

**Егер 📤 бар, бірақ 📥 жоқ:**
- Backend жауап бермейді
- Timeout болды

---

## 📊 Checklist

### Backend:
- [ ] Backend іске қосылған
- [ ] Port 8087 ашық
- [ ] 85.202.193.138 қолжетімді
- [ ] `/api/dashboard` endpoint бар
- [ ] Backend логтарында сұранымдар көрінеді

### Frontend:
- [ ] `vite.config.js` proxy timeout: 60000
- [ ] `src/lib/http.js` timeout: 60000
- [ ] `src/lib/http.js` baseURL: `/api` (dev)
- [ ] Dev сервер қайта іске қосылды
- [ ] Браузер жаңартылды (Ctrl+Shift+R)
- [ ] Console: `[HTTP] baseURL = /api`

### Network:
- [ ] Ping жұмыс істейді
- [ ] Port ашық
- [ ] Firewall блоктамайды
- [ ] VPN қосылмаған (немесе қосылған, егер керек болса)

---

## 🆘 Жедел шешім

Егер ештеңе көмектеспесе:

**1. Mock data қосыңыз (жоғарыда Шешім 4)**

**2. Backend командасымен байланысыңыз:**
```
Хабарласу керек:
- Backend сервер іске қосылған ба?
- Port 8087 дұрыс па?
- /api/dashboard endpoint бар ма?
- Логтарда қандай қателер көрінеді?
- CORS headers қосылған ба?
```

**3. Backend логтарын алыңыз:**
```bash
# Backend серверде:
tail -f /path/to/backend/logs/app.log
```

---

## 🎯 Ең жиі кездесетін себептер

### 1. Backend өшірулі (90%)
**Тексеру:** `curl http://85.202.193.138:8087/api/dashboard`
**Шешім:** Backend-ті іске қосу

### 2. Порт дұрыс емес (5%)
**Тексеру:** `Test-NetConnection -Port 8087`
**Шешім:** Дұрыс портты қолдану

### 3. Endpoint дұрыс емес (3%)
**Тексеру:** Backend құжаттамасын қарау
**Шешім:** `/api/dashboard` немесе `/dashboard`?

### 4. Backend тым баяу (2%)
**Тексеру:** Network Tab → Timing
**Шешім:** Timeout ұзарту (60000ms)

---

**Бірінші қадам: Backend қолжетімділігін тексеріңіз!**

```powershell
curl http://85.202.193.138:8087/api/dashboard
```

