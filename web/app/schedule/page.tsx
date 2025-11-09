"use client";

import { Suspense } from "react";
import Layout from "@/components/layout";
import { LoadingState } from "@/components/base/loading-state";
import { SchedulePageView } from "@/components/schedule/schedule-page-view";

export default function SchedulePage() {
  return (
    <Layout>
      <Suspense
        fallback={
          <LoadingState message="Carregando agenda..." className="mt-6" />
        }
      >
        <SchedulePageView />
      </Suspense>
    </Layout>
  );
}
