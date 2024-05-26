import _ from "lodash";
import type { ResourceData, TrackData } from "@/types";

export const resources: ResourceData[] = [
  {
    id: 1,
    title: "Video 01",
    type: "video/mp4",
    duration: 14000,
    width: 3840,
    height: 2160,
    url: new URL("../assets/videos/01.mp4", import.meta.url).href,
    poster: new URL("../assets/videos/01-poster.jpeg", import.meta.url).href,
  },
  {
    id: 2,
    title: "Video 02",
    type: "video/mp4",
    duration: 7000,
    width: 4096,
    height: 2160,
    url: new URL("../assets/videos/02.mp4", import.meta.url).href,
    poster: new URL("../assets/videos/02-poster.jpeg", import.meta.url).href,
  },
  {
    id: 3,
    title: "Video 03",
    type: "video/mp4",
    duration: 13000,
    width: 3840,
    height: 2160,
    url: new URL("../assets/videos/03.mp4", import.meta.url).href,
    poster: new URL("../assets/videos/03-poster.jpeg", import.meta.url).href,
  },
  {
    id: 4,
    title: "Video 04",
    type: "video/mp4",
    duration: 34000,
    width: 3840,
    height: 2160,
    url: new URL("../assets/videos/04.mp4", import.meta.url).href,
    poster: new URL("../assets/videos/04-poster.jpeg", import.meta.url).href,
  },
  {
    id: 5,
    title: "Video 05",
    type: "video/mp4",
    duration: 13000,
    width: 3840,
    height: 2160,
    url: new URL("../assets/videos/05.mp4", import.meta.url).href,
    poster: new URL("../assets/videos/05-poster.jpeg", import.meta.url).href,
  },
];

export const tracks: TrackData[] = [
  {
    id: 1,
    clips: [
      {
        id: _.uniqueId(),
        trackId: 1,
        startTime: 0,
        duration: 14000,
        originMedia: _.cloneDeep(resources[0]),
      },
    ],
  },
  {
    id: 2,
    clips: [
      {
        id: _.uniqueId(),
        trackId: 2,
        startTime: 0,
        duration: 7000,
        originMedia: _.cloneDeep(resources[1]),
      },
    ],
  },
  {
    id: 3,
    clips: [
      {
        id: _.uniqueId(),
        trackId: 3,
        startTime: 0,
        duration: 13000,
        originMedia: _.cloneDeep(resources[2]),
      },

      {
        id: _.uniqueId(),
        trackId: 3,
        startTime: 15000,
        duration: 13000,
        originMedia: _.cloneDeep(resources[4]),
      },
    ],
  },
  {
    id: 4,
    clips: [
      {
        id: _.uniqueId(),
        trackId: 4,
        startTime: 0,
        duration: 34000,
        originMedia: _.cloneDeep(resources[3]),
      },
    ],
  },
];
