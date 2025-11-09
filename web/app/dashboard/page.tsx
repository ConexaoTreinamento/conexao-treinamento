"use client";

import { Suspense } from "react";
import Layout from "@/components/layout";
import { LoadingState } from "@/components/base/loading-state";
import { DashboardPageView } from "@/components/dashboard/dashboard-page-view";

export default function Dashboard() {
  return (
    <Layout>
      <Suspense
        fallback={
          <LoadingState message="Carregando dashboard..." className="mt-6" />
        }
      >
        <DashboardPageView />
      </Suspense>
    </Layout>
  );
}
