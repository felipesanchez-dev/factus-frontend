"use client";

import { Trophy } from "lucide-react";
import { WidgetWrapper } from "./WidgetWrapper";
import { TopClientsTable } from "../TopClientsTable";
import type { TopClient } from "../../domain/dashboard.types";

interface Props {
  initialClients: TopClient[];
  isEditing: boolean;
  onRemove?: () => void;
}

export function TopClientsWidget({
  initialClients,
  isEditing,
  onRemove,
}: Props) {
  return (
    <WidgetWrapper
      title="Top Clientes"
      description="Mejores clientes por ingresos"
      icon={<Trophy className="h-4 w-4" />}
      isEditing={isEditing}
      onRemove={onRemove}
      noPadding
    >
      <div className="h-full overflow-auto px-2 pb-2">
        <TopClientsTable initialClients={initialClients} />
      </div>
    </WidgetWrapper>
  );
}
