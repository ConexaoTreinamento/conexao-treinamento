import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ProfileActionButton } from "@/components/base/profile-action-button";

function EvaluationButton() {
  return (
    <>
      <Plus className="h-4 w-4" aria-hidden="true" />
      Avaliação
    </>
  );
}

export function CreateEvaluationButton(props: {
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <Button
      size="sm"
      variant="outline"
      onClick={props.onClick}
      className="h-8 px-2 text-xs"
    >
      <EvaluationButton/>
    </Button>
  );
}

export function CreateEvaluationProfileButton(props: { onClick: () => void }) {
  return (
    <ProfileActionButton key="evaluate" onClick={props.onClick}>
      <EvaluationButton />
    </ProfileActionButton>
  );
}