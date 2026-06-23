"use client";
import { useState, useEffect, useCallback } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────
type Empresa = { id: number; nombre: string; color: string; _count?: { proyectos: number; tareas: number } };
type Proyecto = { id: number; nombre: string; descripcion?: string; empresaId: number; empresa: { id: number; nombre: string; color: string }; _count?: { tareas: number } };
type Tarea = { id: number; titulo: string; descripcion?: string; prioridad: "URGENTE"|"ALTA"|"MEDIA"|"BAJA"; estatus: "PENDIENTE"|"EN_PROGRESO"|"COMPLETADA"; fechaLimite?: string; tiempoEstimado?: number; solicitante?: string; empresaId: number; proyectoId?: number; empresa: { id: number; nombre: string; color: string }; proyecto?: { id: number; nombre: string } };

// ─── Constants ───────────────────────────────────────────────────────────────
const PRIORIDAD_LABEL: Record<string, string> = { URGENTE: "Urgente", ALTA: "Alta", MEDIA: "Media", BAJA: "Baja" };
const PRIORIDAD_COLOR: Record<string, string> = { URGENTE: "#ef4444", ALTA: "#f97316", MEDIA: "#eab308", BAJA: "#22c55e" };
const PRIORIDAD_BG: Record<string, string> = { URGENTE: "#fef2f2", ALTA: "#fff7ed", MEDIA: "#fefce8", BAJA: "#f0fdf4" };
const ESTATUS_LABEL: Record<string, string> = { PENDIENTE: "Pendiente", EN_PROGRESO: "En progreso", COMPLETADA: "Completada" };
const ESTATUS_COLOR: Record<string, string> = { PENDIENTE: "#6b7280", EN_PROGRESO: "#3b82f6", COMPLETADA: "#22c55e" };
const COLORES = ["#6366f1","#ec4899","#f97316","#14b8a6","#8b5cf6","#06b6d4","#84cc16","#ef4444","#f59e0b","#10b981"];

const PRIORIDAD_ORDER: Record<string, number> = { URGENTE: 0, ALTA: 1, MEDIA: 2, BAJA: 3 };

function getDaysLeft(fecha?: string) {
  if (!fecha) return null;
  const d = new Date(fecha); d.setHours(0,0,0,0);
  const t = new Date(); t.setHours(0,0,0,0);
  return Math.round((d.getTime() - t.getTime()) / 86400000);
}

function FechaChip({ fecha }: { fecha?: string }) {
  if (!fecha) return null;
  const days = getDaysLeft(fecha);
  const d = new Date(fecha);
  const label = d.toLocaleDateString("es-MX", { day: "numeric", month: "short" });
  const color = days !== null && days < 0 ? "#ef4444" : days !== null && days <= 2 ? "#f97316" : "#6b7280";
  return <span style={{ fontSize: 11, color, display: "flex", alignItems: "center", gap: 3 }}>📅 {label}{days !== null && days < 0 ? " · vencida" : days === 0 ? " · hoy" : days === 1 ? " · mañana" : ""}</span>;
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16 }} onClick={onClose}>
      <div style={{ background:"#fff",borderRadius:14,padding:24,width:"100%",maxWidth:520,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,0.15)" }} onClick={e=>e.stopPropagation()}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
          <span style={{ fontWeight:600,fontSize:16 }}>{title}</span>
          <button onClick={onClose} style={{ background:"none",border:"none",fontSize:20,color:"#9b9b98",lineHeight:1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div style={{ marginBottom:14 }}><label style={{ display:"block",fontSize:12,fontWeight:500,color:"#6b7280",marginBottom:5 }}>{label}</label>{children}</div>;
}

const inputSt: React.CSSProperties = { width:"100%",padding:"8px 11px",border:"1px solid #e5e5e3",borderRadius:7,fontSize:14,outline:"none",background:"#fafaf9" };
const btnPrimary: React.CSSProperties = { background:"#18181b",color:"#fff",border:"none",borderRadius:7,padding:"9px 18px",fontSize:13,fontWeight:500,cursor:"pointer" };
const btnSecondary: React.CSSProperties = { background:"transparent",color:"#6b7280",border:"1px solid #e5e5e3",borderRadius:7,padding:"9px 18px",fontSize:13,cursor:"pointer" };

// ─── Empresa Form ─────────────────────────────────────────────────────────────
function EmpresaForm({ initial, onSave, onClose }: { initial?: Empresa; onSave: () => void; onClose: () => void }) {
  const [nombre, setNombre] = useState(initial?.nombre || "");
  const [color, setColor] = useState(initial?.color || COLORES[0]);
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!nombre.trim()) return;
    setLoading(true);
    const url = initial ? `/api/empresas/${initial.id}` : "/api/empresas";
    const method = initial ? "PUT" : "POST";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nombre, color }) });
    setLoading(false);
    onSave();
  }

  return <>
    <Field label="Nombre de la empresa"><input style={inputSt} value={nombre} onChange={e=>setNombre(e.target.value)} placeholder="Ej. ACME Corp" /></Field>
    <Field label="Color identificador">
      <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
        {COLORES.map(c => <button key={c} onClick={()=>setColor(c)} style={{ width:28,height:28,borderRadius:"50%",background:c,border:color===c?"3px solid #18181b":"2px solid transparent",cursor:"pointer" }} />)}
      </div>
    </Field>
    <div style={{ display:"flex",gap:8,justifyContent:"flex-end",marginTop:8 }}>
      <button style={btnSecondary} onClick={onClose}>Cancelar</button>
      <button style={btnPrimary} onClick={submit} disabled={loading}>{loading?"Guardando...":"Guardar"}</button>
    </div>
  </>;
}

// ─── Proyecto Form ────────────────────────────────────────────────────────────
function ProyectoForm({ initial, empresas, onSave, onClose }: { initial?: Proyecto; empresas: Empresa[]; onSave: () => void; onClose: () => void }) {
  const [nombre, setNombre] = useState(initial?.nombre || "");
  const [descripcion, setDescripcion] = useState(initial?.descripcion || "");
  const [empresaId, setEmpresaId] = useState(initial?.empresaId?.toString() || empresas[0]?.id?.toString() || "");
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!nombre.trim() || !empresaId) return;
    setLoading(true);
    const url = initial ? `/api/proyectos/${initial.id}` : "/api/proyectos";
    const method = initial ? "PUT" : "POST";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nombre, descripcion, empresaId: Number(empresaId) }) });
    setLoading(false);
    onSave();
  }

  return <>
    <Field label="Empresa *">
      <select style={inputSt} value={empresaId} onChange={e=>setEmpresaId(e.target.value)}>
        {empresas.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
      </select>
    </Field>
    <Field label="Nombre del proyecto *"><input style={inputSt} value={nombre} onChange={e=>setNombre(e.target.value)} placeholder="Ej. Dashboard Q3" /></Field>
    <Field label="Descripción"><textarea style={{...inputSt,height:80,resize:"none"}} value={descripcion} onChange={e=>setDescripcion(e.target.value)} placeholder="Descripción opcional..." /></Field>
    <div style={{ display:"flex",gap:8,justifyContent:"flex-end",marginTop:8 }}>
      <button style={btnSecondary} onClick={onClose}>Cancelar</button>
      <button style={btnPrimary} onClick={submit} disabled={loading}>{loading?"Guardando...":"Guardar"}</button>
    </div>
  </>;
}

// ─── Tarea Form ───────────────────────────────────────────────────────────────
function TareaForm({ initial, empresas, proyectos, defaultEmpresaId, onSave, onClose }: { initial?: Tarea; empresas: Empresa[]; proyectos: Proyecto[]; defaultEmpresaId?: number; onSave: () => void; onClose: () => void }) {
  const [titulo, setTitulo] = useState(initial?.titulo || "");
  const [descripcion, setDescripcion] = useState(initial?.descripcion || "");
  const [prioridad, setPrioridad] = useState(initial?.prioridad || "MEDIA");
  const [estatus, setEstatus] = useState(initial?.estatus || "PENDIENTE");
  const [fechaLimite, setFechaLimite] = useState(initial?.fechaLimite ? initial.fechaLimite.split("T")[0] : "");
  const [tiempoEstimado, setTiempoEstimado] = useState(initial?.tiempoEstimado?.toString() || "");
  const [solicitante, setSolicitante] = useState(initial?.solicitante || "");
  const [empresaId, setEmpresaId] = useState(initial?.empresaId?.toString() || defaultEmpresaId?.toString() || empresas[0]?.id?.toString() || "");
  const [proyectoId, setProyectoId] = useState(initial?.proyectoId?.toString() || "");
  const [loading, setLoading] = useState(false);

  const proysFiltrados = proyectos.filter(p => p.empresaId === Number(empresaId));

  async function submit() {
    if (!titulo.trim() || !empresaId) return;
    setLoading(true);
    const url = initial ? `/api/tareas/${initial.id}` : "/api/tareas";
    const method = initial ? "PUT" : "POST";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ titulo, descripcion, prioridad, estatus, fechaLimite: fechaLimite || null, tiempoEstimado: tiempoEstimado ? Number(tiempoEstimado) : null, solicitante, empresaId: Number(empresaId), proyectoId: proyectoId ? Number(proyectoId) : null }) });
    setLoading(false);
    onSave();
  }

  return <>
    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
      <div style={{ gridColumn:"1/-1" }}>
        <Field label="Título *"><input style={inputSt} value={titulo} onChange={e=>setTitulo(e.target.value)} placeholder="¿Qué hay que hacer?" /></Field>
      </div>
      <Field label="Empresa *">
        <select style={inputSt} value={empresaId} onChange={e=>{ setEmpresaId(e.target.value); setProyectoId(""); }}>
          {empresas.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
        </select>
      </Field>
      <Field label="Proyecto">
        <select style={inputSt} value={proyectoId} onChange={e=>setProyectoId(e.target.value)}>
          <option value="">Sin proyecto</option>
          {proysFiltrados.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
        </select>
      </Field>
      <Field label="Prioridad">
        <select style={inputSt} value={prioridad} onChange={e=>setPrioridad(e.target.value)}>
          {Object.entries(PRIORIDAD_LABEL).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </Field>
      <Field label="Estatus">
        <select style={inputSt} value={estatus} onChange={e=>setEstatus(e.target.value)}>
          {Object.entries(ESTATUS_LABEL).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </Field>
      <Field label="Fecha límite"><input type="date" style={inputSt} value={fechaLimite} onChange={e=>setFechaLimite(e.target.value)} /></Field>
      <Field label="Tiempo estimado (hrs)"><input type="number" min="0.5" step="0.5" style={inputSt} value={tiempoEstimado} onChange={e=>setTiempoEstimado(e.target.value)} placeholder="0" /></Field>
      <div style={{ gridColumn:"1/-1" }}>
        <Field label="Solicitante"><input style={inputSt} value={solicitante} onChange={e=>setSolicitante(e.target.value)} placeholder="¿Quién lo pidió?" /></Field>
      </div>
      <div style={{ gridColumn:"1/-1" }}>
        <Field label="Notas"><textarea style={{...inputSt,height:80,resize:"none"}} value={descripcion} onChange={e=>setDescripcion(e.target.value)} placeholder="Contexto, detalles, entregables..." /></Field>
      </div>
    </div>
    <div style={{ display:"flex",gap:8,justifyContent:"flex-end",marginTop:8 }}>
      <button style={btnSecondary} onClick={onClose}>Cancelar</button>
      <button style={btnPrimary} onClick={submit} disabled={loading}>{loading?"Guardando...":"Guardar tarea"}</button>
    </div>
  </>;
}

// ─── Tarea Card ───────────────────────────────────────────────────────────────
function TareaCard({ tarea, onEdit, onDelete, onEstatus }: { tarea: Tarea; onEdit: (t: Tarea) => void; onDelete: (id: number) => void; onEstatus: (t: Tarea, s: string) => void }) {
  return (
    <div style={{ background:"#fff",border:"1px solid #e5e5e3",borderRadius:10,padding:"14px 16px",display:"flex",flexDirection:"column",gap:10,boxShadow:"0 1px 2px rgba(0,0,0,0.04)" }}>
      <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8 }}>
        <div style={{ display:"flex",alignItems:"flex-start",gap:10,flex:1,minWidth:0 }}>
          <div style={{ width:3,borderRadius:2,background:PRIORIDAD_COLOR[tarea.prioridad],alignSelf:"stretch",flexShrink:0,minHeight:36 }} />
          <div style={{ flex:1,minWidth:0 }}>
            <div style={{ fontWeight:500,fontSize:14,lineHeight:1.4,color:tarea.estatus==="COMPLETADA"?"#9b9b98":"#1a1a18",textDecoration:tarea.estatus==="COMPLETADA"?"line-through":"none" }}>{tarea.titulo}</div>
            {tarea.descripcion && <div style={{ fontSize:12,color:"#9b9b98",marginTop:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{tarea.descripcion}</div>}
          </div>
        </div>
        <div style={{ display:"flex",gap:4,flexShrink:0 }}>
          <button onClick={()=>onEdit(tarea)} style={{ background:"none",border:"none",color:"#9b9b98",fontSize:16,padding:"2px 5px",borderRadius:5,cursor:"pointer" }} title="Editar">✏️</button>
          <button onClick={()=>onDelete(tarea.id)} style={{ background:"none",border:"none",color:"#9b9b98",fontSize:16,padding:"2px 5px",borderRadius:5,cursor:"pointer" }} title="Eliminar">🗑️</button>
        </div>
      </div>
      <div style={{ display:"flex",flexWrap:"wrap",gap:6,alignItems:"center" }}>
        <span style={{ fontSize:11,fontWeight:500,padding:"2px 8px",borderRadius:20,background:PRIORIDAD_BG[tarea.prioridad],color:PRIORIDAD_COLOR[tarea.prioridad] }}>{PRIORIDAD_LABEL[tarea.prioridad]}</span>
        <span style={{ fontSize:11,padding:"2px 8px",borderRadius:20,background:"#f4f4f3",color:"#6b7280" }}>
          <span style={{ display:"inline-block",width:7,height:7,borderRadius:"50%",background:tarea.empresa.color,marginRight:4 }} />{tarea.empresa.nombre}
        </span>
        {tarea.proyecto && <span style={{ fontSize:11,padding:"2px 8px",borderRadius:20,background:"#f0f0ff",color:"#6366f1" }}>📁 {tarea.proyecto.nombre}</span>}
        {tarea.solicitante && <span style={{ fontSize:11,color:"#9b9b98" }}>👤 {tarea.solicitante}</span>}
        {tarea.tiempoEstimado && <span style={{ fontSize:11,color:"#9b9b98" }}>⏱ {tarea.tiempoEstimado}h</span>}
        <FechaChip fecha={tarea.fechaLimite} />
      </div>
      <div style={{ display:"flex",gap:6 }}>
        {Object.keys(ESTATUS_LABEL).map(s => (
          <button key={s} onClick={()=>onEstatus(tarea, s)} style={{ fontSize:11,padding:"3px 10px",borderRadius:20,border:"1px solid",borderColor:tarea.estatus===s?ESTATUS_COLOR[s]:"#e5e5e3",background:tarea.estatus===s?ESTATUS_COLOR[s]:"transparent",color:tarea.estatus===s?"#fff":"#6b7280",cursor:"pointer",transition:"all 0.15s" }}>
            {ESTATUS_LABEL[s]}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Kanban ───────────────────────────────────────────────────────────────────
function Kanban({ tareas, onEdit, onDelete, onEstatus }: { tareas: Tarea[]; onEdit: (t: Tarea) => void; onDelete: (id: number) => void; onEstatus: (t: Tarea, s: string) => void }) {
  const cols = ["PENDIENTE","EN_PROGRESO","COMPLETADA"] as const;
  return (
    <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,alignItems:"start" }}>
      {cols.map(col => {
        const items = tareas.filter(t => t.estatus === col).sort((a,b) => PRIORIDAD_ORDER[a.prioridad]-PRIORIDAD_ORDER[b.prioridad]);
        return (
          <div key={col}>
            <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:10 }}>
              <span style={{ width:8,height:8,borderRadius:"50%",background:ESTATUS_COLOR[col],display:"inline-block" }} />
              <span style={{ fontWeight:600,fontSize:13,color:"#1a1a18" }}>{ESTATUS_LABEL[col]}</span>
              <span style={{ fontSize:12,color:"#9b9b98",marginLeft:"auto" }}>{items.length}</span>
            </div>
            <div style={{ display:"flex",flexDirection:"column",gap:8,minHeight:120 }}>
              {items.map(t => <TareaCard key={t.id} tarea={t} onEdit={onEdit} onDelete={onDelete} onEstatus={onEstatus} />)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Calendario ───────────────────────────────────────────────────────────────
function Calendario({ tareas }: { tareas: Tarea[] }) {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  const DIAS = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
  const first = new Date(year, month, 1).getDay();
  const total = new Date(year, month+1, 0).getDate();
  const todayStr = new Date().toISOString().split("T")[0];
  const byDate: Record<string,Tarea[]> = {};
  tareas.filter(t=>t.fechaLimite && !t.estatus?.includes("COMPLETADA")).forEach(t=>{
    const k = t.fechaLimite!.split("T")[0];
    if (!byDate[k]) byDate[k] = [];
    byDate[k].push(t);
  });
  return (
    <div>
      <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:16 }}>
        <button onClick={()=>{ if(month===0){setMonth(11);setYear(y=>y-1);}else setMonth(m=>m-1); }} style={{ ...btnSecondary,padding:"5px 12px" }}>‹</button>
        <span style={{ fontWeight:600,fontSize:15 }}>{MESES[month]} {year}</span>
        <button onClick={()=>{ if(month===11){setMonth(0);setYear(y=>y+1);}else setMonth(m=>m+1); }} style={{ ...btnSecondary,padding:"5px 12px" }}>›</button>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4 }}>
        {DIAS.map(d=><div key={d} style={{ textAlign:"center",fontSize:11,fontWeight:500,color:"#9b9b98",padding:"4px 0" }}>{d}</div>)}
        {Array.from({length:first}).map((_,i)=><div key={`e${i}`} />)}
        {Array.from({length:total}).map((_,i)=>{
          const day = i+1;
          const dateStr = `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
          const isToday = dateStr === todayStr;
          const items = (byDate[dateStr]||[]).sort((a,b)=>PRIORIDAD_ORDER[a.prioridad]-PRIORIDAD_ORDER[b.prioridad]);
          return (
            <div key={day} style={{ minHeight:80,border:"1px solid",borderColor:isToday?"#18181b":"#e5e5e3",borderRadius:8,padding:6,background:isToday?"#f8f8f7":"#fff" }}>
              <div style={{ fontSize:12,fontWeight:isToday?600:400,color:isToday?"#18181b":"#6b7280",marginBottom:4 }}>{day}</div>
              {items.slice(0,3).map(t=>(
                <div key={t.id} title={t.titulo} style={{ fontSize:10,padding:"2px 5px",borderRadius:4,background:PRIORIDAD_BG[t.prioridad],color:PRIORIDAD_COLOR[t.prioridad],marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{t.titulo}</div>
              ))}
              {items.length>3 && <div style={{ fontSize:10,color:"#9b9b98" }}>+{items.length-3} más</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Resumen Empresa ──────────────────────────────────────────────────────────
function ResumenEmpresas({ empresas, proyectos, tareas }: { empresas: Empresa[]; proyectos: Proyecto[]; tareas: Tarea[] }) {
  return (
    <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:14 }}>
      {empresas.map(emp => {
        const ts = tareas.filter(t=>t.empresaId===emp.id);
        const ps = proyectos.filter(p=>p.empresaId===emp.id);
        const pendientes = ts.filter(t=>t.estatus==="PENDIENTE").length;
        const enProgreso = ts.filter(t=>t.estatus==="EN_PROGRESO").length;
        const completadas = ts.filter(t=>t.estatus==="COMPLETADA").length;
        const urgentes = ts.filter(t=>t.prioridad==="URGENTE"&&t.estatus!=="COMPLETADA").length;
        return (
          <div key={emp.id} style={{ background:"#fff",border:"1px solid #e5e5e3",borderRadius:12,overflow:"hidden",boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
            <div style={{ background:emp.color,padding:"14px 18px",display:"flex",alignItems:"center",gap:10 }}>
              <div style={{ width:36,height:36,borderRadius:"50%",background:"rgba(255,255,255,0.25)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:700,color:"#fff" }}>{emp.nombre[0].toUpperCase()}</div>
              <div><div style={{ fontWeight:600,color:"#fff",fontSize:15 }}>{emp.nombre}</div><div style={{ fontSize:12,color:"rgba(255,255,255,0.8)" }}>{ps.length} proyectos · {ts.length} tareas</div></div>
            </div>
            <div style={{ padding:"14px 18px" }}>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:12 }}>
                {[["Pendientes",pendientes,"#6b7280"],["En progreso",enProgreso,"#3b82f6"],["Completadas",completadas,"#22c55e"]].map(([l,n,c])=>(
                  <div key={l as string} style={{ textAlign:"center",padding:"8px 4px",borderRadius:8,background:"#f8f8f7" }}>
                    <div style={{ fontSize:20,fontWeight:600,color:c as string }}>{n as number}</div>
                    <div style={{ fontSize:10,color:"#9b9b98" }}>{l as string}</div>
                  </div>
                ))}
              </div>
              {urgentes > 0 && <div style={{ fontSize:12,color:"#ef4444",fontWeight:500,padding:"6px 10px",background:"#fef2f2",borderRadius:7 }}>🔴 {urgentes} tarea{urgentes>1?"s":""} urgente{urgentes>1?"s":""}</div>}
              {ps.length > 0 && (
                <div style={{ marginTop:10 }}>
                  <div style={{ fontSize:11,fontWeight:500,color:"#9b9b98",marginBottom:6 }}>PROYECTOS</div>
                  {ps.map(p=>{
                    const ptareas = tareas.filter(t=>t.proyectoId===p.id);
                    const pdone = ptareas.filter(t=>t.estatus==="COMPLETADA").length;
                    const pct = ptareas.length ? Math.round(pdone/ptareas.length*100) : 0;
                    return (
                      <div key={p.id} style={{ marginBottom:8 }}>
                        <div style={{ display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4 }}><span>{p.nombre}</span><span style={{ color:"#9b9b98" }}>{pct}%</span></div>
                        <div style={{ height:4,background:"#f0f0ef",borderRadius:2 }}><div style={{ height:"100%",background:emp.color,borderRadius:2,width:`${pct}%`,transition:"width 0.3s" }} /></div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Resumen Proyectos ────────────────────────────────────────────────────────
function ResumenProyectos({ proyectos, tareas }: { proyectos: Proyecto[]; tareas: Tarea[] }) {
  return (
    <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
      {proyectos.map(p => {
        const ts = tareas.filter(t=>t.proyectoId===p.id);
        const done = ts.filter(t=>t.estatus==="COMPLETADA").length;
        const pct = ts.length ? Math.round(done/ts.length*100) : 0;
        const porPrioridad: Record<string,number> = { URGENTE:0,ALTA:0,MEDIA:0,BAJA:0 };
        ts.filter(t=>t.estatus!=="COMPLETADA").forEach(t=>porPrioridad[t.prioridad]++);
        return (
          <div key={p.id} style={{ background:"#fff",border:"1px solid #e5e5e3",borderRadius:10,padding:"16px 18px",boxShadow:"0 1px 2px rgba(0,0,0,0.04)" }}>
            <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,marginBottom:10 }}>
              <div>
                <div style={{ fontWeight:600,fontSize:14 }}>{p.nombre}</div>
                <div style={{ display:"flex",alignItems:"center",gap:6,marginTop:3 }}>
                  <span style={{ display:"inline-block",width:7,height:7,borderRadius:"50%",background:p.empresa.color }} />
                  <span style={{ fontSize:12,color:"#6b7280" }}>{p.empresa.nombre}</span>
                  {p.descripcion && <span style={{ fontSize:12,color:"#9b9b98" }}>· {p.descripcion}</span>}
                </div>
              </div>
              <div style={{ textAlign:"right",flexShrink:0 }}>
                <div style={{ fontSize:20,fontWeight:600,color:p.empresa.color }}>{pct}%</div>
                <div style={{ fontSize:11,color:"#9b9b98" }}>{done}/{ts.length} tareas</div>
              </div>
            </div>
            <div style={{ height:6,background:"#f0f0ef",borderRadius:3,marginBottom:10 }}>
              <div style={{ height:"100%",background:p.empresa.color,borderRadius:3,width:`${pct}%`,transition:"width 0.3s" }} />
            </div>
            <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
              {Object.entries(porPrioridad).filter(([,n])=>n>0).map(([k,n])=>(
                <span key={k} style={{ fontSize:11,padding:"2px 8px",borderRadius:20,background:PRIORIDAD_BG[k],color:PRIORIDAD_COLOR[k] }}>{n} {PRIORIDAD_LABEL[k].toLowerCase()}</span>
              ))}
              {ts.length===0 && <span style={{ fontSize:12,color:"#9b9b98" }}>Sin tareas asignadas</span>}
            </div>
          </div>
        );
      })}
      {proyectos.length===0 && <div style={{ textAlign:"center",padding:"2rem",color:"#9b9b98" }}>No hay proyectos creados aún</div>}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [vista, setVista] = useState<"lista"|"kanban"|"calendario"|"empresas"|"proyectos">("lista");
  const [filtroEmpresa, setFiltroEmpresa] = useState<number|null>(null);
  const [filtroProyecto, setFiltroProyecto] = useState<number|null>(null);
  const [filtroPrioridad, setFiltroPrioridad] = useState<"URGENTE"|"ALTA"|"MEDIA"|"BAJA"|null>(null);
  const [modal, setModal] = useState<null|"empresa"|"proyecto"|"tarea">(null);
  const [editEmpresa, setEditEmpresa] = useState<Empresa|undefined>();
  const [editProyecto, setEditProyecto] = useState<Proyecto|undefined>();
  const [editTarea, setEditTarea] = useState<Tarea|undefined>();
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const load = useCallback(async () => {
    const [e,p,t] = await Promise.all([fetch("/api/empresas").then(r=>r.json()), fetch("/api/proyectos").then(r=>r.json()), fetch("/api/tareas").then(r=>r.json())]);
    setEmpresas(Array.isArray(e)?e:[]);
    setProyectos(Array.isArray(p)?p:[]);
    setTareas(Array.isArray(t)?t:[]);
    setLoading(false);
  }, []);

  useEffect(()=>{ load(); }, [load]);

  async function deleteTarea(id: number) {
    if (!confirm("¿Eliminar esta tarea?")) return;
    await fetch(`/api/tareas/${id}`, { method:"DELETE" });
    load();
  }

  async function updateEstatus(tarea: Tarea, estatus: string) {
    await fetch(`/api/tareas/${tarea.id}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body: JSON.stringify({...tarea, estatus, fechaLimite: tarea.fechaLimite?.split("T")[0]||null}) });
    load();
  }

  async function deleteEmpresa(id: number) {
    if (!confirm("¿Eliminar esta empresa y todos sus datos?")) return;
    await fetch(`/api/empresas/${id}`, { method:"DELETE" });
    if (filtroEmpresa===id) setFiltroEmpresa(null);
    load();
  }

  async function deleteProyecto(id: number) {
    if (!confirm("¿Eliminar este proyecto?")) return;
    await fetch(`/api/proyectos/${id}`, { method:"DELETE" });
    if (filtroProyecto===id) setFiltroProyecto(null);
    load();
  }

  function closeModal() { setModal(null); setEditEmpresa(undefined); setEditProyecto(undefined); setEditTarea(undefined); }
  function afterSave() { closeModal(); load(); }

  // Filtered tareas
  let tareasFiltradas = [...tareas];
  if (filtroEmpresa) tareasFiltradas = tareasFiltradas.filter(t=>t.empresaId===filtroEmpresa);
  if (filtroProyecto) tareasFiltradas = tareasFiltradas.filter(t=>t.proyectoId===filtroProyecto);
  if (filtroPrioridad) tareasFiltradas = tareasFiltradas.filter(t=>t.prioridad===filtroPrioridad);
  tareasFiltradas.sort((a,b)=>{ if(a.estatus==="COMPLETADA"&&b.estatus!=="COMPLETADA") return 1; if(b.estatus==="COMPLETADA"&&a.estatus!=="COMPLETADA") return -1; return PRIORIDAD_ORDER[a.prioridad]-PRIORIDAD_ORDER[b.prioridad]; });

  const pendientes = tareas.filter(t=>t.estatus==="PENDIENTE").length;
  const urgentes = tareas.filter(t=>t.prioridad==="URGENTE"&&t.estatus!=="COMPLETADA").length;
  const hoy = new Date(); hoy.setHours(0,0,0,0);
  const vencidas = tareas.filter(t=>t.fechaLimite&&t.estatus!=="COMPLETADA"&&new Date(t.fechaLimite)<hoy).length;

  const VISTAS = [
    { id:"lista", label:"Lista", icon:"☰" },
    { id:"kanban", label:"Kanban", icon:"▦" },
    { id:"calendario", label:"Calendario", icon:"📅" },
    { id:"empresas", label:"Por empresa", icon:"🏢" },
    { id:"proyectos", label:"Por proyecto", icon:"📁" },
  ] as const;

  if (loading) return <div style={{ display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",color:"#9b9b98",fontSize:14 }}>Cargando...</div>;

  return (
    <div style={{ display:"flex",minHeight:"100vh",background:"var(--bg)" }}>
      {/* Sidebar */}
      <aside style={{ width:sidebarOpen?240:0,minWidth:sidebarOpen?240:0,background:"#fff",borderRight:"1px solid #e5e5e3",display:"flex",flexDirection:"column",overflow:"hidden",transition:"all 0.2s",flexShrink:0 }}>
        <div style={{ padding:"20px 16px 12px" }}>
          <div style={{ fontWeight:700,fontSize:16,color:"#18181b",marginBottom:4 }}>Personaldash</div>
          <div style={{ fontSize:12,color:"#9b9b98" }}>Sistema de tareas</div>
        </div>

        {/* Stats */}
        <div style={{ padding:"0 12px 12px",display:"flex",gap:6 }}>
          <div style={{ flex:1,textAlign:"center",padding:"8px 4px",background:pendientes>0?"#f8f8f7":"#f8f8f7",borderRadius:8 }}>
            <div style={{ fontSize:18,fontWeight:600 }}>{pendientes}</div><div style={{ fontSize:10,color:"#9b9b98" }}>Pendientes</div>
          </div>
          <div style={{ flex:1,textAlign:"center",padding:"8px 4px",background:urgentes>0?"#fef2f2":"#f8f8f7",borderRadius:8 }}>
            <div style={{ fontSize:18,fontWeight:600,color:urgentes>0?"#ef4444":"#1a1a18" }}>{urgentes}</div><div style={{ fontSize:10,color:"#9b9b98" }}>Urgentes</div>
          </div>
          <div style={{ flex:1,textAlign:"center",padding:"8px 4px",background:vencidas>0?"#fff7ed":"#f8f8f7",borderRadius:8 }}>
            <div style={{ fontSize:18,fontWeight:600,color:vencidas>0?"#f97316":"#1a1a18" }}>{vencidas}</div><div style={{ fontSize:10,color:"#9b9b98" }}>Vencidas</div>
          </div>
        </div>

        <div style={{ height:1,background:"#e5e5e3",margin:"0 12px 12px" }} />

        {/* Empresas */}
        <div style={{ padding:"0 12px",flex:1,overflowY:"auto" }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8 }}>
            <span style={{ fontSize:11,fontWeight:600,color:"#9b9b98",letterSpacing:"0.05em" }}>EMPRESAS</span>
            <button onClick={()=>{setEditEmpresa(undefined);setModal("empresa");}} style={{ fontSize:16,background:"none",border:"none",color:"#9b9b98",cursor:"pointer",lineHeight:1 }} title="Nueva empresa">+</button>
          </div>
          <button onClick={()=>{setFiltroEmpresa(null);setFiltroProyecto(null);}} style={{ width:"100%",textAlign:"left",padding:"6px 10px",borderRadius:7,border:"none",background:filtroEmpresa===null?"#f4f4f3":"transparent",cursor:"pointer",fontSize:13,color:"#1a1a18",marginBottom:2 }}>
            Todas las empresas
          </button>
          {empresas.map(emp=>(
            <div key={emp.id} style={{ display:"flex",alignItems:"center",gap:6,marginBottom:2 }}>
              <button onClick={()=>{setFiltroEmpresa(emp.id);setFiltroProyecto(null);}} style={{ flex:1,textAlign:"left",padding:"6px 10px",borderRadius:7,border:"none",background:filtroEmpresa===emp.id?"#f4f4f3":"transparent",cursor:"pointer",fontSize:13,color:"#1a1a18",display:"flex",alignItems:"center",gap:8 }}>
                <span style={{ width:8,height:8,borderRadius:"50%",background:emp.color,flexShrink:0 }} />
                <span style={{ flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{emp.nombre}</span>
                <span style={{ fontSize:11,color:"#9b9b98" }}>{emp._count?.tareas||0}</span>
              </button>
              <button onClick={()=>{setEditEmpresa(emp);setModal("empresa");}} style={{ background:"none",border:"none",color:"#c9c9c6",fontSize:13,cursor:"pointer",padding:"3px" }}>✏</button>
              <button onClick={()=>deleteEmpresa(emp.id)} style={{ background:"none",border:"none",color:"#c9c9c6",fontSize:13,cursor:"pointer",padding:"3px" }}>✕</button>
            </div>
          ))}

          <div style={{ height:1,background:"#e5e5e3",margin:"12px 0" }} />

          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8 }}>
            <span style={{ fontSize:11,fontWeight:600,color:"#9b9b98",letterSpacing:"0.05em" }}>PROYECTOS</span>
            <button onClick={()=>{setEditProyecto(undefined);setModal("proyecto");}} style={{ fontSize:16,background:"none",border:"none",color:"#9b9b98",cursor:"pointer",lineHeight:1 }} title="Nuevo proyecto">+</button>
          </div>
          {(filtroEmpresa ? proyectos.filter(p=>p.empresaId===filtroEmpresa) : proyectos).map(p=>(
            <div key={p.id} style={{ display:"flex",alignItems:"center",gap:6,marginBottom:2 }}>
              <button onClick={()=>setFiltroProyecto(filtroProyecto===p.id?null:p.id)} style={{ flex:1,textAlign:"left",padding:"6px 10px",borderRadius:7,border:"none",background:filtroProyecto===p.id?"#f0f0ff":"transparent",cursor:"pointer",fontSize:13,color:"#1a1a18",display:"flex",alignItems:"center",gap:8 }}>
                <span style={{ fontSize:12 }}>📁</span>
                <span style={{ flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{p.nombre}</span>
                <span style={{ fontSize:11,color:"#9b9b98" }}>{p._count?.tareas||0}</span>
              </button>
              <button onClick={()=>{setEditProyecto(p);setModal("proyecto");}} style={{ background:"none",border:"none",color:"#c9c9c6",fontSize:13,cursor:"pointer",padding:"3px" }}>✏</button>
              <button onClick={()=>deleteProyecto(p.id)} style={{ background:"none",border:"none",color:"#c9c9c6",fontSize:13,cursor:"pointer",padding:"3px" }}>✕</button>
            </div>
          ))}
        </div>

        <div style={{ padding:"12px 16px",borderTop:"1px solid #e5e5e3" }}>
          <button onClick={()=>setModal("tarea")} style={{ ...btnPrimary,width:"100%",padding:"10px",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",gap:6 }}>
            + Nueva tarea
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex:1,display:"flex",flexDirection:"column",minWidth:0 }}>
        {/* Topbar */}
        <div style={{ background:"#fff",borderBottom:"1px solid #e5e5e3",padding:"0 20px",display:"flex",alignItems:"center",gap:12,height:56,flexShrink:0 }}>
          <button onClick={()=>setSidebarOpen(o=>!o)} style={{ background:"none",border:"none",fontSize:18,color:"#9b9b98",cursor:"pointer",padding:"4px",borderRadius:6 }}>☰</button>
          <div style={{ display:"flex",gap:2,flex:1 }}>
            {VISTAS.map(v=>(
              <button key={v.id} onClick={()=>setVista(v.id)} style={{ padding:"6px 12px",borderRadius:7,border:"none",background:vista===v.id?"#f4f4f3":"transparent",color:vista===v.id?"#1a1a18":"#6b7280",fontWeight:vista===v.id?500:400,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",gap:5 }}>
                <span>{v.icon}</span> {v.label}
              </button>
            ))}
          </div>
          {/* Filtros prioridad */}
          <div style={{ display:"flex",gap:4 }}>
            {["URGENTE","ALTA","MEDIA","BAJA"].map(p=>(
              <button key={p} onClick={()=>setFiltroPrioridad(filtroPrioridad===p?null:p as "URGENTE"|"ALTA"|"MEDIA"|"BAJA")} style={{ fontSize:11,padding:"3px 8px",borderRadius:20,border:"1px solid",borderColor:filtroPrioridad===p?PRIORIDAD_COLOR[p]:"#e5e5e3",background:filtroPrioridad===p?PRIORIDAD_BG[p]:"transparent",color:filtroPrioridad===p?PRIORIDAD_COLOR[p]:"#9b9b98",cursor:"pointer" }}>
                {PRIORIDAD_LABEL[p]}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex:1,padding:20,overflowY:"auto" }}>
          {/* Header */}
          <div style={{ marginBottom:18,display:"flex",alignItems:"center",justifyContent:"space-between" }}>
            <div>
              <h1 style={{ fontSize:20,fontWeight:600,color:"#1a1a18" }}>
                {filtroProyecto ? proyectos.find(p=>p.id===filtroProyecto)?.nombre : filtroEmpresa ? empresas.find(e=>e.id===filtroEmpresa)?.nombre : "Todas las tareas"}
              </h1>
              <p style={{ fontSize:13,color:"#9b9b98",marginTop:2 }}>{tareasFiltradas.length} tarea{tareasFiltradas.length!==1?"s":""}{filtroPrioridad?` · ${PRIORIDAD_LABEL[filtroPrioridad].toLowerCase()}`:""}</p>
            </div>
            <button onClick={()=>{setEditTarea(undefined);setModal("tarea");}} style={{ ...btnPrimary,display:"flex",alignItems:"center",gap:6,padding:"9px 16px",fontSize:13 }}>+ Nueva tarea</button>
          </div>

          {vista==="lista" && (
            <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
              {tareasFiltradas.length===0 ? (
                <div style={{ textAlign:"center",padding:"3rem",color:"#9b9b98",background:"#fff",borderRadius:12,border:"1px dashed #e5e5e3" }}>
                  <div style={{ fontSize:32,marginBottom:8 }}>✓</div>
                  <div>No hay tareas aquí</div>
                  <button onClick={()=>setModal("tarea")} style={{ ...btnPrimary,marginTop:12,fontSize:12,padding:"7px 14px" }}>Crear primera tarea</button>
                </div>
              ) : tareasFiltradas.map(t=><TareaCard key={t.id} tarea={t} onEdit={t=>{setEditTarea(t);setModal("tarea");}} onDelete={deleteTarea} onEstatus={updateEstatus} />)}
            </div>
          )}

          {vista==="kanban" && <Kanban tareas={tareasFiltradas} onEdit={t=>{setEditTarea(t);setModal("tarea");}} onDelete={deleteTarea} onEstatus={updateEstatus} />}
          {vista==="calendario" && <Calendario tareas={tareasFiltradas} />}
          {vista==="empresas" && <ResumenEmpresas empresas={filtroEmpresa?empresas.filter(e=>e.id===filtroEmpresa):empresas} proyectos={proyectos} tareas={tareas} />}
          {vista==="proyectos" && <ResumenProyectos proyectos={filtroProyecto?proyectos.filter(p=>p.id===filtroProyecto):filtroEmpresa?proyectos.filter(p=>p.empresaId===filtroEmpresa):proyectos} tareas={tareas} />}
        </div>
      </main>

      {/* Modals */}
      {modal==="empresa" && <Modal title={editEmpresa?"Editar empresa":"Nueva empresa"} onClose={closeModal}><EmpresaForm initial={editEmpresa} onSave={afterSave} onClose={closeModal} /></Modal>}
      {modal==="proyecto" && <Modal title={editProyecto?"Editar proyecto":"Nuevo proyecto"} onClose={closeModal}><ProyectoForm initial={editProyecto} empresas={empresas} onSave={afterSave} onClose={closeModal} /></Modal>}
      {modal==="tarea" && <Modal title={editTarea?"Editar tarea":"Nueva tarea"} onClose={closeModal}><TareaForm initial={editTarea} empresas={empresas} proyectos={proyectos} defaultEmpresaId={filtroEmpresa||undefined} onSave={afterSave} onClose={closeModal} /></Modal>}
    </div>
  );
}
