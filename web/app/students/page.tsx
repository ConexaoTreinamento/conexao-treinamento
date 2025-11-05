"use client";

import { Suspense } from "react";
import Layout from "@/components/layout";
import { LoadingState } from "@/components/base/loading-state";
import { StudentsPageView } from "@/components/students/students-page-view";

export default function StudentsPage() {
  return (
    <Layout>
      <Suspense
        fallback={
          <LoadingState message="Carregando alunos..." className="mt-6" />
        }
      >
        <StudentsPageView />
      </Suspense>
    </Layout>
  );
}
