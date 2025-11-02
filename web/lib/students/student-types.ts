import type {AnamnesisResponseDto, PhysicalImpairmentResponseDto} from "@/lib/api-client";

export const impairmentTypes = {"visual": "Visual", "motor": "Motor", "auditory": "Auditório", "intellectual": "Intelectual", "other": "Outro"} as const satisfies Record<Exclude<PhysicalImpairmentResponseDto["type"], undefined>, string>
export const hasInsomniaTypes = {"yes": "Sim", "no": "Não", "sometimes": "Às vezes"} as const satisfies Record<Exclude<AnamnesisResponseDto["hasInsomnia"], undefined>, string>
