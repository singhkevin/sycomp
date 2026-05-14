"use client";

import { useState } from "react";
import { POStatus } from "@prisma/client";
import { updatePOStatus } from "@/lib/actions/po";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Loader2 } from "lucide-react";

export function POStatusActions({ poId, currentStatus }: { poId: string, currentStatus: POStatus }) {
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (status: POStatus) => {
    if (status === currentStatus) return;
    setLoading(true);
    const result = await updatePOStatus(poId, status);
    if (!result.success) {
      alert("Failed to update status");
    }
    setLoading(false);
  };

  const nextStatuses: { label: string, value: POStatus }[] = [
    { label: "Open", value: "OPEN" },
    { label: "In Process", value: "IN_PROCESS" },
    { label: "Closed", value: "CLOSED" },
    { label: "Cancelled", value: "CANCELLED" },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="text-slate-300 border-slate-700 bg-slate-800 hover:bg-slate-700 hover:text-white" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ChevronDown className="h-4 w-4 mr-2" />}
          Update Status
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800 text-slate-200">
        {nextStatuses.map((status) => (
          <DropdownMenuItem 
            key={status.value} 
            onClick={() => handleUpdate(status.value)}
            className={`cursor-pointer hover:bg-slate-800 focus:bg-slate-800 ${currentStatus === status.value ? 'bg-slate-800 text-blue-400' : ''}`}
          >
            {status.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
