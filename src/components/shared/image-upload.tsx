"use client";

import axios from "axios";
import { ImagePlus, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { notifyError } from "@/lib/toast";

/** Uploads through /api/upload (Storage interface: Vercel Blob in production). */
export function ImageUpload({ value, onChange, kind, name }: { value?: string | null; onChange: (url: string | null) => void; kind: "avatar" | "product"; name: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function onFile(file: File) {
    setBusy(true);
    try {
      const form = new FormData();
      form.set("file", file);
      form.set("kind", kind);
      const { data } = await axios.post<{ url: string }>("/api/upload", form);
      onChange(data.url);
    } catch (e) {
      const code = axios.isAxiosError(e) ? (e.response?.data as { error?: string } | undefined)?.error : undefined;
      notifyError(code === "too_large" ? "Görsel en fazla 2 MB olabilir." : code === "unsupported_type" ? "Yalnızca PNG, JPG veya WebP yükleyin." : code === "uploads_disabled" ? "Yükleme bu ortamda yapılandırılmamış." : undefined);
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = "";
    }
  }

  return (
    <div className="flex items-center gap-4">
      <Avatar name={name || "?"} src={value} rounded="lg" className="size-16" />
      <div className="flex flex-wrap gap-2">
        <input ref={ref} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" id={`upload-${kind}`} onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
        <Button variant="outline" size="sm" disabled={busy} onClick={() => ref.current?.click()}>{busy ? <Loader2 className="animate-spin" /> : <ImagePlus />} Görsel yükle</Button>
        {value ? <Button variant="ghost" size="sm" onClick={() => onChange(null)}>Kaldır</Button> : null}
      </div>
    </div>
  );
}
