import _ from "lodash";
import { useState, createContext, useRef } from "react";
import { useDndMonitor } from "@dnd-kit/core";
import { tracks as defaultTracks } from "@/data/mock-data";
import Droppable from "@/components/Droppable";
import Track from "@/components/Track";
import { CLIP_WIDTH_PER_SECOND, ClipPlaceholder } from "@/components/Clip";
import type { ClipData, TrackData } from "@/types";

export type TimelineContext = {
  tracks: TrackData[];
  setTracks: React.Dispatch<React.SetStateAction<TrackData[]>>;
};

export const TimelineContext = createContext<TimelineContext>({
  tracks: [],
  setTracks: () => {},
});

export default function TimelinePanel() {
  const nodeId = "Timeline";
  const draggableId = "Draggable-Timeline";
  const droppableId = "Droppable-Timeline";
  const [tracks, setTracks] = useState<TrackData[]>(() => _.cloneDeep(defaultTracks));
  const timelineNode = useRef<HTMLElement | null>(null);
  const newClip = useRef<ClipData | null>(null);
  const clipPlaceholderNode = useRef<React.ElementRef<"div"> | null>(null);
  const finalValues = useRef<{
    clip: ClipData;
    targetTrack?: TrackData;
    isCreateNewTrackHead?: boolean;
    isCreateNewTrackTail?: boolean;
  } | null>(null);

  useDndMonitor({
    onDragOver(event) {
      const activeData = event?.active?.data?.current;
      if (activeData?.type !== "resource") return;

      newClip.current = {
        id: _.uniqueId(),
        trackId: "",
        startTime: 0,
        duration: activeData?.data?.duration,
        originMedia: activeData?.data,
      };
    },
    onDragMove(event) {
      const { active, collisions } = event;
      const activeData = active?.data?.current;
      if (activeData?.method !== "drag" || !_.includes(["clip", "resource"], activeData?.type)) {
        return;
      }

      const timeline = _.find(collisions, { id: droppableId });
      if (!timeline) {
        clipPlaceholderNode.current!.style.display = "";
        return;
      }

      // collisions without timeline and self clip
      const filteredCollisions = _.filter(
        collisions,
        (item) => !_.includes([droppableId, activeData?.droppableId], item.id),
      );

      const timelineRect = timeline?.data?.droppableContainer?.rect?.current;
      const activeClipData = activeData?.type === "resource" ? newClip?.current : activeData?.data;
      const activeClipNode = document.querySelector<HTMLElement>(`#${activeData?.nodeId}`);
      const activeClipRect = active?.rect?.current?.translated;
      const firstTrackNode = timelineNode.current?.firstElementChild as HTMLElement;
      const lastTrackNode = timelineNode.current?.lastElementChild as HTMLElement;
      const activeClipOffsetY = (activeClipRect?.top ?? 0) - (timelineRect.top ?? 0);
      const isCreateNewTrackHead = activeClipOffsetY < firstTrackNode!.offsetTop - (activeClipRect?.height ?? 0) / 2;
      const isCreateNewTrackTail = activeClipOffsetY > lastTrackNode!.offsetTop + (activeClipRect?.height ?? 0) / 2;
      const targetTrack = _.maxBy(
        _.filter(filteredCollisions, (item) => item?.data?.droppableContainer.data.current.type === "track"),
        (item) => item?.data?.value,
      );
      const targetTrackData = targetTrack?.data?.droppableContainer?.data?.current?.data;
      const targetTrackNode = targetTrack?.data?.droppableContainer?.node?.current;
      const targetTrackRect = targetTrack?.data?.droppableContainer?.rect?.current;

      // create new track
      if (isCreateNewTrackHead || isCreateNewTrackTail) {
        _.assign(clipPlaceholderNode.current!.style, {
          width: `${firstTrackNode?.offsetWidth ?? 0}px`,
          height: "0",
          left: `${firstTrackNode?.offsetLeft}px`,
          top: `${isCreateNewTrackHead ? (firstTrackNode?.offsetTop ?? 0) - 2 : (lastTrackNode?.offsetTop ?? 0) + (lastTrackNode?.offsetHeight ?? 0)}px`,
          borderStyle: "solid",
          display: "block",
        });

        finalValues.current = {
          isCreateNewTrackHead,
          isCreateNewTrackTail,
          clip: activeClipData,
        };

        return;
      }

      if (!targetTrack) return;

      const targetTrackOverClipCollisions = _.filter(
        filteredCollisions,
        (item) =>
          item?.data?.droppableContainer?.data?.current?.type === "clip" &&
          item?.data?.droppableContainer?.data?.current?.data?.trackId === targetTrackData?.id,
      );

      // no over clip on target track
      let clipPlaceholderOffsetLeft = 0;
      if (_.isEmpty(targetTrackOverClipCollisions)) {
        clipPlaceholderOffsetLeft = Math.max(
          (activeClipRect?.left ?? 0) - (timelineRect?.left ?? 0),
          targetTrackNode?.offsetLeft ?? 0,
        );
        _.assign(clipPlaceholderNode.current!.style, {
          width: `${activeClipRect?.width ?? 0}px`,
          height: `${activeClipRect?.height ?? 0}px`,
          left: `${clipPlaceholderOffsetLeft}px`,
          top: `${targetTrackNode?.offsetTop ?? 0}px`,
          borderStyle: "dashed",
          display: "block",
        });
      } else {
        // over some clip on target track
        const closestOverClip = _.minBy(targetTrackOverClipCollisions, (item) =>
          Math.abs((activeClipRect?.left ?? 0) - (item?.data?.droppableContainer?.rect?.current?.left ?? 0)),
        );
        const closestOverClipNode = closestOverClip?.data?.droppableContainer?.node?.current?.parentElement;
        const closestOverClipRect = closestOverClip?.data?.droppableContainer?.rect?.current;
        const closestOverClipOffsetX =
          (activeClipRect?.left ?? 0) - ((closestOverClipRect?.left ?? 0) + (closestOverClipRect.width ?? 0) / 2);

        if (closestOverClipOffsetX < 0) {
          // insert to closestOverClip before
          clipPlaceholderOffsetLeft = (closestOverClipRect?.left ?? 0) - (timelineRect?.left ?? 0);
          _.assign(clipPlaceholderNode.current!.style, {
            width: "0",
            height: `${closestOverClipRect?.height ?? 0}px`,
            left: `${clipPlaceholderOffsetLeft - 4}px`,
            top: `${(closestOverClipRect?.top ?? 0) - (timelineRect?.top ?? 0)}px`,
            borderStyle: "solid",
            display: "block",
          });

          // if there has enough space in before to show complete placeholder rectangle
          const canShowRectBefore =
            (closestOverClipRect?.left ?? 0) -
              ((closestOverClipNode?.previousElementSibling === activeClipNode
                ? activeClipNode
                : closestOverClipNode
              )?.previousElementSibling?.getBoundingClientRect().right ??
                targetTrackRect?.left ??
                0) >
            (activeClipRect?.width ?? 0);

          if (canShowRectBefore) {
            clipPlaceholderOffsetLeft =
              (closestOverClipRect?.left ?? 0) - (timelineRect?.left ?? 0) - (activeClipRect?.width ?? 0);
            _.assign(clipPlaceholderNode.current!.style, {
              width: `${activeClipRect?.width ?? 0}px`,
              left: `${clipPlaceholderOffsetLeft}px`,
              borderStyle: "dashed",
            });
          }
        } else {
          // append to closestOverClip after
          clipPlaceholderOffsetLeft = (closestOverClipRect?.right ?? 0) - (timelineRect?.left ?? 0);
          _.assign(clipPlaceholderNode.current!.style, {
            width: "0",
            height: `${closestOverClipRect?.height ?? 0}px`,
            left: `${clipPlaceholderOffsetLeft}px`,
            top: `${(closestOverClipRect?.top ?? 0) - (timelineRect?.top ?? 0)}px`,
            borderStyle: "solid",
            display: "block",
          });

          // if there has enough space in after to show complete placeholder rectangle
          const canShowRectAfter =
            ((closestOverClipNode?.nextElementSibling === activeClipNode
              ? activeClipNode
              : closestOverClipNode
            )?.nextElementSibling?.getBoundingClientRect().left ?? Number.MAX_SAFE_INTEGER) -
              (closestOverClipRect?.right ?? 0) >
            (activeClipRect?.width ?? 0);

          if (canShowRectAfter) {
            _.assign(clipPlaceholderNode.current!.style, {
              width: `${activeClipRect?.width ?? 0}px`,
              borderStyle: "dashed",
            });
          }
        }
      }

      finalValues.current = {
        clip: {
          ...activeClipData,
          startTime:
            (Math.max(0, clipPlaceholderOffsetLeft - (targetTrackNode?.offsetLeft ?? 0)) / CLIP_WIDTH_PER_SECOND) *
            1000,
        },
        targetTrack: targetTrackData,
      };
    },
    onDragEnd(event) {
      const activeData = event.active?.data?.current;
      if (
        activeData?.method !== "drag" ||
        !_.includes(["clip", "resource"], activeData?.type) ||
        !event.over ||
        !finalValues.current
      ) {
        return;
      }

      clipPlaceholderNode.current!.style.display = "";
      const { isCreateNewTrackHead, isCreateNewTrackTail } = finalValues.current;
      const clip = _.cloneDeep(finalValues.current.clip);

      // create new track and move clip to new track
      if (isCreateNewTrackHead || isCreateNewTrackTail) {
        setTracks((prevTracks) => {
          const newTracks = _.cloneDeep(prevTracks);
          const clipOldTrackIndex = _.findIndex(prevTracks, { id: clip.trackId });
          _.remove(newTracks[clipOldTrackIndex]?.clips, { id: clip.id });
          const newTrack: TrackData = { id: _.uniqueId(), clips: [] };
          clip.trackId = newTrack.id;
          clip.startTime = 0;
          newTrack.clips.push(clip);
          isCreateNewTrackHead ? newTracks.unshift(newTrack) : newTracks.push(newTrack);

          // clear empty track
          _.remove(newTracks, (track) => _.isEmpty(track?.clips));

          return newTracks;
        });
      } else {
        setTracks((prevTracks) => {
          const newTracks = _.cloneDeep(prevTracks);
          const targetTrack = finalValues.current?.targetTrack;
          const clipOldTrackIndex = _.findIndex(prevTracks, { id: clip.trackId });
          const clipTargetTrackIndex = _.findIndex(prevTracks, { id: targetTrack?.id });

          if (targetTrack?.id === clip?.trackId) {
            const clipIndex = _.findIndex(newTracks[clipOldTrackIndex]?.clips, { id: clip.id });
            _.set(newTracks, `[${clipTargetTrackIndex}].clips[${clipIndex}]`, clip);
          } else {
            _.remove(newTracks[clipOldTrackIndex]?.clips, { id: clip.id });
            clip.trackId = targetTrack?.id ?? "";
            newTracks[clipTargetTrackIndex].clips.push(clip);
          }

          // sort target track clips by startTime
          newTracks[clipTargetTrackIndex].clips.sort((a, b) => {
            if (a.startTime === b.startTime && _.includes([a.id, b.id], clip.id)) return a.id === clip.id ? -1 : 1;
            return a.startTime - b.startTime;
          });

          // update clip after each clips startTime to correct value
          const clipIndex = _.findIndex(newTracks[clipTargetTrackIndex].clips, { id: clip.id });
          for (let i = clipIndex + 1; i < newTracks[clipTargetTrackIndex].clips.length; i++) {
            const prevClip = newTracks[clipTargetTrackIndex].clips[i - 1];
            const nextClip = newTracks[clipTargetTrackIndex].clips[i];
            if (nextClip.startTime < prevClip.startTime + prevClip.duration) {
              nextClip.startTime = prevClip.startTime + prevClip.duration;
            }
          }

          // clear empty track
          _.remove(newTracks, (track) => _.isEmpty(track?.clips));

          return newTracks;
        });
      }

      newClip.current = null;
      finalValues.current = null;
    },
  });

  return (
    <TimelineContext.Provider value={{ tracks, setTracks }}>
      <div className="flex flex-auto flex-col">
        <div className="border-b border-b-neutral-700 p-4 font-bold">Timeline</div>

        {/* tracks area */}
        <div
          className="relative flex w-full flex-1 flex-col overflow-auto"
          onScroll={_.throttle((event) => {
            (event.currentTarget.firstElementChild as HTMLDivElement)!.style.minWidth =
              `${event.currentTarget!.scrollWidth}px`;
          }, 300)}
        >
          <Droppable
            ref={timelineNode}
            data={{ data: tracks, nodeId, draggableId, droppableId, type: "timeline", method: "drag" }}
            className="relative box-content grid flex-1 grid-flow-row auto-rows-[48px] gap-3 p-6"
          >
            {tracks.map((track) => (
              <Track key={track.id} data={track} />
            ))}
          </Droppable>
          <ClipPlaceholder ref={clipPlaceholderNode} />
        </div>
      </div>
    </TimelineContext.Provider>
  );
}
