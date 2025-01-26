"use client";

import { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { QrCode, Loader2, Download } from "lucide-react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [qrSize, setQrSize] = useState(256);
  const [refCount, setRefCount] = useState(1);

  useEffect(() => {
    const updateQRSize = () => {
      const width = window.innerWidth;
      if (width < 380) {
        setQrSize(200);
      } else if (width < 768) {
        setQrSize(220);
      } else {
        setQrSize(256);
      }
    };

    updateQRSize();
    window.addEventListener("resize", updateQRSize);
    return () => window.removeEventListener("resize", updateQRSize);
  }, []);

  const generateUniqueUrl = (baseUrl: string) => {
    try {
      const urlObj = new URL(baseUrl);
      urlObj.searchParams.set("qr_ref", `qr_${refCount}`);
      setRefCount(prev => prev + 1);
      return urlObj.toString();
    } catch {
      return `${baseUrl}?qr_ref=qr_${refCount}`;
    }
  };

  const generateQRCode = () => {
    if (!url) return;
    
    setIsGenerating(true);
    setTimeout(() => {
      const uniqueUrl = generateUniqueUrl(url);
      setQrCode(uniqueUrl);
      setIsGenerating(false);
    }, 1000);
  };

  const downloadQRCode = () => {
    const canvas = document.querySelector("canvas");
    if (canvas) {
      const pngUrl = canvas
        .toDataURL("image/png")
        .replace("image/png", "image/octet-stream");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      const refId = new URL(qrCode).searchParams.get("qr_ref") || "qr";
      downloadLink.download = `${refId}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-zinc-950">
      <Card className="w-full max-w-md border-zinc-800 bg-zinc-900">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-xl sm:text-2xl text-center text-zinc-100">QR Kod Oluşturucu</CardTitle>
          <CardDescription className="text-center text-zinc-400 text-sm mt-2">
            Herhangi bir URL&apos;i QR koda dönüştürün. Her oluşturduğunuz QR kod benzersiz bir referans ID&apos;si içerir, 
            böylece tarama istatistiklerini takip edebilirsiniz. Oluşturulan QR kodları PNG formatında indirebilirsiniz.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              type="text"
              placeholder="URL girin..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-400"
            />
            <Button 
              onClick={generateQRCode}
              className="bg-zinc-700 hover:bg-zinc-600 text-zinc-100 whitespace-nowrap"
              disabled={isGenerating || !url}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span className="text-sm">Oluşturuluyor</span>
                </>
              ) : (
                <>
                  <QrCode className="mr-2 h-4 w-4" />
                  <span className="text-sm">Oluştur</span>
                </>
              )}
            </Button>
          </div>

          {qrCode && (
            <div className="flex flex-col items-center gap-4 p-3 sm:p-4 border border-zinc-800 rounded-lg bg-zinc-900">
              <div className="p-3 sm:p-4 bg-white rounded-lg">
                <QRCodeCanvas value={qrCode} size={qrSize} />
              </div>
              <Button 
                onClick={downloadQRCode} 
                variant="secondary"
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-100 w-full sm:w-auto"
              >
                <Download className="mr-2 h-4 w-4" />
                <span className="text-sm">QR Kodu İndir</span>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
