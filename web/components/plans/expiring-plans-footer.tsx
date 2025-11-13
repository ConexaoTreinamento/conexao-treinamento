"use client";

import Link from "next/link";
import {Button} from "@/components/ui/button";

interface ExpiringPlansFooterProps {
  onClose: () => void;
}

export function ExpiringPlansFooter({ onClose }: ExpiringPlansFooterProps) {
  return (
      <div className="flex justify-end gap-2 pt-4 border-t flex-shrink-0">
        <Button variant="outline" onClick={onClose}>
          Fechar
        </Button>
        <Button asChild>
          <Link href="/students" onClick={onClose}>
            Ver todos os alunos
          </Link>
        </Button>
      </div>
  );
}
