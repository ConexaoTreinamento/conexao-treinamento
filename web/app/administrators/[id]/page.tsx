"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Layout from "@/components/layout";
import { LoadingState } from "@/components/base/loading-state";
import { EmptyState } from "@/components/base/empty-state";
import { Button } from "@/components/ui/button";
import { AdministratorProfileView } from "@/components/administrators/profile/administrator-profile-view";

export default function AdministratorProfilePage() {
  const params = useParams<{ id: string }>();
  const administratorId = params?.id ?? "";

  if (!administratorId) {
    return (
      <Layout>
        <EmptyState
          title="Administrador inválido"
          description="Não foi possível identificar o administrador solicitado."
          action={
            <Button asChild variant="outline">
              <Link href="/administrators">Voltar para lista</Link>
            </Button>
          }
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <Suspense
        fallback={
          <LoadingState
            message="Carregando dados do administrador..."
            className="mt-6"
          />
        }
      >
        <AdministratorProfileView administratorId={administratorId} />
      </Suspense>
    </Layout>
  );
}
