"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CsvImportModal } from "@/components/admin/csv-import-modal";

export function CsvImportButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-300 gap-2 shadow-sm"
      >
        <Upload className="h-4 w-4" />
        Import CSV
      </Button>

      {open && <CsvImportModal onClose={() => setOpen(false)} />}
    </>
  );
}
