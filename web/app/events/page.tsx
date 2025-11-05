"use client";

import { Suspense } from "react";
import Layout from "@/components/layout";
import { LoadingState } from "@/components/base/loading-state";
import { EventsPageView } from "@/components/events/events-page-view";

export default function EventsPage() {
  return (
    <Layout>
      <Suspense
        fallback={
          <LoadingState message="Carregando eventos..." className="mt-6" />
        }
      >
        <EventsPageView />
      </Suspense>
    </Layout>
  );
}
