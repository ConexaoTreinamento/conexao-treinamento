"use client";

import { Suspense } from "react";
import Layout from "@/components/layout";
import { LoadingState } from "@/components/base/loading-state";
import { ExercisesPageView } from "@/components/exercises/exercises-page-view";

export default function ExercisesPage() {
  return (
    <Layout>
      <Suspense
        fallback={
          <LoadingState message="Carregando exercícios..." className="mt-6" />
        }
      >
        <ExercisesPageView />
      </Suspense>
    </Layout>
  );
}
