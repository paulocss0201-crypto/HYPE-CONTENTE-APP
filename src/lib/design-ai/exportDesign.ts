import JSZip from "jszip";

export function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export async function exportSlidesAsZip(images: string[], baseName: string) {
  const zip = new JSZip();
  images.forEach((dataUrl, i) => {
    const base64 = dataUrl.split(",")[1] ?? "";
    zip.file(`${baseName}-slide-${i + 1}.png`, base64, { base64: true });
  });
  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  downloadDataUrl(url, `${baseName}.zip`);
  URL.revokeObjectURL(url);
}

export function exportSlidesAsPdf(images: string[], title: string) {
  const win = window.open("", "_blank");
  if (!win) return;
  const pages = images
    .map(
      (src) =>
        `<div class="page"><img src="${src}" /></div>`
    )
    .join("");
  win.document.write(`<!doctype html><html><head><title>${escapeHtml(title)}</title>
    <style>
      * { box-sizing: border-box; }
      body { margin: 0; background: #fff; }
      .page { width: 100vw; height: 100vh; display: flex; align-items: center; justify-content: center; page-break-after: always; }
      .page img { max-width: 100%; max-height: 100%; object-fit: contain; }
      @media print { .page { page-break-after: always; } }
    </style>
  </head><body>${pages}</body></html>`);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 400);
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
