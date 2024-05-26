import { useState } from "react";
import { DragOverlay, useDndMonitor } from "@dnd-kit/core";
import { resources } from "@/data/mock-data";
import { ResourceItem } from "@/components/ResourceItem";
import { CLIP_WIDTH_PER_SECOND } from "@/components/Clip";
import type { ResourceData } from "@/types";

export default function ResourcePanel() {
  const [activeResource, setActiveResource] = useState<ResourceData | null>(null);
  const [isOver, setIsOver] = useState(false);

  useDndMonitor({
    onDragStart(event) {
      if (event.active?.data?.current?.type !== "resource") return;
      setActiveResource(event.active.data.current?.data);
    },
    onDragOver(event) {
      if (event.active?.data?.current?.type !== "resource") return;
      setActiveResource(event.active.data.current?.data);
      setIsOver(true);
    },
    onDragEnd(event) {
      if (event.active?.data?.current?.type !== "resource") return;
      setActiveResource(null);
      setIsOver(false);
    },
  });

  return (
    <div className="divide-y divide-neutral-700">
      <div className="p-4 font-bold">Resources</div>
      <div className="grid grid-cols-2 gap-4 p-4">
        {resources.map((item) => (
          <ResourceItem key={item.id} data={item} />
        ))}

        {activeResource ? (
          <DragOverlay className="cursor-grabbing" dropAnimation={null} zIndex={1000}>
            <div
              className="relative h-[48px] cursor-grabbing select-none"
              style={{ width: (activeResource?.duration / 1000) * CLIP_WIDTH_PER_SECOND }}
            >
              <img
                className="absolute left-0 top-0 z-[-1] select-none rounded-md opacity-50"
                style={{ width: "calc((25vw - 48px) / 2)", height: "auto", opacity: isOver ? 0 : 0.5 }}
                src={activeResource?.poster}
                alt={activeResource?.title}
              />
              <div
                className="h-[48px] cursor-grabbing select-none rounded-lg bg-[length:auto_100%] bg-repeat-x opacity-0"
                style={{
                  opacity: isOver ? 0.5 : 0,
                  backgroundImage: `url(${activeResource.poster})`,
                }}
              />
            </div>
          </DragOverlay>
        ) : null}
      </div>
    </div>
  );
}
