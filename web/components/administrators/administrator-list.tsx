"use client";

import { useMemo } from "react";
import { AdministratorCard } from "@/components/administrators/administrator-card";
import { EmptyState } from "@/components/base/empty-state";
import { EntityList } from "@/components/base/entity-list";
import { Section } from "@/components/base/section";
import { Skeleton } from "@/components/ui/skeleton";
import type { ListAdministratorsDto } from "@/lib/api-client";

interface AdministratorListProps {
  administrators: ListAdministratorsDto[];
  searchTerm: string;
  isLoading: boolean;
  error: unknown;
  onAdministratorOpen: (administrator: ListAdministratorsDto) => void;
}

const resolveAdministratorName = (
  administrator: ListAdministratorsDto,
): string => {
  const fallback =
    `${administrator.firstName ?? ""} ${administrator.lastName ?? ""}`.trim();
  return (
    administrator.fullName?.trim() ||
    fallback ||
    administrator.email ||
    "Administrador"
  );
};

const matchesSearch = (
  administrator: ListAdministratorsDto,
  searchTerm: string,
): boolean => {
  if (!searchTerm) {
    return true;
  }

  const normalizedSearch = searchTerm.toLowerCase();
  const name = resolveAdministratorName(administrator).toLowerCase();
  const email = (administrator.email ?? "").toLowerCase();

  return name.includes(normalizedSearch) || email.includes(normalizedSearch);
};

export function AdministratorList(props: AdministratorListProps) {
  const { administrators, searchTerm, isLoading, error, onAdministratorOpen } =
    props;

  const filteredAdministrators = useMemo(
    () =>
      administrators.filter((administrator) =>
        matchesSearch(administrator, searchTerm),
      ),
    [administrators, searchTerm],
  );

  const totalAdministrators = administrators.length;
  const hasError = Boolean(error);

  const resultsSummary = useMemo(() => {
    if (isLoading) {
      return "Carregando administradores...";
    }

    if (hasError) {
      return "Não foi possível carregar os administradores.";
    }

    if (!totalAdministrators) {
      return "Nenhum administrador cadastrado ainda.";
    }

    if (!filteredAdministrators.length) {
      return "Ajuste a busca para encontrar administradores.";
    }

    if (filteredAdministrators.length === totalAdministrators && !searchTerm) {
      return `${filteredAdministrators.length} administradores cadastrados`;
    }

    return `${filteredAdministrators.length} de ${totalAdministrators} administradores exibidos`;
  }, [
    filteredAdministrators.length,
    hasError,
    isLoading,
    searchTerm,
    totalAdministrators,
  ]);

  return (
    <Section title="Resultados" description={resultsSummary}>
      {isLoading ? (
        <EntityList>
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-24 w-full" />
          ))}
        </EntityList>
      ) : null}

      {!isLoading && hasError ? (
        <EmptyState
          title="Erro ao carregar administradores"
          description="Não foi possível carregar os administradores. Tente novamente mais tarde."
        />
      ) : null}

      {!isLoading && !hasError && !filteredAdministrators.length ? (
        <EmptyState
          title="Nenhum administrador encontrado"
          description="Ajuste os filtros ou utilize outro termo de busca."
        />
      ) : null}

      {!isLoading && !hasError && filteredAdministrators.length ? (
        <EntityList>
          {filteredAdministrators.map((administrator, index) => {
            const key =
              administrator.id ||
              administrator.email ||
              administrator.fullName ||
              `administrator-${index}`;

            return (
              <AdministratorCard
                key={key}
                administrator={administrator}
                onOpen={() => onAdministratorOpen(administrator)}
              />
            );
          })}
        </EntityList>
      ) : null}
    </Section>
  );
}
