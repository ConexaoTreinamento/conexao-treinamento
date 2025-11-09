"use client";

import { Suspense } from "react";
import Layout from "@/components/layout";
import { LoadingState } from "@/components/base/loading-state";
import { ReportsPageView } from "@/components/reports/reports-page-view";

export default function ReportsPage() {
  return (
    <Layout>
      <Suspense
        fallback={
          <LoadingState message="Carregando relatórios..." className="mt-6" />
        }
      >
        <ReportsPageView />
      </Suspense>
    </Layout>
  );
}
