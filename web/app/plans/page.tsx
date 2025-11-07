"use client";

import { Suspense } from "react";
import Layout from "@/components/layout";
import { LoadingState } from "@/components/base/loading-state";
import { PlansPageView } from "@/components/plans/plans-page-view";

export default function PlansPage() {
  return (
    <Layout>
      <Suspense
        fallback={
          <LoadingState message="Carregando planos..." className="mt-6" />
        }
      >
        <PlansPageView />
      </Suspense>
    </Layout>
  );
}
