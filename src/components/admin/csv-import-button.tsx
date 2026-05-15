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
        className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-blue-500 gap-2"
      >
        <Upload className="h-4 w-4" />
        Import CSV
      </Button>

      {open && <CsvImportModal onClose={() => setOpen(false)} />}
    </>
  );
}
