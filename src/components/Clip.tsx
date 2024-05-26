import _ from "lodash";
import { forwardRef, useContext, useRef } from "react";
import { useDraggable, useDndMonitor } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { twMerge } from "tailwind-merge";
import Droppable from "@/components/Droppable";
import { TimelineContext } from "@/components/TimelinePanel";
import type { ClipData, DndData } from "@/types";

export const CLIP_WIDTH_PER_SECOND = 24;

export default function Clip({ data }: { data: ClipData }) {
  const nodeId = `Clip-${data.trackId}-${data.id}`;
  const draggableId = `Draggable-Clip-${data.trackId}-${data.id}`;
  const droppableId = `Droppable-Clip-${data.trackId}-${data.id}`;
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: draggableId,
    data: { data, nodeId, draggableId, droppableId, type: "clip", method: "drag" },
  });
  const style = transform
    ? {
        zIndex: 1000,
        transform: CSS.Translate.toString({
          ...transform,
        }),
      }
    : undefined;

  return (
    <div
      id={nodeId}
      ref={setNodeRef}
      className="group absolute left-0 top-0 h-full select-none rounded-lg bg-[length:auto_100%] bg-repeat-x will-change-[left,width,transform]"
      style={{
        width: (data.duration / 1000) * CLIP_WIDTH_PER_SECOND,
        minWidth: CLIP_WIDTH_PER_SECOND,
        left: (data.startTime / 1000) * CLIP_WIDTH_PER_SECOND,
        backgroundImage: `url(${data.originMedia.poster})`,
        ...style,
      }}
      {...listeners}
      {...attributes}
    >
      <Droppable
        data={{ data, draggableId, droppableId, type: "clip", method: "drag" } as DndData<ClipData>}
        className="h-full w-full cursor-grab rounded-lg border-2 border-blue-500 opacity-0 group-hover:opacity-100 group-active:cursor-grabbing group-active:opacity-100"
      >
        <ClipResizeHandle data={data} direction="left" />
        <ClipResizeHandle data={data} direction="right" />
      </Droppable>
    </div>
  );
}

export function ClipResizeHandle({ data, direction }: { data: ClipData; direction: "left" | "right" }) {
  const { tracks, setTracks } = useContext(TimelineContext);
  const nodeId = `ClipResizeHandle-${data.trackId}-${data.id}-${direction}`;
  const draggableId = `Draggable-ClipResizeHandle-${data.trackId}-${data.id}-${direction}`;
  const droppableId = `Droppable-ClipResizeHandle-${data.trackId}-${data.id}-${direction}`;
  const finalClipValues = useRef(() => _.cloneDeep(data));
  const { node, attributes, listeners, setNodeRef } = useDraggable({
    id: draggableId,
    data: { data, nodeId, draggableId, droppableId, type: "clip", method: "resize" } as DndData<ClipData>,
  });
  const prevDuration = data.duration;

  useDndMonitor({
    onDragMove(event) {
      if (event.active.id !== draggableId) return;
      let deltaDuration = (event.delta.x / CLIP_WIDTH_PER_SECOND) * 1000;
      const clipNode = node.current?.parentElement?.parentElement;
      if (!clipNode) return;
      let duration = prevDuration + deltaDuration;
      let startTime = data.startTime + deltaDuration;
      const trackIndex = _.findIndex(tracks, { id: data?.trackId });
      const clipIndex = _.findIndex(tracks[trackIndex].clips, { id: data?.id });

      if (direction === "left") {
        deltaDuration *= -1;
        duration = prevDuration + deltaDuration;
        const prevClip = tracks[trackIndex].clips[clipIndex - 1];
        const minStartTime = (prevClip?.startTime ?? 0) + (prevClip?.duration ?? 0);

        if (startTime <= minStartTime) {
          startTime = minStartTime;
          duration = prevDuration + data.startTime - startTime;
        }
        if (duration <= 1000) {
          duration = 1000;
          startTime = data.startTime + (prevDuration - duration);
        }
      } else if (direction == "right") {
        startTime = data.startTime;
        const prevClip = tracks[trackIndex].clips[clipIndex - 1];
        const nextClip = tracks[trackIndex].clips[clipIndex + 1];
        const maxDuration =
          (nextClip?.startTime ?? Number.MAX_SAFE_INTEGER) - ((prevClip?.startTime ?? 0) + (prevClip?.duration ?? 0));
        duration = _.clamp(duration, 1000, maxDuration);
      }

      clipNode.style.width = (duration / 1000) * CLIP_WIDTH_PER_SECOND + "px";
      clipNode.style.left = `${(startTime / 1000) * CLIP_WIDTH_PER_SECOND}px`;
      _.set(finalClipValues, "current.duration", duration);
      _.set(finalClipValues, "current.startTime", startTime);
    },
    onDragEnd(event) {
      if (event.active.id !== draggableId) return;

      setTracks((prevTracks) => {
        const currentData = event.active.data.current?.data;
        const trackIndex = _.findIndex(prevTracks, {
          id: currentData?.trackId,
        });
        const clipIndex = _.findIndex(prevTracks[trackIndex].clips, {
          id: currentData?.id,
        });
        const newTracks = _.cloneDeep(prevTracks);

        _.set(newTracks, `[${trackIndex}].clips[${clipIndex}].duration`, _.get(finalClipValues, "current.duration"));
        _.set(newTracks, `[${trackIndex}].clips[${clipIndex}].startTime`, _.get(finalClipValues, "current.startTime"));

        return newTracks;
      });
    },
  });

  return (
    <div
      id={nodeId}
      ref={setNodeRef}
      className={twMerge(
        "absolute top-0 grid h-full w-[8px] cursor-col-resize place-items-center after:absolute after:block after:h-1/2 after:w-full after:bg-blue-500",
        direction === "left" ? "left-0 after:rounded-r-md" : "right-0 after:rounded-l-md",
      )}
      {...listeners}
      {...attributes}
    />
  );
}

export const ClipPlaceholder = forwardRef<React.ElementRef<"div">, React.ComponentPropsWithoutRef<"div">>(
  (props, ref) => {
    return (
      <div
        ref={ref}
        id="ClipPlaceholder"
        className="absolute left-0 top-0 z-[500] hidden h-[48px] w-[48px] select-none rounded-lg border-2 border-dashed border-blue-500 bg-blue-500/20 opacity-80 will-change-[left,top,width,height,transform]"
        {...props}
      />
    );
  },
);
