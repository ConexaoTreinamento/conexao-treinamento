import type { MouseEvent } from "react";
import { Calendar, Clock, Loader2, MapPin, Trash2, Users } from "lucide-react";
import ConfirmDeleteButton from "@/components/base/confirm-delete-button";
import { EditButton } from "@/components/base/edit-button";
import {
  EntityCard,
  type EntityCardMetadataItem,
} from "@/components/base/entity-card";

export interface EventCardData {
  id: string;
  name: string;
  dateLabel: string;
  timeLabel: string;
  location: string;
  participantsLabel: string;
  description?: string;
  instructorLabel?: string;
}

interface EventCardProps {
  event: EventCardData;
  onSelect: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => Promise<void> | void;
  deletingEventId?: string | null;
}

export function EventCard({
  event,
  onSelect,
  onEdit,
  onDelete,
  deletingEventId,
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

  const handleEditClick = (clickEvent: MouseEvent<HTMLButtonElement>) => {
    clickEvent.stopPropagation();
    onEdit?.(event.id);
  };

  const handleDelete = () => onDelete?.(event.id);

  const shouldShowActions = Boolean(onEdit || onDelete);

  const mobileActions = shouldShowActions ? (
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
            <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
          ) : (
            <Trash2 className="h-3 w-3" aria-hidden="true" />
          )}
          <span className="sr-only">Excluir evento</span>
        </ConfirmDeleteButton>
      ) : null}
    </>
  ) : undefined;

  const desktopActions = shouldShowActions ? (
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
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          )}
          <span>Excluir</span>
        </ConfirmDeleteButton>
      ) : null}
    </>
  ) : undefined;

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
      mobileActions={mobileActions}
      desktopActions={desktopActions}
    />
  );
}
