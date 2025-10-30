import React from "react";
import { motion } from "framer-motion";

const OUTBOX_KEY = "atalink_outbox_v1";

function loadOutbox() {
  try { return JSON.parse(localStorage.getItem(OUTBOX_KEY) || "[]"); }
  catch { return []; }
}
function saveOutbox(list) { localStorage.setItem(OUTBOX_KEY, JSON.stringify(list)); }

const TEMPLATES = [
  { id: "attendance", title: "Қатысу ескертуі", text: "Сәлеметсіз бе! Бүгін балаңыз сабаққа қатыспады. Себебін білсек деп едік." },
  { id: "homework",   title: "Үй жұмысы",       text: "Бүгін үй тапсырмасы берілді. Орындау мерзімі: ертең. Сұрақ болса, жазыңыз." },
  { id: "event",      title: "Іс-шара",         text: "Ертең сағ. 15:00-де сыныптық кездесу өтеді. Қатысуларыңызды сұраймыз." },
];

const PARENTS = [
  { id: 1, student: "Айдана Т.", parent: "Әлия Т.", phone: "+7 777 000 11 22", group: "7A" },
  { id: 2, student: "Мируан С.", parent: "Серік С.", phone: "+7 701 123 45 67", group: "7A" },
  { id: 3, student: "Әмина Қ.", parent: "Гүлжан Қ.", phone: "+7 705 111 22 33", group: "7A" },
  { id: 4, student: "Нұрасыл А.", parent: "Алма А.", phone: "+7 776 999 88 77", group: "7A" },
];

export default function AtaLink() {
  const [recipients, setRecipients] = React.useState(() => new Set(PARENTS.map(p => p.id)));
  const [message, setMessage] = React.useState("");
  const [link, setLink] = React.useState("");
  const [outbox, setOutbox] = React.useState(loadOutbox);

  const toggleRecipient = (id) =>
    setRecipients(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const useTemplate = (t) => setMessage(t.text);

  const send = () => {
    if (!message.trim() || recipients.size === 0) return;
    const payload = {
      id: Date.now(),
      date: new Date().toISOString(),
      to: PARENTS.filter(p => recipients.has(p.id)),
      message,
      link: link.trim() || null,
    };
    const next = [payload, ...outbox].slice(0, 20);
    setOutbox(next);
    saveOutbox(next);
    setMessage("");
    setLink("");
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl md:text-4xl font-extrabold text-slate-900"
      >
        AtaLink — <span className="text-[#f59e0b]">Ата-анамен байланыс көпірі</span>
      </motion.h1>
      <p className="mt-2 text-slate-600">
        Бір нүктеден жедел хабардар ету. Хабарламалар тізімі құрылғыңызда сақталады.
      </p>

      {/* Шаблондар */}
      <div className="mt-6 flex flex-wrap gap-2">
        {TEMPLATES.map(t => (
          <button
            key={t.id}
            onClick={() => useTemplate(t)}
            className="px-3 py-2 rounded-xl border border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100"
            title={t.text}
          >
            {t.title}
          </button>
        ))}
      </div>

      {/* Хабарлама құрастыру */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="font-bold text-slate-900">Хабарлама</h3>
          <textarea
            rows={6}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-500/60"
            placeholder="Мәтінді жазыңыз немесе шаблонды таңдаңыз…"
          />
          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm text-slate-600">Сілтеме (қалауыңызша):</span>
            <input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://..."
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>
          <div className="mt-3 flex gap-3">
            <button
              onClick={send}
              className="px-4 py-2 rounded-xl bg-amber-500 text-white font-semibold"
              disabled={!message.trim() || recipients.size === 0}
            >
              Жіберуді имитациялау
            </button>
            <span className="self-center text-sm text-slate-600">
              Таңдалған ата-аналар: <b>{recipients.size}</b> / {PARENTS.length}
            </span>
          </div>
        </div>

        {/* Ата-аналар тізімі */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="font-bold text-slate-900">Ата-аналар</h3>
          <div className="mt-2 space-y-2">
            {PARENTS.map(p => (
              <label key={p.id} className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={recipients.has(p.id)}
                  onChange={() => toggleRecipient(p.id)}
                />
                <div>
                  <div className="font-medium">{p.parent} <span className="text-slate-500">({p.student})</span></div>
                  <div className="text-xs text-slate-500">{p.phone} • {p.group}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Жіберілгендер тізімі */}
      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-4">
        <h3 className="font-bold text-slate-900">Жіберілген хабарламалар</h3>
        {outbox.length === 0 ? (
          <p className="mt-2 text-slate-600 text-sm">Пусто. Алдымен хабарлама жіберіп көріңіз.</p>
        ) : (
          <ul className="mt-2 space-y-3">
            {outbox.slice(0, 5).map(item => (
              <li key={item.id} className="rounded-xl border border-slate-200 p-3">
                <div className="text-xs text-slate-500">{new Date(item.date).toLocaleString()}</div>
                <div className="mt-1 text-slate-800">{item.message}</div>
                {item.link && <a href={item.link} target="_blank" rel="noreferrer" className="text-amber-700 underline text-sm break-all">{item.link}</a>}
                <div className="mt-2 text-xs text-slate-500">
                  Кімге: {item.to.map(t => `${t.parent} (${t.student})`).join(", ")}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
