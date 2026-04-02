"use client";

import Header from "@/components/Header";
import CategorySelect from "@/components/CategorySelect";
import { createBook, getUploadUrls } from "@/actions/book";
import { useState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import Image from "next/image";
import { generatePDFCover } from "@/lib/pdfHelpers";

function SubmitButton({ isGenerating }: { isGenerating: boolean }) {
  const { pending } = useFormStatus();
  const isDisabled = pending || isGenerating;
  
  return (
    <button 
      type="submit" 
      disabled={isDisabled}
      className="w-full bg-[#D1B898] hover:bg-[#c2a47e] text-black px-8 py-3.5 font-bold rounded-sm shadow-[0_0_30px_rgba(209,184,152,0.15)] hover:shadow-[0_0_40px_rgba(209,184,152,0.3)] transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? "Fazendo upload..." : isGenerating ? "Gerando capa automaticamente..." : "Fazer Upload do Livro"}
    </button>
  );
}

interface UploadPageClientProps {
  categories: { id: string; name: string }[];
}

export default function UploadPageClient({ categories }: UploadPageClientProps) {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coverBlob, setCoverBlob] = useState<Blob | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [isGeneratingCover, setIsGeneratingCover] = useState(false);

  useEffect(() => {
    return () => {
      if (coverPreviewUrl) URL.revokeObjectURL(coverPreviewUrl);
    };
  }, [coverPreviewUrl]);

  const handlePdfSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setCoverBlob(null);
      setCoverPreviewUrl(null);
      return;
    }

    setIsGeneratingCover(true);
    setError(null);
    const result = await generatePDFCover(file);
    
    if (result) {
      setCoverBlob(result.blob);
      setPageCount(result.pageCount);
      setCoverPreviewUrl(URL.createObjectURL(result.blob));
    } else {
      setCoverBlob(null);
      setCoverPreviewUrl(null);
      setError("Não foi possível gerar a capa automaticamente. O PDF pode estar protegido.");
    }
    
    setIsGeneratingCover(false);
  };

  async function action(formData: FormData) {
    try {
      if (!coverBlob) {
        throw new Error("Aguarde a geração automática da capa (ou envie um PDF válido).");
      }
      setError(null);
      
      const pdfFile = formData.get("pdf") as File;
      
      // 1. Pede ao servidor as Senhas do Cloudflare R2
      const urlRequest = [
        { name: "cover.jpg", type: "image/jpeg" },
        { name: pdfFile.name, type: pdfFile.type }
      ];
      
      const { urls } = await getUploadUrls(urlRequest);
      const coverUploadInfo = urls[0];
      const pdfUploadInfo = urls[1];

      // 2. O próprio navegador faz o upload super pesado direto pro Cloudflare (Ignora a Vercel!)
      const uploadPromises = [
        fetch(coverUploadInfo.url, { 
          method: "PUT", 
          body: coverBlob, 
          headers: { "Content-Type": "image/jpeg" } 
        }),
        fetch(pdfUploadInfo.url, { 
          method: "PUT", 
          body: pdfFile, 
          headers: { "Content-Type": pdfFile.type } 
        })
      ];

      const responses = await Promise.all(uploadPromises);
      if (!responses[0].ok || !responses[1].ok) {
        throw new Error("Falha ao subir arquivos para a nuvem. Tente novamente.");
      }

      // 3. Limpa as partes gigantes da requisição antes de mandar pro Next.js
      formData.delete("pdf");
      formData.append("coverKey", coverUploadInfo.key);
      formData.append("pdfKey", pdfUploadInfo.key);
      if (pageCount) formData.append("pages", pageCount.toString());

      // 4. Salva apenas as Keys (Strings levinhas) no Banco de Dados
      await createBook(formData);
      
      setSuccess(true);
      setCoverBlob(null);
      setCoverPreviewUrl(null);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto px-6 py-16 flex justify-center">
        <div className="w-full max-w-xl bg-surface-base p-8 rounded-sm border border-border-dim shadow-2xl">
          <h1 className="text-3xl font-extrabold text-white mb-6 tracking-tight">Novo Upload</h1>
          
          {success ? (
            <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-sm text-center">
              <p className="font-semibold mb-4">Livro enviado com sucesso!</p>
              <button onClick={() => setSuccess(false)} className="text-sm underline hover:text-green-300">
                Fazer upload de outro livro
              </button>
            </div>
          ) : (
            <form action={action} className="space-y-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-sm text-sm">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-dimmed">Título</label>
                <input 
                  type="text" 
                  name="title" 
                  required 
                  className="w-full bg-background border border-border-dim rounded-sm px-4 py-2.5 text-white focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 transition-all"
                  placeholder="ex: O Alquimista"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-dimmed">Autor</label>
                <input 
                  type="text" 
                  name="author" 
                  required 
                  className="w-full bg-background border border-border-dim rounded-sm px-4 py-2.5 text-white focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 transition-all"
                  placeholder="ex: Paulo Coelho"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-dimmed">Resumo</label>
                <textarea 
                  name="summary" 
                  required
                  rows={4}
                  className="w-full bg-background border border-border-dim rounded-sm px-4 py-2.5 text-white focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 transition-all resize-none"
                  placeholder="Sinopse ou breve resumo do livro..."
                />
              </div>

              {/* Category Select */}
              <CategorySelect categories={categories} />

              <div className="space-y-4 pt-4 border-t border-border-dim/50">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-text-dimmed">Arquivo PDF (Max 10MB)</label>
                  <p className="text-xs text-text-dimmed/70 mb-2">A capa será gerada automaticamente com a primeira página.</p>
                  <input 
                    type="file" 
                    name="pdf" 
                    accept="application/pdf"
                    required 
                    onChange={handlePdfSelected}
                    className="w-full text-sm text-text-dimmed file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-sm file:font-semibold file:bg-surface-elevated file:text-white hover:file:bg-surface-elevated/80 transition-all cursor-pointer"
                  />
                </div>

                {isGeneratingCover && (
                  <div className="flex items-center gap-3 text-sm text-primary-500 animate-pulse mt-4">
                    <div className="w-4 h-4 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
                    Gerando miniatura da capa...
                  </div>
                )}

                {coverPreviewUrl && !isGeneratingCover && (
                  <div className="mt-4 p-4 border border-border-dim rounded-sm bg-background/50 inline-block">
                    <p className="text-xs text-text-dimmed mb-3 uppercase tracking-wider font-semibold">Capa Gerada (Preview)</p>
                    <div className="relative w-24 aspect-[3/4] rounded-sm overflow-hidden shadow-lg border border-border-dim">
                      <Image 
                        src={coverPreviewUrl} 
                        alt="Capa do PDF"
                        fill 
                        className="object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-6">
                <SubmitButton isGenerating={isGeneratingCover} />
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
