import { useDraggable } from "@dnd-kit/core";
import type { ResourceData, DndData } from "@/types";

export function ResourceItem({ data }: { data: ResourceData }) {
  const nodeId = `ResourceItem-${data.id}`;
  const draggableId = `Draggable-ResourceItem-${data.id}`;
  const droppableId = `Droppable-ResourceItem-${data.id}`;
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: draggableId,
    data: { data, nodeId, draggableId, droppableId, type: "resource", method: "drag" } as DndData<ResourceData>,
  });

  return (
    <div
      ref={setNodeRef}
      id={nodeId}
      className="z-[1000] cursor-grab rounded-md border-2 border-transparent hover:border-blue-500 active:cursor-grabbing"
      {...listeners}
      {...attributes}
    >
      <img className="aspect-video rounded-md" src={data.poster} alt={data?.title} />
      <div className="truncate p-1 text-center text-xs">{data.title}</div>
    </div>
  );
}
