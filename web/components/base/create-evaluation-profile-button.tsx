import {ProfileActionButton} from "@/components/base/profile-action-button";
import {Plus} from "lucide-react";

export function CreateEvaluationProfileButton(props: { onClick: () => void }) {
    return <ProfileActionButton
        key="evaluate"
    onClick={props.onClick}
    >
    <Plus className="h-4 w-4" aria-hidden="true"/>
        <span>Avaliação</span>
        </ProfileActionButton>;
}

