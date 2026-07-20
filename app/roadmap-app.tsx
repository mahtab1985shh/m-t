"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { categoryLabels, phases, type Phase } from "../lib/roadmap-data";

type Tab = keyof typeof categoryLabels | "overview";
type Check = { phaseId: number; itemKey: string; checked: boolean };
type Journal = { id: number; phaseId: number; title: string; story: string; lesson: string; author: string; happenedAt: string; imageUrl?: string | null };

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: "overview", label: "معنی و هدف", icon: "◎" }, { id: "requirements", label: "الزامات", icon: "◆" },
  { id: "actions", label: "اقدامات", icon: "✓" }, { id: "learning", label: "مطالعات", icon: "◈" },
  { id: "outputs", label: "خروجی‌ها", icon: "▣" }, { id: "success", label: "موفقیت", icon: "★" },
];

function phaseItems(phase: Phase) {
  return (["requirements", "actions", "learning", "outputs", "success"] as const).flatMap((category) =>
    phase[category].map((text, index) => ({ category, text, key: `${category}-${index}` }))
  );
}

export function RoadmapApp() {
  const [selectedId, setSelectedId] = useState(0);
  const [tab, setTab] = useState<Tab>("overview");
  const [view, setView] = useState<"roadmap" | "journal">("roadmap");
  const [checks, setChecks] = useState<Check[]>([]);
  const [journal, setJournal] = useState<Journal[]>([]);
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const [journalOpen, setJournalOpen] = useState(false);
  const selected = phases[selectedId];

  useEffect(() => {
    fetch("/api/progress").then(r => r.json()).then(d => setChecks(d.checks || [])).catch(() => {});
    fetch("/api/journal").then(r => r.json()).then(d => setJournal(d.entries || [])).catch(() => {});
  }, []);

  const isChecked = (phaseId: number, key: string) => checks.some(c => c.phaseId === phaseId && c.itemKey === key && c.checked);
  const completion = (phase: Phase) => {
    const items = phaseItems(phase); return Math.round(items.filter(i => isChecked(phase.id, i.key)).length / items.length * 100);
  };
  const overall = Math.round(phases.reduce((sum, phase) => sum + completion(phase), 0) / phases.length);
  const filteredPhases = useMemo(() => phases.filter(x => `${x.title} ${x.short} ${x.purpose}`.toLowerCase().includes(search.toLowerCase())), [search]);

  async function toggle(key: string) {
    const next = !isChecked(selected.id, key);
    setChecks(current => [...current.filter(c => !(c.phaseId === selected.id && c.itemKey === key)), { phaseId: selected.id, itemKey: key, checked: next }]);
    const res = await fetch("/api/progress", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phaseId: selected.id, itemKey: key, checked: next }) });
    if (!res.ok) setNotice("ذخیره آنلاین در دسترس نیست؛ پس از انتشار دیتابیس فعال می‌شود.");
  }

  async function addJournal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = event.currentTarget; const body = new FormData(form);
    const response = await fetch("/api/journal", { method: "POST", body }); const data = await response.json();
    if (!response.ok) return setNotice(data.error || "ثبت انجام نشد");
    setJournal(current => [data.entry, ...current]); setJournalOpen(false); form.reset(); setNotice("خاطره با موفقیت ثبت شد.");
  }

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark">MT</span><div><strong>Mahtab & Tom</strong><small>Founder OS</small></div></div>
      <nav className="main-nav">
        <button className={view === "roadmap" ? "active" : ""} onClick={() => setView("roadmap")}><span>⌁</span> نقشه راه</button>
        <button className={view === "journal" ? "active" : ""} onClick={() => setView("journal")}><span>♡</span> خاطرات و تجربه‌ها <b>{journal.length}</b></button>
      </nav>
      <div className="sidebar-label">فازهای شرکت <span>{phases.length}</span></div>
      <div className="phase-nav">
        {phases.map(phase => <button key={phase.id} onClick={() => { setSelectedId(phase.id); setView("roadmap"); setTab("overview"); }} className={selectedId === phase.id && view === "roadmap" ? "selected" : ""}>
          <i style={{ background: phase.color }}>{phase.id}</i><span><strong>{phase.title}</strong><small>{completion(phase)}٪ تکمیل</small></span>
        </button>)}
      </div>
      <div className="sidebar-footer"><div className="avatars"><span>م</span><span>ت</span></div><div><strong>بنیان‌گذاران</strong><small>ساخت شرکت، با هم</small></div></div>
    </aside>

    <main>
      <header className="topbar"><div className="mobile-brand">MT</div><label className="search"><span>⌕</span><input aria-label="جستجو در فازها" value={search} onChange={e => setSearch(e.target.value)} placeholder="جستجو در نقشه راه..." /></label><button className="ghost">راهنما</button><button className="primary" onClick={() => setJournalOpen(true)}>＋ ثبت تجربه</button></header>
      {notice && <div className="notice" role="status">{notice}<button onClick={() => setNotice("")}>×</button></div>}
      {view === "roadmap" ? <>
        <section className="hero">
          <div><div className="eyebrow">FOUNDER ROADMAP <span>نسخه اجرایی ۱.۰</span></div><h1>شرکت را بسازیم،<br/><em>پیش از آن‌که کسب‌وکار را بزرگ کنیم.</em></h1><p>یک فضای مشترک برای تصمیم‌گیری، یادگیری و تبدیل هر مرحله از مسیر بنیان‌گذاری به اقدام‌های روشن و قابل سنجش.</p></div>
          <div className="overall-card"><div className="ring" style={{ "--progress": `${overall * 3.6}deg` } as React.CSSProperties}><span>{overall}٪</span></div><div><strong>پیشرفت کل مسیر</strong><small>{checks.filter(x => x.checked).length} مورد تکمیل شده</small></div></div>
        </section>
        <section className="phase-strip">{filteredPhases.map(phase => <button key={phase.id} className={selectedId === phase.id ? "active" : ""} onClick={() => {setSelectedId(phase.id); setTab("overview")}}><i style={{background: phase.color}}>{phase.id}</i><span>{phase.title}</span><b>{completion(phase)}٪</b></button>)}</section>
        <section className="workspace">
          <div className="phase-heading"><div className="phase-number" style={{ background: selected.color }}>فاز {selected.id}</div><div><h2>{selected.title}</h2><p>{selected.short}</p></div><div className="phase-progress"><span><b>{completion(selected)}٪</b> پیشرفت</span><div><i style={{ width: `${completion(selected)}%`, background: selected.color }} /></div></div></div>
          <div className="tabs" role="tablist">{tabs.map(item => <button role="tab" aria-selected={tab === item.id} className={tab === item.id ? "active" : ""} onClick={() => setTab(item.id)} key={item.id}><span>{item.icon}</span>{item.label}</button>)}</div>
          {tab === "overview" ? <div className="overview-grid"><article className="purpose-card"><span>چرا این فاز مهم است؟</span><h3>{selected.purpose}</h3><p>{selected.meaning}</p><div className="quote">«هر فاز برای کاهش عدم‌قطعیت، بهبود تصمیم‌گیری و افزایش شانس ساخت یک شرکت موفق است.»</div></article><div className="quick-board"><h3>نمای سریع این فاز</h3>{(["requirements","actions","learning","outputs"] as const).map((cat, index) => <button key={cat} onClick={() => setTab(cat)}><i className={`tile-icon t${index}`}>{["◆","✓","◈","▣"][index]}</i><span><strong>{categoryLabels[cat]}</strong><small>{selected[cat].length} مورد</small></span><b>‹</b></button>)}</div></div>
          : <Checklist phase={selected} category={tab as keyof typeof categoryLabels} checked={isChecked} toggle={toggle} />}
        </section>
      </> : <JournalView entries={journal} phases={phases} onAdd={() => setJournalOpen(true)} />}
    </main>
    {journalOpen && <JournalModal phaseId={selectedId} onClose={() => setJournalOpen(false)} onSubmit={addJournal} />}
  </div>;
}

function Checklist({ phase, category, checked, toggle }: { phase: Phase; category: keyof typeof categoryLabels; checked: (id:number,key:string)=>boolean; toggle:(key:string)=>void }) {
  return <div className="checklist"><div className="checklist-head"><div><h3>{categoryLabels[category]}</h3><p>{category === "learning" ? "دانشی که برای تصمیم‌گیری و اجرای بهتر باید کسب کنید." : category === "outputs" ? "مدارکی که پایان این فاز را قابل اثبات می‌کنند." : "موارد این فاز را به‌ترتیب بررسی و تکمیل کنید."}</p></div><span>{phase[category].filter((_,i)=>checked(phase.id,`${category}-${i}`)).length} از {phase[category].length}</span></div>{phase[category].map((text,index) => { const key=`${category}-${index}`, done=checked(phase.id,key); return <button className={done ? "done" : ""} onClick={()=>toggle(key)} key={key}><i>{done ? "✓" : ""}</i><span><strong>{text}</strong><small>{done ? "تکمیل‌شده" : "برای تکمیل علامت بزنید"}</small></span><b className="status-pill">{done ? "انجام شد" : "در انتظار"}</b></button>})}</div>;
}

function JournalView({ entries, phases, onAdd }: { entries: Journal[]; phases: Phase[]; onAdd:()=>void }) {
  return <section className="journal-page"><div className="journal-hero"><div><span>دفتر سفر بنیان‌گذاران</span><h1>لحظه‌ها را ثبت کنید؛<br/>درس‌ها را نگه دارید.</h1><p>تصمیم‌ها، موفقیت‌ها، شکست‌ها و تجربه‌هایی که روزی داستان شرکت شما خواهند شد.</p></div><button onClick={onAdd}>＋ ثبت خاطره جدید</button></div>{entries.length ? <div className="journal-grid">{entries.map(entry => <article key={entry.id}>{entry.imageUrl && <img src={entry.imageUrl} alt={entry.title}/>}<div><span className="journal-phase" style={{color:phases[entry.phaseId]?.color}}>فاز {entry.phaseId} · {phases[entry.phaseId]?.title}</span><h3>{entry.title}</h3><p>{entry.story}</p>{entry.lesson && <blockquote><b>درسی که گرفتیم</b>{entry.lesson}</blockquote>}<footer><span>{entry.author}</span><time>{entry.happenedAt}</time></footer></div></article>)}</div> : <div className="empty-journal"><span>♡</span><h2>اولین صفحه هنوز نوشته نشده</h2><p>اولین تجربه مسیر مشترک‌تان را ثبت کنید.</p><button onClick={onAdd}>ثبت اولین خاطره</button></div>}</section>;
}

function JournalModal({ phaseId, onClose, onSubmit }: { phaseId:number; onClose:()=>void; onSubmit:(e:FormEvent<HTMLFormElement>)=>void }) {
  return <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}><form className="modal" onSubmit={onSubmit}><div className="modal-head"><div><span>دفتر بنیان‌گذاران</span><h2>ثبت یک تجربه تازه</h2></div><button type="button" onClick={onClose}>×</button></div><div className="form-grid"><label>عنوان تجربه<input name="title" required placeholder="مثلاً اولین گفت‌وگو با مشتری" /></label><label>فاز<select name="phaseId" defaultValue={phaseId}>{phases.map(p => <option value={p.id} key={p.id}>فاز {p.id} — {p.title}</option>)}</select></label><label className="wide">چه اتفاقی افتاد؟<textarea name="story" required rows={4} placeholder="داستان این لحظه را بنویسید..." /></label><label className="wide">چه درسی گرفتید؟<textarea name="lesson" rows={2} placeholder="این تجربه چه چیزی به شما آموخت؟" /></label><label>نویسنده<input name="author" defaultValue="Mahtab & Tom" /></label><label>تاریخ<input name="happenedAt" type="date" defaultValue={new Date().toISOString().slice(0,10)} /></label><label className="wide upload">عکس این لحظه<input name="image" type="file" accept="image/*" /><span>عکس را انتخاب کنید · حداکثر ۸ مگابایت</span></label></div><div className="modal-actions"><button type="button" onClick={onClose}>انصراف</button><button className="primary" type="submit">ثبت در دفتر خاطرات</button></div></form></div>;
}
