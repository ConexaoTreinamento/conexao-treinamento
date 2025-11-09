import type { MouseEvent } from "react";
import { Calendar, Clock, Loader2, MapPin, RotateCcw, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import ConfirmDeleteButton from "@/components/base/confirm-delete-button";
import { EditButton } from "@/components/base/edit-button";
import {
  EntityCard,
  type EntityCardMetadataItem,
} from "@/components/base/entity-card";
import { StatusBadge } from "@/components/base/status-badge";

export interface EventCardData {
  id: string;
  name: string;
  dateLabel: string;
  timeLabel: string;
  location: string;
  participantsLabel: string;
  description?: string;
  instructorLabel?: string;
  isDeleted: boolean;
}

interface EventCardProps {
  event: EventCardData;
  onSelect: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => Promise<void> | void;
  onRestore?: (id: string) => Promise<void> | void;
  deletingEventId?: string | null;
  restoringEventId?: string | null;
}

export function EventCard({
  event,
  onSelect,
  onEdit,
  onDelete,
  onRestore,
  deletingEventId,
  restoringEventId,
}: EventCardProps) {
  const metadata: EntityCardMetadataItem[] = [
    {
      icon: (
        <Calendar className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
      ),
      content: event.dateLabel,
    },
    {
      icon: (
        <Clock className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
      ),
      content: event.timeLabel,
    },
    {
      icon: (
        <MapPin className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
      ),
      content: event.location,
    },
    {
      icon: (
        <Users className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
      ),
      content: event.participantsLabel,
    },
  ];

  const infoRows = event.instructorLabel
    ? [
        <span key="instructor" className="text-sm text-muted-foreground">
          {event.instructorLabel}
        </span>,
      ]
    : undefined;

  const descriptionBody = event.description ? (
    <p className="text-sm text-muted-foreground line-clamp-2">
      {event.description}
    </p>
  ) : undefined;

  const isDeleting = Boolean(deletingEventId && deletingEventId === event.id);
  const isRestoring = Boolean(restoringEventId && restoringEventId === event.id);
  const isDeleted = event.isDeleted;

  const handleEditClick = (clickEvent: MouseEvent<HTMLButtonElement>) => {
    clickEvent.stopPropagation();
    onEdit?.(event.id);
  };

  const handleDelete = () => onDelete?.(event.id);
  const handleRestore = (clickEvent: MouseEvent<HTMLButtonElement>) => {
    clickEvent.stopPropagation();
    void onRestore?.(event.id);
  };

  const hasRestoreAction = Boolean(onRestore) && isDeleted;
  const hasManageActions = !isDeleted && Boolean(onEdit || onDelete);
  const shouldShowActions = hasRestoreAction || hasManageActions;
  const badges = [
    <StatusBadge
      key="status"
      active={!event.isDeleted}
      activeLabel="Ativo"
      inactiveLabel="Inativo"
    />,
  ];

  const mobileActions = shouldShowActions
    ? hasRestoreAction
      ? (
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8"
            onClick={handleRestore}
            disabled={isRestoring}
            aria-label="Restaurar evento"
          >
            {isRestoring ? (
              <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
            ) : (
              <RotateCcw className="h-3 w-3" aria-hidden="true" />
            )}
          </Button>
        )
      : (
          <>
            {onEdit ? (
              <EditButton
                key="edit"
                size="icon"
                variant="outline"
                fullWidthOnDesktop={false}
                onClick={handleEditClick}
              />
            ) : null}
            {onDelete ? (
              <ConfirmDeleteButton
                key="delete"
                size="icon"
                variant="destructive"
                onConfirm={handleDelete}
                disabled={isDeleting}
                title="Excluir evento"
                description={`Tem certeza que deseja excluir o evento "${event.name}"? Esta ação não pode ser desfeita.`}
                confirmText={isDeleting ? "Excluindo..." : "Excluir"}
              >
                {isDeleting ? (
                  <Loader2
                    className="h-3 w-3 animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <Trash2 className="h-3 w-3" aria-hidden="true" />
                )}
                <span className="sr-only">Excluir evento</span>
              </ConfirmDeleteButton>
            ) : null}
          </>
        )
    : undefined;

  const desktopActions = shouldShowActions
    ? hasRestoreAction
      ? (
          <Button
            size="sm"
            variant="outline"
            className="h-8 px-3 text-sm"
            onClick={handleRestore}
            disabled={isRestoring}
          >
            {isRestoring ? (
              <Loader2 className="mr-1 h-3 w-3 animate-spin" aria-hidden="true" />
            ) : (
              <RotateCcw className="mr-1 h-3 w-3" aria-hidden="true" />
            )}
            Restaurar
          </Button>
        )
      : (
          <>
            {onEdit ? (
              <EditButton
                key="edit"
                size="sm"
                variant="outline"
                fullWidthOnDesktop={false}
                onClick={handleEditClick}
              />
            ) : null}
            {onDelete ? (
              <ConfirmDeleteButton
                key="delete"
                size="sm"
                variant="destructive"
                onConfirm={handleDelete}
                disabled={isDeleting}
                title="Excluir evento"
                description={`Tem certeza que deseja excluir o evento "${event.name}"? Esta ação não pode ser desfeita.`}
                confirmText={isDeleting ? "Excluindo..." : "Excluir evento"}
                className="gap-2"
              >
                {isDeleting ? (
                  <Loader2
                    className="h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                )}
                <span>Excluir</span>
              </ConfirmDeleteButton>
            ) : null}
          </>
        )
    : undefined;

  return (
    <EntityCard
      title={event.name}
      avatar={{
        icon: (
          <Calendar
            className="h-4 w-4 text-green-700 dark:text-green-300"
            aria-hidden="true"
          />
        ),
        backgroundClassName: "bg-green-100 dark:bg-green-900",
      }}
      metadata={metadata}
      metadataColumns={2}
      infoRows={infoRows}
      body={descriptionBody}
      onClick={() => onSelect(event.id)}
      badges={badges}
      muted={event.isDeleted}
      mobileActions={mobileActions}
      desktopActions={desktopActions}
    />
  );
}
