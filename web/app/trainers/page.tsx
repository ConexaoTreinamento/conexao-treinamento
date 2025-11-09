"use client";

import { Suspense } from "react";
import Layout from "@/components/layout";
import { LoadingState } from "@/components/base/loading-state";
import { TrainersPageView } from "@/components/trainers/trainers-page-view";

export default function TrainersPage() {
  return (
    <Layout>
      <Suspense
        fallback={
          <LoadingState message="Carregando professores..." className="mt-6" />
        }
      >
        <TrainersPageView />
      </Suspense>
    </Layout>
  );
}
