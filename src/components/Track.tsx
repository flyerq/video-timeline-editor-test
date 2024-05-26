import { twMerge } from "tailwind-merge";
import Droppable from "@/components/Droppable";
import Clip from "@/components/Clip";
import { TrackData, DndData } from "@/types";

export default function Track({ data, className }: { data: TrackData; className?: string }) {
  return (
    <Droppable
      data={
        {
          data,
          nodeId: `Track-${data.id}`,
          draggableId: `Draggable-Track-${data.id}`,
          droppableId: `Droppable-Track-${data.id}`,
          type: "track",
          method: "drag",
        } as DndData<TrackData>
      }
      className={twMerge("track relative flex min-w-max rounded-lg bg-neutral-800 p-1 hover:bg-neutral-700", className)}
      overClass="bg-neutral-700"
    >
      {data?.clips?.map((clip) => <Clip key={clip.id} data={clip} />)}
    </Droppable>
  );
}
