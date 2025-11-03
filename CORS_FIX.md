# CORS проблемасын шешу / Fixing CORS Issue

## ❌ Проблема

```
Access to XMLHttpRequest at 'http://85.202.193.138:8087/dashboard' 
from origin 'http://localhost:5173' has been blocked by CORS policy:
Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## 🔍 Себебі

**CORS (Cross-Origin Resource Sharing)** - браузер қауіпсіздік механизмі.

- **Frontend origin:** `http://localhost:5173`
- **Backend origin:** `http://85.202.193.138:8087`

Әр түрлі origin-дер болғандықтан, браузер backend-тен `Access-Control-Allow-Origin` header-ін талап етеді.

---

## ✅ Шешім: Vite Proxy қолдану

### Не істедік:

1. **Development режимде**: `/api` арқылы proxy қолданамыз
   - Request: `http://localhost:5173/api/dashboard`
   - Vite proxy: `http://85.202.193.138:8087/api/dashboard`
   - CORS жоқ! (same origin)

2. **Production режимде**: тікелей backend URL
   - Request: `http://85.202.193.138:8087/api/dashboard`
   - Backend CORS қосуы керек

---

## 📝 Өзгерістер

### 1. vite.config.js
```javascript
proxy: {
  "/api": { 
    target: "http://85.202.193.138:8087", 
    changeOrigin: true, 
    secure: false,
    configure: (proxy) => {
      proxy.on('proxyReq', (proxyReq, req) => {
        console.log('📤 Proxy:', req.method, req.url);
      });
    }
  },
}
```

### 2. src/lib/http.js
```javascript
// Dev: /api (proxy арқылы)
// Production: http://85.202.193.138:8087
const rawBase = import.meta.env.DEV
  ? "/api"
  : "http://85.202.193.138:8087";
```

---

## 🚀 Қалай іске қосу

### МІНДЕТТІ: Dev серверді қайта іске қосу!

**PowerShell терминалда:**

```powershell
# 1. Тоқтату (егер іске қосылса)
Ctrl + C

# 2. Қайта іске қосу
npm run dev

# 3. Консольде тексеру:
# "🔧 Vite Config:"
# "   API Target: http://85.202.193.138:8087"
# "[HTTP] baseURL = /api"
```

### Браузерді жаңарту:

```
Ctrl + Shift + R (Windows)
Cmd + Shift + R (Mac)
```

---

## ✅ Консольда көруіңіз керек:

### Terminal (Vite):
```
🔧 Vite Config:
   API Target: http://85.202.193.138:8087
   Mode: development

  ➜  Local:   http://localhost:5173/
```

### Browser Console (F12):
```
[HTTP] baseURL = /api
[HTTP] timeout = 30000
📤 Proxy: GET /api/dashboard → http://85.202.193.138:8087/api/dashboard
```

### Network Tab (F12):
```
✅ Request URL: http://localhost:5173/api/dashboard
✅ Status: 200 OK (or 401)
✅ NO CORS ERRORS!
```

---

## 🧪 Тестілеу

### 1. Жүйеге кіру
- Login бетіне өтіңіз
- Логин/құпиясөз енгізіңіз
- F12 → Network табы
- `/api/auth/login` - Status 200 ✅

### 2. Dashboard көру
- Негізгі бетке өтіңіз
- F12 → Network табы
- `/api/dashboard` - Status 200 ✅
- CORS error жоқ ✅

### 3. Статистика
- "Менің статистикам" блогы көрінеді
- Метрикалар (IQ/EQ/SQ/PQ) көрінеді
- AI Кеңестері жұмыс істейді

---

## 🔄 Request Flow

### Development:
```
Browser → Vite Dev Server → Backend
   ↓           (proxy)          ↓
localhost:5173 -------→ 85.202.193.138:8087
   
/api/dashboard → /api/dashboard
(same origin, no CORS!)
```

### Production:
```
Browser → Backend
   ↓         ↓
example.com → 85.202.193.138:8087
   
(CORS headers керек!)
```

---

## ⚠️ Жиі кездесетін қателер

### 1. Әлі CORS error көрінеді

**Себебі:** Dev сервер қайта іске қоспағансыз

**Шешім:**
```powershell
Ctrl+C
npm run dev
Ctrl+Shift+R (браузерде)
```

### 2. "baseURL = http://85.202.193.138:8087" көрінеді

**Себебі:** Code өзгерген, бірақ dev сервер ескі

**Шешім:**
```powershell
Ctrl+C
npm run dev
```

### 3. 404 Not Found

**Себебі:** Backend endpoint-і дұрыс емес

**Тексеру:**
```powershell
# Postman/curl арқылы:
curl http://85.202.193.138:8087/api/dashboard
```

**Endpoint дұрыс па?**
- ✅ `/api/dashboard`
- ❌ `/dashboard` (жоқ /api prefix)

---

## 🏗️ Production Deploy

Production-ға deploy қылғанда **Backend-те CORS қосу керек!**

### Backend (Java/Spring):

```java
@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                    .allowedOrigins(
                        "http://localhost:5173",
                        "https://your-domain.com"
                    )
                    .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                    .allowedHeaders("*")
                    .allowCredentials(true);
            }
        };
    }
}
```

### Немесе Controller-де:

```java
@CrossOrigin(
    origins = {"http://localhost:5173", "https://your-domain.com"},
    allowCredentials = "true"
)
@RestController
@RequestMapping("/api")
public class DashboardController {
    // ...
}
```

---

## 📊 Checklist

- [ ] `vite.config.js` өзгертілді (proxy logging)
- [ ] `src/lib/http.js` өзгертілді (dev: `/api`, prod: full URL)
- [ ] Dev сервер тоқтатылды (Ctrl+C)
- [ ] Dev сервер қайта іске қосылды (`npm run dev`)
- [ ] Terminal-да "🔧 Vite Config" көрінеді
- [ ] Browser console-да `[HTTP] baseURL = /api` көрінеді
- [ ] Браузер жаңартылды (Ctrl+Shift+R)
- [ ] F12 → Network → CORS errors жоқ
- [ ] Login жұмыс істейді
- [ ] Dashboard жұмыс істейді
- [ ] Статистика көрінеді

---

## 🎯 Нәтиже

### ✅ Енді:
```
✅ CORS errors жоқ
✅ Proxy жұмыс істейді
✅ /api/dashboard → backend
✅ /api/auth/login → backend
✅ Барлық API calls жұмыс істейді
```

### 📊 Network Tab:
```
Request URL: http://localhost:5173/api/dashboard
Status: 200 OK
Response Headers:
  ✅ content-type: application/json
  ✅ NO CORS errors!
```

---

## 🆘 Егер әлі жұмыс істемесе

### 1. Cache тазалау:
```
Chrome: Ctrl+Shift+Delete → Clear cache
```

### 2. Incognito mode:
```
Ctrl+Shift+N (Chrome)
```

### 3. Логтарды тексеру:

**Terminal (Vite):**
```
Should see: 📤 Proxy: GET /api/dashboard
```

**Browser Console:**
```
Should see: [HTTP] baseURL = /api
Should NOT see: CORS errors
```

**Network Tab:**
```
Request URL should be: localhost:5173/api/...
NOT: 85.202.193.138:8087/api/...
```

### 4. Backend қолжетімділігі:
```powershell
# PowerShell-да:
curl http://85.202.193.138:8087/api/dashboard
```

Expected: 401 Unauthorized (or 200 with token)
If: Connection refused → Backend жұмыс істемейді

---

## 📞 Backend командасына

Production deploy үшін backend-те CORS қосу керек екенін айтыңыз:

```
Endpoints: /api/**
Allow Origins: 
  - http://localhost:5173 (dev)
  - https://your-production-domain.com (prod)
Allow Methods: GET, POST, PUT, DELETE, OPTIONS
Allow Headers: Authorization, Content-Type
Allow Credentials: true
```

---

**Енді CORS проблемасы шешілді! Dev серверді қайта іске қосыңыз! 🚀**

