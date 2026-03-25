"use client";
import { useRef, useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebaseConfig";
import type { SitioData } from "@/types/lead";
import { Loader2, Plus, Trash2, FileImage, Upload, Images, AlertCircle } from "lucide-react";

interface Props { sitio: SitioData; sitioId: string; setSitio: React.Dispatch<React.SetStateAction<SitioData>>; }

export default function ContenidoTab({ sitio, sitioId, setSitio }: Props) {
  const [uH, setUH] = useState(false);
  const [uG, setUG] = useState(false);
  const [ns, setNs] = useState("");
  const [error, setError] = useState<string | null>(null);
  const hRef = useRef<HTMLInputElement>(null);
  const gRef = useRef<HTMLInputElement>(null);
  const ic = "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-indexa-gray-dark placeholder:text-gray-400 outline-none focus:border-indexa-blue focus:ring-2 focus:ring-indexa-blue/20";

  const heroUp = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!storage || !db) {
      setError("Error de configuración: Firebase Storage no está disponible. Contacta soporte.");
      return;
    }
    if (!sitioId) {
      setError("No se encontró el ID del sitio.");
      return;
    }
    setError(null);
    setUH(true);
    try {
      const path = `sitios/${sitioId}/hero-${Date.now()}`;
      const r = ref(storage, path);
      await uploadBytes(r, f);
      const u = await getDownloadURL(r);
      await updateDoc(doc(db, "sitios", sitioId), { heroImageUrl: u });
      setSitio(p => ({ ...p, heroImageUrl: u }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Error al subir imagen de portada: ${msg}`);
    } finally {
      setUH(false);
      if (hRef.current) hRef.current.value = "";
    }
  };

  const heroRm = async () => {
    if (!db || !sitioId) return;
    setError(null);
    try {
      await updateDoc(doc(db, "sitios", sitioId), { heroImageUrl: "" });
      setSitio(p => ({ ...p, heroImageUrl: "" }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Error al eliminar imagen: ${msg}`);
    }
  };

  const galUp = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fs = e.target.files;
    if (!fs || !fs.length) return;
    if (!storage || !db) {
      setError("Error de configuración: Firebase Storage no está disponible. Contacta soporte.");
      return;
    }
    if (!sitioId) {
      setError("No se encontró el ID del sitio.");
      return;
    }
    setError(null);
    setUG(true);
    try {
      const urls: string[] = [];
      for (let i = 0; i < fs.length; i++) {
        const path = `sitios/${sitioId}/gal-${Date.now()}-${i}`;
        const r = ref(storage, path);
        await uploadBytes(r, fs[i]);
        urls.push(await getDownloadURL(r));
      }
      const up = [...sitio.galeria, ...urls];
      await updateDoc(doc(db, "sitios", sitioId), { galeria: up });
      setSitio(p => ({ ...p, galeria: up }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Error al subir imágenes: ${msg}`);
    } finally {
      setUG(false);
      if (gRef.current) gRef.current.value = "";
    }
  };

  const galRm = async (i: number) => {
    if (!db || !sitioId) return;
    setError(null);
    try {
      const up = sitio.galeria.filter((_, x) => x !== i);
      await updateDoc(doc(db, "sitios", sitioId), { galeria: up });
      setSitio(p => ({ ...p, galeria: up }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Error al eliminar imagen: ${msg}`);
    }
  };

  const svcAdd = async () => {
    const n = ns.trim(); if (!n || !db || !sitioId) return;
    setError(null);
    try {
      const up = [...sitio.servicios, n];
      await updateDoc(doc(db, "sitios", sitioId), { servicios: up });
      setSitio(p => ({ ...p, servicios: up }));
      setNs("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Error al agregar servicio: ${msg}`);
    }
  };

  const svcRm = async (i: number) => {
    if (!db || !sitioId) return;
    setError(null);
    try {
      const up = sitio.servicios.filter((_, x) => x !== i);
      await updateDoc(doc(db, "sitios", sitioId), { servicios: up });
      setSitio(p => ({ ...p, servicios: up }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Error al eliminar servicio: ${msg}`);
    }
  };

  return (
    <div className="space-y-8">
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <div>
            <p>{error}</p>
            <button onClick={() => setError(null)} className="mt-1 text-xs font-semibold text-red-500 hover:text-red-700">Cerrar</button>
          </div>
        </div>
      )}
      <div>
        <label className="block text-sm font-semibold text-indexa-gray-dark">
          <FileImage size={14} className="mr-1.5 inline-block" /> Imagen de portada (Header)
        </label>
        <p className="mt-1 text-xs text-gray-400">Se muestra como fondo en la sección principal. Recomendado: 1200×600 px.</p>
        <div className="mt-3">
          {sitio.heroImageUrl ? (
            <div className="relative group">
              <img src={sitio.heroImageUrl} alt="Hero" className="h-40 w-full rounded-xl object-cover border border-gray-200" />
              <button onClick={heroRm} className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-lg bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity" title="Eliminar"><Trash2 size={14} /></button>
            </div>
          ) : (
            <button onClick={() => hRef.current?.click()} disabled={uH} className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 py-10 text-sm text-gray-400 hover:border-indexa-blue hover:text-indexa-blue transition-colors">
              {uH ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
              {uH ? "Subiendo..." : "Subir imagen de portada"}
            </button>
          )}
          <input ref={hRef} type="file" accept="image/*" className="hidden" onChange={heroUp} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-indexa-gray-dark">
          <Plus size={14} className="mr-1.5 inline-block" /> Servicios
        </label>
        <p className="mt-1 text-xs text-gray-400">Agrega los servicios que ofreces. Aparecerán como tarjetas en tu sitio.</p>
        <div className="mt-3 space-y-2">
          {sitio.servicios.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm">{s}</span>
              <button onClick={() => svcRm(i)} className="flex h-9 w-9 items-center justify-center rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <input value={ns} onChange={e => setNs(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); svcAdd(); } }} placeholder="Ej. Diseño de interiores" className={ic} />
            <button onClick={svcAdd} disabled={!ns.trim()} className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-indexa-blue text-white disabled:opacity-40 hover:bg-indexa-blue/90 transition-colors"><Plus size={18} /></button>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-indexa-gray-dark">
          <Images size={14} className="mr-1.5 inline-block" /> Galería de trabajos
        </label>
        <p className="mt-1 text-xs text-gray-400">Sube fotos de tus trabajos realizados. Se mostrarán en una sección de galería.</p>
        <div className="mt-3">
          {sitio.galeria.length > 0 && (
            <div className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {sitio.galeria.map((url, i) => (
                <div key={i} className="relative group aspect-square">
                  <img src={url} alt={`Trabajo ${i + 1}`} className="h-full w-full rounded-lg object-cover border border-gray-200" />
                  <button onClick={() => galRm(i)} className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-md bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12} /></button>
                </div>
              ))}
            </div>
          )}
          <button onClick={() => gRef.current?.click()} disabled={uG} className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 py-6 text-sm text-gray-400 hover:border-indexa-blue hover:text-indexa-blue transition-colors">
            {uG ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
            {uG ? "Subiendo..." : "Subir imágenes"}
          </button>
          <input ref={gRef} type="file" accept="image/*" multiple className="hidden" onChange={galUp} />
        </div>
      </div>
    </div>
  );
}
