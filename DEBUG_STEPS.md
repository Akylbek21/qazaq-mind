# 🐛 Timeout проблемасын шешу / Debug Timeout Issue

## 🎯 Мақсат

`AxiosError: Таймаут запроса` қатесін шешу.

---

## ✅ Дайындық тексеру

### 1. Backend қолжетімді ма?
```powershell
Invoke-WebRequest -Uri "http://85.202.193.138:8087/api/dashboard"
```
**Күтілетін:** `403 Forbidden` (токенсіз - дұрыс) ✅

### 2. Dev сервер іске қосылған ба?
```powershell
netstat -ano | Select-String ":5173"
```
**Күтілетін:** `LISTENING 5173` ✅

### 3. Proxy configuration дұрыс па?
**vite.config.js:**
- ✅ `proxy: { "/api": { target: "http://85.202.193.138:8087" } }`
- ✅ `timeout: 60000`

**src/lib/http.js:**
- ✅ `API_BASE = "/api"` (dev режимде)
- ✅ `timeout: 30000`

---

## 🔍 Диагностика қадамдары

### Қадам 1: Test HTML арқылы тексеру

**Браузерде ашыңыз:**
```
http://localhost:5173/test-direct.html
```

**Тестілер:**
1. **Check Environment** - token бар ма?
2. **Test Proxy** - proxy жұмыс істейді ме?
3. **Test Direct** - backend қолжетімді ме?

**F12 → Console тексеріңіз:**
```
📤 Proxy Request: GET /api/dashboard → ...
📥 Proxy Response: 200 /api/dashboard
```

---

### Қадам 2: Dev сервер логтарын қарау

**VSCode терминалда көруіңіз керек:**

```
🔧 Vite Config:
   API Target: http://85.202.193.138:8087
   Mode: development

  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**Браузерде бет ашқан кезде:**
```
📤 Proxy Request: GET /api/dashboard → http://85.202.193.138:8087/api/dashboard
📥 Proxy Response: 403 /api/dashboard
```

**Егер логтар жоқ болса:**
- ❌ Request frontend-тен жібермейді
- ❌ Proxy trigger болмайды
- ❌ Cache проблемасы

---

### Қадам 3: Browser Cache тазалау

**Браузерде:**
```
1. F12 ашу
2. Application/Storage табына өту
3. "Clear storage" басу
4. Жүйеге қайта кіру
```

**Немесе:**
```
Ctrl + Shift + Delete
→ Cached images and files
→ Clear data
```

**Hard Refresh:**
```
Ctrl + Shift + R
(немесе Ctrl + F5)
```

---

### Қадам 4: Network Tab талдау

**F12 → Network → бетті жаңарту**

`/api/dashboard` сұранысын табыңыз:

**Дұрыс (Proxy жұмыс істейді):**
```
Request URL: http://localhost:5173/api/dashboard
Status: 200 / 401 / 403
Type: xhr / fetch
```

**Жаман (Proxy жұмыс істемейді):**
```
Request URL: http://85.202.193.138:8087/api/dashboard
Status: (failed) net::ERR_FAILED
Error: CORS policy
```

**Timing тексеру:**
- Waiting (TTFB): < 1000ms → Backend жылдам ✅
- Waiting (TTFB): > 30000ms → Backend баяу ❌
- Stalled: > 30000ms → Timeout ❌

---

## 🛠️ Шешімдер

### Шешім 1: Dev серверді қайта іске қосу

```powershell
# VSCode терминалда:
Ctrl + C  # Тоқтату
npm run dev  # Қайта іске қосу
```

**Күту:** 5-10 секунд

**Тексеру:**
```
🔧 Vite Config:
   API Target: http://85.202.193.138:8087
```

---

### Шешім 2: Browser Cache тазалау

```
1. Ctrl + Shift + Delete
2. "Cached images and files" белгілеу
3. Clear data
4. Браузерді жабу
5. Қайта ашу
6. Жүйеге кіру
```

---

### Шешім 3: Token тексеру

**F12 → Console:**
```javascript
// Token бар ма?
console.log('Token:', localStorage.getItem('qm_token'));

// Token жарамды ма?
const token = localStorage.getItem('qm_token');
if (token) {
  const parts = token.split('.');
  if (parts.length === 3) {
    const payload = JSON.parse(atob(parts[1]));
    console.log('Token payload:', payload);
    console.log('Expires:', new Date(payload.exp * 1000));
  }
}
```

**Егер token жарамсыз болса:**
```javascript
localStorage.clear();
window.location.href = '/login';
```

---

### Шешім 4: Timeout ұзарту

**src/lib/http.js:**
```javascript
const DEFAULT_TIMEOUT = 60000; // 60 секунд
```

**Dev серверді қайта іске қосу:**
```powershell
Ctrl + C
npm run dev
```

---

### Шешім 5: .env файлын тексеру

**Жою (егер бар болса):**
```
VITE_QAZAQMIND_SERVICE=http://85.202.193.138:8087
VITE_QM_API_URL=http://85.202.193.138:8087
```

**Себебі:** Dev режимде proxy қолданамыз, тікелей URL-ді емес.

**Dev серверді қайта іске қосу керек!**

---

## 📊 Checklist

### Backend:
- [x] Ping: OK
- [x] Port 8087: Open
- [x] `/api/dashboard`: 403 (без токена)

### Frontend:
- [x] vite.config.js: proxy configured
- [x] src/lib/http.js: API_BASE = /api (dev)
- [ ] Dev сервер іске қосылған
- [ ] Браузер cache тазаланды
- [ ] Token жарамды

### Proxy:
- [ ] Dev сервер логында "📤 Proxy Request" көрінеді
- [ ] Dev сервер логында "📥 Proxy Response" көрінеді
- [ ] Network Tab: Request URL = localhost:5173/api/...

### Tests:
- [ ] test-direct.html: Check Environment → Token бар
- [ ] test-direct.html: Test Proxy → Success
- [ ] test-direct.html: Test Direct → CORS error (күтілетін)

---

## 🚀 Қадамдық нұсқау

### 1️⃣ Dev серверді тоқтату

**VSCode терминалда:**
```
Ctrl + C
```

**Күту:** "Terminated" көрінгенше

---

### 2️⃣ .env тексеру/жою

**PowerShell:**
```powershell
# Файл бар ма?
Test-Path .env

# Мазмұнын қарау
Get-Content .env -ErrorAction SilentlyContinue

# Жою (егер VITE_QAZAQMIND_SERVICE бар болса)
# Remove-Item .env
```

**Немесе VSCode-та `.env` файлын ашып, `VITE_QAZAQMIND_SERVICE` жолын жойыңыз.**

---

### 3️⃣ Dev серверді қайта іске қосу

```powershell
npm run dev
```

**Күту:** 
```
🔧 Vite Config:
   API Target: http://85.202.193.138:8087
   Mode: development

  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

---

### 4️⃣ Браузер cache тазалау

```
1. Браузерді ашу
2. Ctrl + Shift + Delete
3. "Cached images and files" белгілеу
4. Clear data
5. F5 (жаңарту)
```

---

### 5️⃣ Test page ашу

```
http://localhost:5173/test-direct.html
```

**Тестілер орындау:**
1. Check Environment → Token бар ма?
2. Test Proxy → Success 200/403

---

### 6️⃣ Main app тестілеу

```
http://localhost:5173
```

**Жүйеге кіру:**
- Username: ...
- Password: ...

**Dashboard ашу:**
- UserInsightBlock жүктелуі керек
- Қате болмауы керек

---

### 7️⃣ Dev сервер логтарын қарау

**VSCode терминалда:**
```
📤 Proxy Request: GET /api/dashboard → http://85.202.193.138:8087/api/dashboard
📥 Proxy Response: 200 /api/dashboard
```

**Егер логтар көрінбесе:**
- Request жібермейді
- Token жоқ
- Cache проблемасы

---

## 🆘 Әлі де жұмыс істемесе

### Plan B: Mock Data

**src/api/dashboard.js:**
```javascript
export async function getDashboard() {
  // Уақытша mock data
  if (import.meta.env.DEV) {
    console.warn('⚠️ Using MOCK data');
    return {
      iq: { total: 10, correct: 8, percentage: 80, wrongByDomain: {} },
      eq: { responses: 5, sentimentAvg: 0.8, percentage: 80 },
      sq: { total: 7, correct: 6, percentage: 85.7, points: 20 },
      pq: { tasks: 4, completion7d: 75, percentage: 75 },
      aiAdvice: "IQ:\n- Test\nEQ:\n- Test",
      aiAnalysis: {
        kustyZhak: ["Good"],
        alsizZhak: ["Weak"],
        usynys: "Recommendation"
      }
    };
  }
  
  return getJSON("/dashboard");
}
```

---

## 📞 Backend командасына хабарлау

Егер frontend дұрыс жұмыс істесе, бірақ backend қателер бергенде:

**Жіберу керек ақпарат:**
1. Request URL: `http://85.202.193.138:8087/api/dashboard`
2. Method: `GET`
3. Headers: `Authorization: Bearer <token>`
4. Response: `403 / 500 / timeout`
5. Backend logs: ?

**Сұрақтар:**
- `/api/dashboard` endpoint бар ма?
- Қандай роль керек? (STUDENT / TEACHER)
- Token format дұрыс па? (Bearer JWT)
- CORS headers қосылған ба?

---

**Бастау үшін: Dev серверді тоқтату (Ctrl+C) және қайта іске қосу (npm run dev)!**

