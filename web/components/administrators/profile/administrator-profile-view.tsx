"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/base/loading-state";
import { EmptyState } from "@/components/base/empty-state";
import { AdministratorProfileSummaryCard } from "@/components/administrators/profile/profile-summary-card";
import { findAdministratorByIdOptions } from "@/lib/api-client/@tanstack/react-query.gen";
import { apiClient } from "@/lib/client";
import type { AdministratorResponseDto } from "@/lib/api-client/types.gen";

interface AdministratorProfileViewProps {
  administratorId: string;
}

export function AdministratorProfileView({
  administratorId,
}: AdministratorProfileViewProps) {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    const role = localStorage.getItem("userRole") || "professor";
    setUserRole(role);

    if (role !== "admin") {
      router.push("/schedule");
    }
  }, [router]);

  const administratorQuery = useQuery({
    ...findAdministratorByIdOptions({
      client: apiClient,
      path: { id: administratorId },
    }),
    enabled: Boolean(administratorId) && userRole === "admin",
  });

  if (userRole !== "admin") {
    return null;
  }

  if (administratorQuery.isLoading) {
    return <LoadingState message="Carregando dados do administrador..." />;
  }

  if (administratorQuery.error || !administratorQuery.data) {
    return (
      <EmptyState
        title="Administrador não encontrado"
        description={
          administratorQuery.error instanceof Error
            ? administratorQuery.error.message
            : "Verifique o identificador informado."
        }
        action={
          <Button
            variant="outline"
            onClick={() => router.push("/administrators")}
          >
            Voltar para lista
          </Button>
        }
      />
    );
  }

  const administrator = administratorQuery.data as AdministratorResponseDto;

  return (
    <div className="space-y-4">
      <AdministratorProfileSummaryCard
        heading="Perfil do Administrador"
        description="Informações detalhadas do administrador"
        onBack={() => router.back()}
        administrator={administrator}
      />
    </div>
  );
}
