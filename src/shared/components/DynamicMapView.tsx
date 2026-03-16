"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[300px] items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
      <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
    </div>
  ),
});

export { MapView as DynamicMapView };
