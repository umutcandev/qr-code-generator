"use client";

import { useState, useEffect, useRef } from "react";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { QrCode, Loader2, Download, FileImage, FileCode, Palette, Github } from "lucide-react";
import { HexColorPicker } from "react-colorful";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type QRFormat = "svg" | "png";

export default function Home() {
  const [url, setUrl] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [qrSize, setQrSize] = useState(256);
  const [refCount, setRefCount] = useState(1);
  const [format, setFormat] = useState<QRFormat>("png");
  const [qrColor, setQrColor] = useState<string | null>(null);
  const qrCodeRef = useRef<HTMLDivElement>(null);

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
      const timestamp = Date.now();
      const domain = "speedy-qr-code.vercel.app";
      const uniqueRef = `${domain}_${timestamp}_${refCount}`;
      urlObj.searchParams.set("qr_ref", uniqueRef);
      setRefCount(prev => prev + 1);
      return urlObj.toString();
    } catch {
      const timestamp = Date.now();
      const domain = "speedy-qr-code.vercel.app";
      const uniqueRef = `${domain}_${timestamp}_${refCount}`;
      return `${baseUrl}?qr_ref=${uniqueRef}`;
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
    const refId = new URL(qrCode).searchParams.get("qr_ref") || "qr";
    
    if (format === "svg") {
      const svg = qrCodeRef.current?.querySelector("svg");
      if (svg) {
        const svgData = new XMLSerializer().serializeToString(svg);
        const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
        const svgUrl = URL.createObjectURL(svgBlob);
        
        const downloadLink = document.createElement("a");
        downloadLink.href = svgUrl;
        downloadLink.download = `${refId}.svg`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        URL.revokeObjectURL(svgUrl);
      }
    } else {
      const canvas = qrCodeRef.current?.querySelector("canvas");
      if (canvas) {
        const pngUrl = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = `${refId}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-zinc-950">
      <Card className="w-full max-w-md border-zinc-800 bg-zinc-900">
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="text-lg sm:text-2xl text-center text-zinc-100">QR Kod Oluşturucu</CardTitle>
          <CardDescription className="text-center text-zinc-400 text-xs sm:text-sm mt-1.5 sm:mt-2">
            Herhangi bir URL&apos;i QR koda dönüştürün. Her oluşturduğunuz QR kod benzersiz bir referans ID&apos;si içerir, 
            böylece tarama istatistiklerini takip edebilirsiniz. SVG veya PNG formatında indirebilirsiniz.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              type="text"
              placeholder="URL girin..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-400"
            />
            <div className="flex gap-2">
              <Select
                value={format}
                onValueChange={(value: QRFormat) => setFormat(value)}
              >
                <SelectTrigger className="w-[90px] h-9 bg-zinc-800 border-zinc-700 text-zinc-100 focus-visible:ring-offset-zinc-950">
                  <SelectValue>
                    <div className="flex items-center">
                      {format === "svg" ? (
                        <FileCode className="w-4 h-4 mr-2" />
                      ) : (
                        <FileImage className="w-4 h-4 mr-2" />
                      )}
                      {format.toUpperCase()}
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100">
                  <SelectItem value="png" className="text-zinc-100 focus:bg-zinc-700">
                    <div className="flex items-center">
                      <FileImage className="w-4 h-4 mr-2" />
                      PNG
                    </div>
                  </SelectItem>
                  <SelectItem value="svg" className="text-zinc-100 focus:bg-zinc-700">
                    <div className="flex items-center">
                      <FileCode className="w-4 h-4 mr-2" />
                      SVG
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-9 h-9 p-0 bg-zinc-800 border-zinc-700 hover:bg-zinc-700"
                    style={{
                      backgroundColor: qrColor || undefined
                    }}
                  >
                    <Palette className="h-4 w-4 text-zinc-100" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto border-zinc-800 bg-zinc-900 p-3">
                  <HexColorPicker color={qrColor || "#000000"} onChange={setQrColor} />
                  <div className="mt-3 flex gap-2">
                    <Input
                      type="text"
                      value={qrColor || "#000000"}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.match(/^#[0-9A-Fa-f]{0,6}$/)) {
                          setQrColor(value.length === 7 ? value : value);
                        }
                      }}
                      className="h-8 font-mono bg-zinc-800 border-zinc-700 text-zinc-100"
                      placeholder="#000000"
                      maxLength={7}
                    />
                    {qrColor && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-zinc-400 hover:text-zinc-100"
                        onClick={() => setQrColor(null)}
                      >
                        Sıfırla
                      </Button>
                    )}
                  </div>
                </PopoverContent>
              </Popover>

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
          </div>

          {qrCode && (
            <div className="flex flex-col items-center gap-3 sm:gap-4 p-2 sm:p-4 border border-zinc-800 rounded-lg bg-zinc-900">
              <div ref={qrCodeRef} className="p-2 sm:p-4 bg-white rounded-lg">
                {format === "svg" ? (
                  <QRCodeSVG 
                    value={qrCode} 
                    size={qrSize}
                    level="H"
                    includeMargin={true}
                    fgColor={qrColor || "#000000"}
                  />
                ) : (
                  <QRCodeCanvas 
                    value={qrCode} 
                    size={qrSize}
                    level="H"
                    includeMargin={true}
                    fgColor={qrColor || "#000000"}
                  />
                )}
              </div>
              <Button 
                onClick={downloadQRCode} 
                variant="secondary"
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-100 w-full sm:w-auto"
              >
                <Download className="mr-2 h-4 w-4" />
                <span className="text-sm">QR Kodu İndir ({format.toUpperCase()})</span>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      <a
        href="https://github.com/umutcandev/qr-code-generator"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-md shadow-lg transition-all hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
      >
        <Github className="w-4 h-4" />
        <span className="text-sm font-medium">qr-code-generator</span>
      </a>
    </main>
  );
}
