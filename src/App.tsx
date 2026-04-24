import * as React from "react";

type TrackingStatus = "En avance" | "En proceso" | "Pendiente";
type Priority = "Alta" | "Media" | "Baja";

type TrackingPoint = {
  titulo: string;
  estado: TrackingStatus;
  nota: string;
  fechaLimite: string;
  responsable: string;
  prioridad: Priority;
};

type Product = {
  nombre: string;
  descripcion: string;
  imagen: string;
};

type AccountState = {
  cuenta: string;
  estado: TrackingStatus;
  responsable: string;
  fecha: string;
  ciudad: string;
  objetivo: string;
  resumen: string;
  comentariosCliente: string;
  casosTocados: string[];
  avances: string[];
  proximosPasos: string[];
  puntosSeguimiento: TrackingPoint[];
  productos: Product[];
};

type SavedMinuta = {
  slug: string;
  cuenta: string;
  data: {
    account: AccountState;
    logoPrint?: string;
    logoClient?: string;
  };
  updated_at?: string;
};

const placeholder = "https://placehold.co/900x650/F5F1E8/C62828?text=";
const SUPABASE_URL = "https://ycacnaklfvikrlrajdli.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_YpynWeGYxFSujT2gxDZ5IA_hWvyKf2E";
const DEFAULT_SLUG = "alimentos-mary";

function hasValidSupabaseKey() {
  if (!SUPABASE_PUBLISHABLE_KEY) return false;
  const cleanKey = SUPABASE_PUBLISHABLE_KEY.trim();
  return cleanKey.startsWith("sb_publishable_") && !cleanKey.includes("PEGA_AQUI") && cleanKey.length > 30;
}

async function supabaseRequest(path: string, options: RequestInit = {}) {
  if (!hasValidSupabaseKey()) {
    throw new Error("Falta pegar la Publishable key de Supabase.");
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Error conectando con Supabase");
  }

  if (response.status === 204) return null;
  return response.json();
}

function makeSlug(value: string) {
  const slug = value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return slug || DEFAULT_SLUG;
}

const initialAccount: AccountState = {
  cuenta: "Alimentos Mary",
  estado: "En proceso",
  responsable: "Equipo de ventas · Print'n Run",
  fecha: "23 de mayo de 2026",
  ciudad: "Caracas, Venezuela",
  objetivo: "Reuniones estratégicas con cuentas clave",
  resumen: "Seguimiento de oportunidades detectadas durante la reunión, con foco en productos promocionales, ambientación y propuestas de desarrollo alineadas a la marca.",
  comentariosCliente: "Interés en soluciones promocionales, productos de campaña y desarrollo de piezas funcionales con potencial de visibilidad y recordación de marca.",
  casosTocados: ["Llaveros sensoriales", "Banderín vehicular", "Rompetráfico", "Uniformes para promotores", "Toallas promocionales", "Contenedores funcionales"],
  avances: ["Presentación de distintas líneas de producto con enfoque promocional", "Evaluación de piezas de campaña temática 2026", "Identificación de oportunidades para ambientación de puntos de venta"],
  proximosPasos: ["Consolidar productos priorizados", "Definir volúmenes estimados", "Desarrollar propuestas ajustadas por línea"],
  puntosSeguimiento: [
    { titulo: "Llaveros sensoriales", estado: "En proceso", nota: "Pendiente de validación visual y definición de cantidades.", fechaLimite: "27/may/2026", responsable: "Equipo comercial", prioridad: "Alta" },
    { titulo: "Banderín vehicular", estado: "En avance", nota: "Propuesta presentada y en revisión interna.", fechaLimite: "30/may/2026", responsable: "Diseño y ventas", prioridad: "Media" },
    { titulo: "Rompetráfico", estado: "Pendiente", nota: "A la espera de confirmación para siguiente fase.", fechaLimite: "03/jun/2026", responsable: "Producción", prioridad: "Alta" }
  ],
  productos: [
    { nombre: "Llaveros sensoriales", descripcion: "Propuesta promocional con alto potencial de recordación de marca.", imagen: `${placeholder}Llaveros+sensoriales` },
    { nombre: "Banderín vehicular", descripcion: "Solución de visibilidad para exterior y activaciones móviles.", imagen: `${placeholder}Banderin+vehicular` },
    { nombre: "Rompetráfico", descripcion: "Elemento de impacto visual para punto de venta.", imagen: `${placeholder}Rompetráfico` }
  ]
};

const newPoint = (): TrackingPoint => ({ titulo: "Nuevo punto", estado: "Pendiente", nota: "Agregar detalle del seguimiento.", fechaLimite: "Sin definir", responsable: "Por asignar", prioridad: "Media" });
const newProduct = (): Product => ({ nombre: "Nuevo producto", descripcion: "Agregar descripción del producto.", imagen: `${placeholder}Nuevo+producto` });

function fileToDataUrl(file: File, callback: (value: string) => void): void {
  const reader = new FileReader();
  reader.onload = () => {
    if (typeof reader.result === "string") callback(reader.result);
  };
  reader.readAsDataURL(file);
}

function statusClass(status: TrackingStatus): string {
  if (status === "En avance") return "bg-[#DDF1EE] text-[#178E89]";
  if (status === "En proceso") return "bg-[#FCE9D9] text-[#D6801D]";
  return "bg-[#ECECEC] text-[#686868]";
}

function priorityClass(priority: Priority): string {
  if (priority === "Alta") return "border-[#C62828] text-[#C62828]";
  if (priority === "Media") return "border-[#EA8D2D] text-[#A86112]";
  return "border-[#2EA6A4] text-[#178E89]";
}

function Panel({ title, right, children }: { title: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-[#E8DED0] bg-[#F7F5F0] p-4 md:p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h3 className="text-lg font-black uppercase tracking-tight text-[#0B6672] md:text-xl">{title}</h3>
        {right}
      </div>
      {children}
    </section>
  );
}

function StatCard({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-2xl border border-[#E7E0D6] bg-white p-5">
      <div className="text-4xl font-black text-[#2EA6A4]">{value}</div>
      <div className="mt-2 text-sm font-medium text-[#47535A]">{label}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: TrackingStatus }) {
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(status)}`}>{status}</span>;
}

export default function App() {
  const [account, setAccount] = React.useState<AccountState>(initialAccount);
  const [view, setView] = React.useState<"general" | "detalle">("general");
  const [section, setSection] = React.useState("resumen");
  const [clientMode, setClientMode] = React.useState(false);
  const [logoPrint, setLogoPrint] = React.useState("");
  const [logoClient, setLogoClient] = React.useState("");
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = React.useState<string | null>(null);
  const [shareLink, setShareLink] = React.useState("");
  const [isClientLink, setIsClientLink] = React.useState(false);
  const [currentSlug, setCurrentSlug] = React.useState(DEFAULT_SLUG);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [connectionError, setConnectionError] = React.useState("");

  const canEdit = !isClientLink && !clientMode && view === "detalle";

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const client = params.get("client");
    const slugFromUrl = params.get("slug") || DEFAULT_SLUG;
    setCurrentSlug(slugFromUrl);
    if (client === "true") {
      setClientMode(true);
      setIsClientLink(true);
      setView("general");
    }
    if (!hasValidSupabaseKey()) {
      setConnectionError("Falta pegar la Publishable key de Supabase en SUPABASE_PUBLISHABLE_KEY.");
      return;
    }
    const loadMinuta = async () => {
      setIsLoading(true);
      setConnectionError("");
      try {
        const rows = (await supabaseRequest(`minutas?slug=eq.${encodeURIComponent(slugFromUrl)}&select=*`)) as SavedMinuta[];
        if (Array.isArray(rows) && rows.length > 0) {
          const saved = rows[0];
          if (saved.data?.account) setAccount(saved.data.account);
          if (saved.data?.logoPrint) setLogoPrint(saved.data.logoPrint);
          if (saved.data?.logoClient) setLogoClient(saved.data.logoClient);
          if (saved.updated_at) setLastSavedAt(new Date(saved.updated_at).toLocaleString());
        }
      } catch (error) {
        console.error(error);
        setConnectionError("No se pudo cargar la minuta desde Supabase. Revisa la Publishable key y las políticas RLS.");
      } finally {
        setIsLoading(false);
      }
    };
    void loadMinuta();
  }, []);

  const metrics = React.useMemo(() => {
    const counts = account.puntosSeguimiento.reduce(
      (acc, item) => {
        if (item.estado === "En avance") acc.enAvance += 1;
        if (item.estado === "En proceso") acc.enProceso += 1;
        if (item.estado === "Pendiente") acc.pendiente += 1;
        return acc;
      },
      { enAvance: 0, enProceso: 0, pendiente: 0 }
    );
    const total = Math.max(account.puntosSeguimiento.length, 1);
    return {
      ...counts,
      progreso: Math.round(((counts.enAvance + counts.enProceso * 0.5) / total) * 100),
      casos: account.casosTocados.length,
      pasos: account.proximosPasos.length,
      avances: account.avances.length,
      puntos: account.puntosSeguimiento.length
    };
  }, [account]);

  const donutA = (metrics.enAvance * 100) / Math.max(account.puntosSeguimiento.length, 1);
  const donutB = ((metrics.enAvance + metrics.enProceso) * 100) / Math.max(account.puntosSeguimiento.length, 1);
  const donutStyle: React.CSSProperties = { background: `conic-gradient(#2EA6A4 0 ${donutA}%, #EA8D2D ${donutA}% ${donutB}%, #D3D3D3 ${donutB}% 100%)` };

  const updateField = (field: keyof AccountState, value: string) => setAccount((prev) => ({ ...prev, [field]: value }));
  const updateList = (field: "casosTocados" | "avances" | "proximosPasos", index: number, value: string) => setAccount((prev) => ({ ...prev, [field]: prev[field].map((item, i) => (i === index ? value : item)) }));
  const addListItem = (field: "casosTocados" | "avances" | "proximosPasos") => setAccount((prev) => ({ ...prev, [field]: [...prev[field], "Nuevo elemento"] }));
  const removeListItem = (field: "casosTocados" | "avances" | "proximosPasos", index: number) => setAccount((prev) => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
  const updatePoint = (index: number, field: keyof TrackingPoint, value: string) => setAccount((prev) => ({ ...prev, puntosSeguimiento: prev.puntosSeguimiento.map((item, i) => (i === index ? { ...item, [field]: value } : item)) }));
  const updateProduct = (index: number, field: keyof Product, value: string) => setAccount((prev) => ({ ...prev, productos: prev.productos.map((item, i) => (i === index ? { ...item, [field]: value } : item)) }));

  const saveChanges = async () => {
    setIsSaving(true);
    setConnectionError("");
    try {
      const slug = makeSlug(account.cuenta);
      setCurrentSlug(slug);
      const payload = { slug, cuenta: account.cuenta, data: { account, logoPrint, logoClient }, updated_at: new Date().toISOString() };
      await supabaseRequest("minutas?on_conflict=slug", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=representation" },
        body: JSON.stringify(payload)
      });
      setLastSavedAt(new Date().toLocaleString());
      alert("Cambios guardados en Supabase.");
      return slug;
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Error desconocido";
      setConnectionError(message);
      alert(message.includes("Publishable key") ? message : "No se pudieron guardar los cambios en Supabase. Revisa la Publishable key.");
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const exportMinuta = () => {
    try {
      const payload = { account, logoPrint, logoClient, exportedAt: new Date().toISOString() };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "minuta-mary.json";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert("No se pudo descargar. Revisa la consola para copiar la minuta.");
    }
  };

 const generateShareLink = async () => {
  const slug = await saveChanges();
  if (!slug) return;

  const baseUrl = "https://seguimiento-printn-run.vercel.app";

  setShareLink(`${baseUrl}?client=true&slug=${encodeURIComponent(slug)}`);
};

const showSummary = section === "resumen" || section === "detalle";
const showProducts = section === "productos" || section === "galeria" || section === "resumen";
const showTracking = section === "pasos" || section === "detalle" || section === "resumen";
const listFields: Array<[string, "casosTocados" | "proximosPasos" | "avances"]> = [["Casos tratados", "casosTocados"], ["Próximos pasos", "proximosPasos"], ["Avances actuales", "avances"]];

if (isLoading) {
  return (
    <div className="min-h-screen bg-[#EFEBE5] p-4 text-[#24343A] md:p-6">
      <div className="mx-auto flex min-h-[80vh] max-w-[1500px] items-center justify-center">
        <div className="rounded-3xl border border-[#DED5C8] bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-5 h-12 w-12 animate-pulse rounded-full bg-[#2EA6A4]" />
          <div className="text-xl font-black text-[#083E48]">Cargando minuta</div>
          <div className="mt-2 text-sm text-[#5B676D]">Estamos preparando la información del cliente.</div>
        </div>
      </div>
    </div>
  );
}

  <nav className="space-y-2">
  {[
    ["resumen", "Resumen general"],
    ["detalle", "Vista detallada"],
    ["productos", "Productos"],
    ["pasos", "Próximos pasos"],
    ["galeria", "Galería"],
  ].map(([id, label]) => (
    <button
      key={id}
      onClick={() => setSection(id)}
      className={`w-full rounded-xl px-4 py-4 text-left font-medium ${
        section === id
          ? "bg-[#2EA6A4] text-white"
          : "text-[#314248] hover:bg-[#F5F2EC]"
      }`}
    >
      {label}
    </button>
  ))}
</nav>

{!isClientLink && (
  <div className="mt-auto space-y-4 rounded-2xl border-2 border-dashed border-[#8CCFCD] bg-[#FAFCFB] p-5 text-center">
    <div className="font-medium text-[#0B6672]">Minuta editable</div>
    <div className="text-xs text-[#6B767B]">Cliente: {currentSlug}</div>

    <button
      onClick={saveChanges}
      disabled={isSaving}
      className="w-full rounded-xl bg-[#2EA6A4] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
    >
      {isSaving ? "Guardando..." : "Guardar cambios"}
    </button>

    <button
      onClick={exportMinuta}
      className="w-full rounded-xl border border-[#2EA6A4] bg-white px-4 py-3 text-sm font-semibold text-[#2EA6A4]"
    >
      Exportar minuta
    </button>

    <button
      onClick={() => setClientMode((prev) => !prev)}
      className="w-full rounded-xl border border-[#D8D0C2] bg-white px-4 py-3 text-sm font-semibold text-[#32434A]"
    >
      {clientMode ? "Volver a edición" : "Modo cliente"}
    </button>

    <button
      onClick={generateShareLink}
      disabled={isSaving}
      className="w-full rounded-xl bg-[#083E48] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
    >
      Generar link para cliente
    </button>

    {shareLink && (
      <div className="rounded-2xl border border-[#8CCFCD] bg-white p-3 text-left">
        <div className="mb-2 text-xs font-semibold text-[#0B6672]">
          Link cliente generado
        </div>
        <textarea
          readOnly
          value={shareLink}
          onFocus={(e) => e.currentTarget.select()}
          className="h-24 w-full rounded-xl border border-[#D9D3CA] p-2 text-xs outline-none"
        />
        <div className="mt-1 text-[11px] text-[#6B767B]">
          Haz clic dentro del cuadro, selecciona y copia manualmente.
        </div>
      </div>
    )}

    {lastSavedAt && (
      <div className="text-xs text-[#6B767B]">Guardado: {lastSavedAt}</div>
    )}

    <div className="space-y-3 text-left">
      <label className="block text-sm font-medium text-[#0B6672]">
        Cargar logo Print'n Run
        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            e.target.files?.[0] &&
            fileToDataUrl(e.target.files[0], setLogoPrint)
          }
          className="mt-2 block w-full text-sm"
        />
      </label>

      <label className="block text-sm font-medium text-[#0B6672]">
        Cargar logo del cliente
        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            e.target.files?.[0] &&
            fileToDataUrl(e.target.files[0], setLogoClient)
          }
          className="mt-2 block w-full text-sm"
        />
      </label>
    </div>
  </div>
)}

</aside>
          <main className="space-y-5">
            {connectionError && !isClientLink && <div className="rounded-2xl border border-[#F2C2B8] bg-[#FFF3EF] p-4 text-sm font-semibold text-[#A13B2A]">{connectionError}</div>}
            <header className="rounded-2xl border border-[#DED5C8] bg-white p-6 md:p-8">
              <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                <div className="space-y-5">
                  {logoClient ? <img src={logoClient} alt={account.cuenta} className="h-20 w-auto object-contain" /> : <div className="text-[42px] font-black uppercase text-[#C62828]">{account.cuenta}</div>}
                  <div><h1 className="text-4xl font-black uppercase tracking-[-0.04em] text-[#083E48] md:text-6xl">Minuta de visita comercial</h1><p className="mt-2 text-2xl text-[#4F5D63]">{account.ciudad}</p></div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {[["Cuenta", "cuenta", account.cuenta], ["Fecha", "fecha", account.fecha], ["Equipo de ventas", "responsable", account.responsable], ["Objetivo del viaje", "objetivo", account.objetivo]].map(([label, field, value]) => (
                      <div key={field}><div className="font-semibold text-[#0B6672]">{label}</div>{canEdit ? <input value={value} onChange={(e) => updateField(field as keyof AccountState, e.target.value)} className="mt-1 w-full rounded-xl border border-[#D9D3CA] px-3 py-2 outline-none focus:ring-2 focus:ring-[#2EA6A4]" /> : <div className="mt-1 text-[#46545A]">{value}</div>}</div>
                    ))}
                  </div>
                </div>
                {!clientMode && <div className="flex flex-wrap gap-3 xl:justify-end"><button onClick={() => setView("general")} className={`rounded-xl border px-5 py-4 text-sm font-semibold ${view === "general" ? "border-[#2EA6A4] bg-[#2EA6A4] text-white" : "border-[#2EA6A4] bg-white text-[#32434A]"}`}>Vista general</button><button onClick={() => setView("detalle")} className={`rounded-xl border px-5 py-4 text-sm font-semibold ${view === "detalle" ? "border-[#2EA6A4] bg-[#2EA6A4] text-white" : "border-[#2EA6A4] bg-white text-[#32434A]"}`}>Vista detallada</button></div>}
              </div>
            </header>
            {showSummary && <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.7fr_0.9fr]"><Panel title="Resumen general"><div className="grid grid-cols-1 gap-4 md:grid-cols-4"><StatCard value={1} label="Reunión realizada" /><StatCard value={metrics.casos} label="Casos tratados" /><StatCard value={metrics.pasos} label="Próximos pasos" /><StatCard value={metrics.avances} label="Avances actuales" /></div></Panel><Panel title="Estado general de la cuenta"><div className="flex items-center gap-6"><div className="relative h-36 w-36 rounded-full" style={donutStyle}><div className="absolute inset-6 rounded-full bg-[#F7F5F0]" /></div><div className="space-y-3 text-[#4B5A60]"><div>En avance: {metrics.enAvance}</div><div>En proceso: {metrics.enProceso}</div><div>Pendiente: {metrics.pendiente}</div></div></div></Panel></div>}
            {showSummary && <Panel title="Estado de la cuenta" right={<StatusBadge status={account.estado} />}><div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_1fr]"><div className="space-y-4"><div><div className="mb-2 text-sm text-[#66757B]">Progreso general</div><div className="h-3 w-full overflow-hidden rounded-full bg-[#DCDCDC]"><div className="h-full rounded-full bg-[#EA8D2D]" style={{ width: `${metrics.progreso}%` }} /></div></div><div className="grid grid-cols-3 gap-4"><StatCard value={metrics.casos} label="Casos tratados" /><StatCard value={metrics.pasos} label="Próximos pasos" /><StatCard value={metrics.puntos} label="Puntos activos" /></div></div><div className="grid grid-cols-1 gap-4 md:grid-cols-2"><div className="rounded-2xl border border-[#E7E0D6] bg-white p-4"><div className="mb-3 font-bold text-[#0B6672]">Resumen</div>{canEdit ? <textarea value={account.resumen} onChange={(e) => updateField("resumen", e.target.value)} rows={6} className="w-full rounded-xl border border-[#D9D3CA] px-3 py-2 outline-none focus:ring-2 focus:ring-[#2EA6A4]" /> : <p className="text-sm leading-6 text-[#566469]">{account.resumen}</p>}</div><div className="rounded-2xl border border-[#E7E0D6] bg-white p-4"><div className="mb-3 font-bold text-[#0B6672]">Comentarios del cliente</div>{canEdit ? <textarea value={account.comentariosCliente} onChange={(e) => updateField("comentariosCliente", e.target.value)} rows={6} className="w-full rounded-xl border border-[#D9D3CA] px-3 py-2 outline-none focus:ring-2 focus:ring-[#2EA6A4]" /> : <p className="text-sm leading-6 text-[#566469]">{account.comentariosCliente}</p>}</div></div></div></Panel>}
            {!clientMode && (section === "detalle" || section === "resumen") && <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">{listFields.map(([title, field]) => <Panel key={field} title={title} right={canEdit ? <button onClick={() => addListItem(field)} className="rounded-xl bg-[#2EA6A4] px-4 py-2 text-sm font-semibold text-white">Agregar</button> : undefined}><div className="space-y-3">{account[field].map((item, index) => <div key={`${field}-${index}`} className="rounded-2xl border border-[#E7E0D6] bg-white p-3">{canEdit ? <div className="flex gap-3"><input value={item} onChange={(e) => updateList(field, index, e.target.value)} className="w-full rounded-xl border border-[#D9D3CA] px-3 py-2 outline-none focus:ring-2 focus:ring-[#2EA6A4]" /><button onClick={() => removeListItem(field, index)} className="rounded-xl border border-[#E0D6C8] px-3 py-2 text-sm text-[#8A5A5A]">Eliminar</button></div> : <div className="text-sm leading-6 text-[#566469]">{item}</div>}</div>)}</div></Panel>)}</div>}
            {showProducts && <Panel title="Productos presentados" right={canEdit ? <button onClick={() => setAccount((prev) => ({ ...prev, productos: [...prev.productos, newProduct()] }))} className="rounded-xl bg-[#2EA6A4] px-4 py-2 text-sm font-semibold text-white">Agregar producto</button> : undefined}><div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">{account.productos.map((product, index) => <div key={`${product.nombre}-${index}`} className="overflow-hidden rounded-2xl border border-[#E7E0D6] bg-white"><button className="block w-full" onClick={() => setSelectedImage(product.imagen)}><img src={product.imagen} alt={product.nombre} className="h-40 w-full object-cover" /></button><div className="space-y-3 p-4">{canEdit ? <><div className="flex gap-3"><input value={product.nombre} onChange={(e) => updateProduct(index, "nombre", e.target.value)} className="w-full rounded-xl border border-[#D9D3CA] px-3 py-2 font-semibold outline-none focus:ring-2 focus:ring-[#2EA6A4]" /><button onClick={() => setAccount((prev) => ({ ...prev, productos: prev.productos.filter((_, i) => i !== index) }))} className="rounded-xl border border-[#E0D6C8] px-3 py-2 text-sm text-[#8A5A5A]">Eliminar</button></div><textarea value={product.descripcion} onChange={(e) => updateProduct(index, "descripcion", e.target.value)} rows={3} className="w-full rounded-xl border border-[#D9D3CA] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2EA6A4]" /><input value={product.imagen} onChange={(e) => updateProduct(index, "imagen", e.target.value)} className="w-full rounded-xl border border-[#D9D3CA] px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#2EA6A4]" /><input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && fileToDataUrl(e.target.files[0], (url) => updateProduct(index, "imagen", url))} className="block w-full text-sm" /></> : <><h4 className="text-lg font-semibold text-[#24343A]">{product.nombre}</h4><p className="text-sm leading-6 text-[#5B676D]">{product.descripcion}</p></>}</div></div>)}</div></Panel>}
            {showTracking && <Panel title="Puntos de seguimiento" right={canEdit ? <button onClick={() => setAccount((prev) => ({ ...prev, puntosSeguimiento: [...prev.puntosSeguimiento, newPoint()] }))} className="rounded-xl bg-[#2EA6A4] px-4 py-2 text-sm font-semibold text-white">Agregar punto</button> : undefined}><div className="grid grid-cols-1 gap-4 xl:grid-cols-2">{account.puntosSeguimiento.map((point, index) => <div key={`${point.titulo}-${index}`} className="space-y-3 rounded-2xl border border-[#E7E0D6] bg-white p-4">{canEdit ? <><div className="flex gap-3"><input value={point.titulo} onChange={(e) => updatePoint(index, "titulo", e.target.value)} className="w-full rounded-xl border border-[#D9D3CA] px-3 py-2 font-semibold outline-none focus:ring-2 focus:ring-[#2EA6A4]" /><button onClick={() => setAccount((prev) => ({ ...prev, puntosSeguimiento: prev.puntosSeguimiento.filter((_, i) => i !== index) }))} className="rounded-xl border border-[#E0D6C8] px-3 py-2 text-sm text-[#8A5A5A]">Eliminar</button></div><select value={point.estado} onChange={(e) => updatePoint(index, "estado", e.target.value as TrackingStatus)} className="w-full rounded-xl border border-[#D9D3CA] px-3 py-2 outline-none focus:ring-2 focus:ring-[#2EA6A4]"><option>En avance</option><option>En proceso</option><option>Pendiente</option></select><textarea value={point.nota} onChange={(e) => updatePoint(index, "nota", e.target.value)} rows={4} className="w-full rounded-xl border border-[#D9D3CA] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2EA6A4]" /><div className="grid grid-cols-1 gap-3 md:grid-cols-3"><input value={point.fechaLimite} onChange={(e) => updatePoint(index, "fechaLimite", e.target.value)} placeholder="Fecha límite" className="rounded-xl border border-[#D9D3CA] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2EA6A4]" /><input value={point.responsable} onChange={(e) => updatePoint(index, "responsable", e.target.value)} placeholder="Responsable" className="rounded-xl border border-[#D9D3CA] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2EA6A4]" /><select value={point.prioridad} onChange={(e) => updatePoint(index, "prioridad", e.target.value as Priority)} className="rounded-xl border border-[#D9D3CA] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2EA6A4]"><option>Alta</option><option>Media</option><option>Baja</option></select></div></> : <><div className="flex items-center justify-between gap-4"><h4 className="text-lg font-semibold text-[#24343A]">{point.titulo}</h4><StatusBadge status={point.estado} /></div><p className="text-sm leading-6 text-[#566469]">{point.nota}</p><div className="grid grid-cols-1 gap-3 md:grid-cols-3"><div className="rounded-xl bg-[#F7F5F0] px-3 py-3"><div className="text-[11px] font-semibold uppercase text-[#7A8387]">Fecha límite</div><div className="mt-1 text-sm font-medium">{point.fechaLimite}</div></div><div className="rounded-xl bg-[#F7F5F0] px-3 py-3"><div className="text-[11px] font-semibold uppercase text-[#7A8387]">Responsable</div><div className="mt-1 text-sm font-medium">{point.responsable}</div></div><div className={`rounded-xl border bg-white px-3 py-3 ${priorityClass(point.prioridad)}`}><div className="text-[11px] font-semibold uppercase">Prioridad</div><div className="mt-1 text-sm font-medium">{point.prioridad}</div></div></div></>}</div>)}</div></Panel>}
{!isClientLink && (
  <footer className="flex flex-col gap-2 rounded-2xl bg-[#2EA6A4] px-6 py-5 text-white md:flex-row md:items-center md:justify-between">
    <div>{clientMode ? "Modo cliente activo para revisión interna." : "Esta minuta es editable. Todo cambio actualiza métricas, tarjetas y gráfica."}</div>
    <div className="font-semibold">Print'n Run - Soluciones Creativas.</div>
  </footer>
)}          </main>
        </div>
      </div>
      {selectedImage && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6" onClick={() => setSelectedImage(null)}><div className="w-full max-w-5xl overflow-hidden rounded-3xl bg-white" onClick={(e) => e.stopPropagation()}><div className="flex items-center justify-between border-b border-[#E5E5E5] px-5 py-4"><div className="font-semibold text-[#24343A]">Vista de imagen</div><button onClick={() => setSelectedImage(null)} className="rounded-xl border border-[#D8D8D8] px-4 py-2 text-sm">Cerrar</button></div><img src={selectedImage} alt="Vista ampliada" className="max-h-[80vh] w-full bg-[#F7F5F0] object-contain" /></div></div>}
    </div>
  );
}
