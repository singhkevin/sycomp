"use client";

import { useState, useRef } from "react";
import { Upload, FileText, CheckCircle, XCircle, AlertCircle, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const COUNTRIES = [
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "CN", name: "China", flag: "🇨🇳" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "PH", name: "Philippines", flag: "🇵🇭" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦" },
  { code: "TW", name: "Taiwan", flag: "🇹🇼" },
  { code: "AE", name: "UAE", flag: "🇦🇪" },
  { code: "US", name: "USA", flag: "🇺🇸" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
];

const REQUIRED_COLUMNS = ["Handle", "Title", "Variant Price"];
const OPTIONAL_COLUMNS = ["Body (HTML)", "Product Category", "Type", "Variant SKU", "Variant Inventory Qty", "Image Src"];

interface ImportResult {
  success: boolean;
  summary?: {
    created: number;
    updated: number;
    skipped: number;
    errors: string[];
  };
  error?: string;
}

export function CsvImportModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [country, setCountry] = useState("IN");
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const handleFileChange = (f: File | null) => {
    if (!f) return;
    if (!f.name.endsWith(".csv")) {
      alert("Please select a .csv file");
      return;
    }
    setFile(f);
    setResult(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    handleFileChange(dropped);
  };

  const handleImport = async () => {
    if (!file || !country) return;
    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("country", country);

    try {
      const res = await fetch("/api/admin/import-csv", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setResult(data);
      if (data.success) {
        router.refresh();
      }
    } catch {
      setResult({ success: false, error: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Upload className="h-5 w-5 text-blue-400" />
              Import Products via CSV
            </h2>
            <p className="text-sm text-slate-400 mt-1">Upload a Shopify-compatible CSV to bulk import products</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-6">
          
          {/* Step 1: Select Market */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
              Step 1 — Select Target Market
            </label>
            <div className="grid grid-cols-5 gap-2">
              {COUNTRIES.map(c => (
                <button
                  key={c.code}
                  onClick={() => setCountry(c.code)}
                  className={`p-2 rounded-lg border text-center transition-all ${
                    country === c.code
                      ? "bg-blue-600/20 border-blue-500 text-blue-300"
                      : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500"
                  }`}
                >
                  <div className="text-xl">{c.flag}</div>
                  <div className="text-[11px] mt-1 font-medium">{c.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Upload File */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
              Step 2 — Upload CSV File
            </label>
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all ${
                isDragging
                  ? "border-blue-500 bg-blue-500/10"
                  : file
                  ? "border-green-500/50 bg-green-500/5"
                  : "border-slate-700 hover:border-slate-500 bg-slate-800/50"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
              />
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText className="h-8 w-8 text-green-400" />
                  <div className="text-left">
                    <p className="text-white font-medium">{file.name}</p>
                    <p className="text-slate-400 text-sm">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
              ) : (
                <div>
                  <Upload className="h-10 w-10 text-slate-500 mx-auto mb-3" />
                  <p className="text-slate-300 font-medium">Drop your CSV here or click to browse</p>
                  <p className="text-slate-500 text-sm mt-1">Only .csv files supported</p>
                </div>
              )}
            </div>
          </div>

          {/* CSV Format Guide */}
          <div className="bg-slate-800/60 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Expected CSV Columns</p>
            <div className="flex flex-wrap gap-2">
              {REQUIRED_COLUMNS.map(col => (
                <span key={col} className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs rounded">
                  {col} <span className="text-blue-500">*required</span>
                </span>
              ))}
              {OPTIONAL_COLUMNS.map(col => (
                <span key={col} className="px-2 py-0.5 bg-slate-700 border border-slate-600 text-slate-400 text-xs rounded">
                  {col}
                </span>
              ))}
            </div>
          </div>

          {/* Result */}
          {result && (
            <div className={`rounded-xl p-4 border ${
              result.success 
                ? "bg-green-500/10 border-green-500/30" 
                : "bg-red-500/10 border-red-500/30"
            }`}>
              {result.success && result.summary ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-green-400 font-semibold">
                    <CheckCircle className="h-5 w-5" />
                    Import Completed Successfully
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-green-500/10 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-green-400">{result.summary.created}</div>
                      <div className="text-xs text-slate-400">New Products</div>
                    </div>
                    <div className="bg-blue-500/10 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-blue-400">{result.summary.updated}</div>
                      <div className="text-xs text-slate-400">Updated</div>
                    </div>
                    <div className="bg-yellow-500/10 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-yellow-400">{result.summary.skipped}</div>
                      <div className="text-xs text-slate-400">Skipped</div>
                    </div>
                  </div>
                  {result.summary.errors.length > 0 && (
                    <details className="mt-2">
                      <summary className="text-xs text-yellow-400 cursor-pointer flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {result.summary.errors.length} row(s) had issues
                      </summary>
                      <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                        {result.summary.errors.map((e, i) => (
                          <p key={i} className="text-xs text-red-400 bg-red-500/5 px-2 py-1 rounded">{e}</p>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-400">
                  <XCircle className="h-5 w-5" />
                  <p className="font-medium">{result.error || "Import failed"}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} className="text-slate-400 hover:text-white">
            {result?.success ? "Close" : "Cancel"}
          </Button>
          <Button
            onClick={handleImport}
            disabled={!file || !country || loading}
            className="bg-blue-600 hover:bg-blue-700 text-white min-w-[140px]"
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Importing...</>
            ) : (
              <><Upload className="h-4 w-4 mr-2" /> Import Products</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
