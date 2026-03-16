"use client";

import { FileText } from "lucide-react";
import { WidgetWrapper } from "./WidgetWrapper";
import { RecentInvoicesTable } from "../RecentInvoicesTable";

interface Props {
  isEditing: boolean;
  onRemove?: () => void;
  onViewDetail: (billNumber: string) => void;
  onPreview: (billNumber: string) => void;
}

export function RecentInvoicesWidget({
  isEditing,
  onRemove,
  onViewDetail,
  onPreview,
}: Props) {
  return (
    <WidgetWrapper
      title="Facturas Recientes"
      description="Ultimas facturas emitidas"
      icon={<FileText className="h-4 w-4" />}
      isEditing={isEditing}
      onRemove={onRemove}
      noPadding
    >
      <div className="h-full overflow-auto px-2 pb-2">
        <RecentInvoicesTable
          onViewDetail={onViewDetail}
          onPreview={onPreview}
        />
      </div>
    </WidgetWrapper>
  );
}
