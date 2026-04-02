export async function generatePDFCover(file: File): Promise<{ blob: Blob; pageCount: number } | null> {
  try {

    const pdfjs = await import("pdfjs-dist");
    pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

    
    const arrayBuffer = await file.arrayBuffer();
    
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    const pageCount = pdf.numPages;
    const page = await pdf.getPage(1);
    
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) return null;

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
      canvas: canvas 
    };

    await page.render(renderContext as any).promise;

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve({ blob, pageCount });
        } else {
          reject(new Error("Falha ao gerar a imagem no canvas."));
        }
      }, "image/jpeg", 0.8);
    });

  } catch (error) {
    console.error("Erro interno ao gerar capa do PDF:", error);
    return null;
  }
}