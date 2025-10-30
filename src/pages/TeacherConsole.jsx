import React from "react";
import { motion } from "framer-motion";

const LS_KEY = "teacher_console_state_v1";

const DEFAULT_STUDENTS = [
  { id: 1, name: "Айдана Т.", grade: "", present: false, note: "" },
  { id: 2, name: "Мируан С.", grade: "", present: false, note: "" },
  { id: 3, name: "Әмина Қ.", grade: "", present: false, note: "" },
  { id: 4, name: "Нұрасыл А.", grade: "", present: false, note: "" },
];

function load() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "null") || DEFAULT_STUDENTS; }
  catch { return DEFAULT_STUDENTS; }
}
function save(data) { localStorage.setItem(LS_KEY, JSON.stringify(data)); }

export default function TeacherConsole() {
  const [students, setStudents] = React.useState(load);
  const [groupNote, setGroupNote] = React.useState("");

  React.useEffect(() => { save(students); }, [students]);

  const setField = (id, patch) =>
    setStudents(prev => prev.map(s => (s.id === id ? { ...s, ...patch } : s)));

  const markAll = (present) =>
    setStudents(prev => prev.map(s => ({ ...s, present })));

  const clearAll = () =>
    setStudents(prev => prev.map(s => ({ ...s, grade: "", note: "" })));

  const presentCount = students.filter(s => s.present).length;

  const exportJSON = () => {
    const payload = { date: new Date().toISOString(), groupNote, students };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `teacher-console-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const [summaryStudentId, setSummaryStudentId] = React.useState(students[0]?.id || 1);
  const curr = students.find(s => s.id === Number(summaryStudentId));
  const parentSummary = curr ? (
    `Сәлеметсіз бе! ${curr.name} бүгін сабаққа ${curr.present ? "қатысты" : "қатыспады"}.
Соңғы баға: ${curr.grade || "—"}. Мұғалім ескертпесі: ${curr.note || "жоқ"}.`
  ) : "";

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl md:text-4xl font-extrabold text-slate-900"
      >
        Ақылды көмекші — <span className="text-[#7c3aed]">Teacher Console</span>
      </motion.h1>
      <p className="mt-2 text-slate-600">
        Журнал, қатысу, жедел бағалау және ата-анаға қысқа есеп.
        Барлық өзгерістер құрылғыда <b>жергілікті</b> сақталады.
      </p>

      {/* Қысқа әрекеттер */}
      <div className="mt-6 flex flex-wrap gap-3">
        <button onClick={() => markAll(true)} className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold">Барлығы қатысқан</button>
        <button onClick={() => markAll(false)} className="px-4 py-2 rounded-xl border border-slate-300 font-semibold">Барлығы қатыспаған</button>
        <button onClick={clearAll} className="px-4 py-2 rounded-xl border border-slate-300 font-semibold">Ескертпе/бағаны тазалау</button>
        <button onClick={exportJSON} className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold">JSON экспорт</button>
        <div className="ml-auto text-sm text-slate-600 self-center">
          Қатысу: <b>{presentCount}</b> / {students.length}
        </div>
      </div>

      {/* Кесте */}
      <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-700">
            <tr>
              <th className="px-4 py-3 text-left">Оқушы</th>
              <th className="px-4 py-3 text-left">Қатысу</th>
              <th className="px-4 py-3 text-left">Баға</th>
              <th className="px-4 py-3 text-left">Ескертпе</th>
            </tr>
          </thead>
          <tbody>
            {students.map(s => (
              <tr key={s.id} className="border-t">
                <td className="px-4 py-3">{s.name}</td>
                <td className="px-4 py-3">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={s.present}
                      onChange={e => setField(s.id, { present: e.target.checked })}
                    />
                    <span>{s.present ? "Қатысты" : "Қатыспады"}</span>
                  </label>
                </td>
                <td className="px-4 py-3">
                  <input
                    type="text"
                    value={s.grade}
                    onChange={e => setField(s.id, { grade: e.target.value })}
                    className="w-24 rounded-lg border border-slate-300 px-2 py-1 outline-none focus:ring-2 focus:ring-indigo-500/60"
                    placeholder="мыс: 10"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="text"
                    value={s.note}
                    onChange={e => setField(s.id, { note: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-2 py-1 outline-none focus:ring-2 focus:ring-indigo-500/60"
                    placeholder="қысқа ескерту"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Топтық жазба + ата-анаға қысқа есеп */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="font-bold text-slate-900">Топтық жазба / рефлексия</h3>
          <textarea
            rows={6}
            value={groupNote}
            onChange={(e) => setGroupNote(e.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500/60"
            placeholder="Бүгінгі сабақтағы жалпы байқаулар…"
          />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="font-bold text-slate-900">Ата-анаға қысқа есеп</h3>
          <div className="mt-2 flex gap-2 items-center">
            <label className="text-sm text-slate-600">Оқушы:</label>
            <select
              value={summaryStudentId}
              onChange={(e) => setSummaryStudentId(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2"
            >
              {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <textarea
            readOnly
            rows={5}
            value={parentSummary}
            className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 bg-slate-50"
          />
          <p className="mt-2 text-xs text-slate-500">† Осы мәтінді көшіріп, AtaLink арқылы жіберуге болады.</p>
        </div>
      </div>
    </div>
  );
}
