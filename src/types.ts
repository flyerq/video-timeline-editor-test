export type ResourceData = {
  id: string | number;
  title: string;
  type: string;
  duration: number;
  width: number;
  height: number;
  url: string;
  poster: string;
};

export type ClipData = {
  id: string | number;
  trackId: string | number;
  startTime: number;
  duration: number;
  originMedia: ResourceData;
};

export type TrackData = {
  id: string | number;
  clips: ClipData[];
};

export type DndData<T = unknown> = {
  data: T;
  nodeId?: string | number;
  draggableId: string | number;
  droppableId: string | number;
  method: "drag" | "resize";
  type: "resource" | "timeline" | "track" | "clip";
};
