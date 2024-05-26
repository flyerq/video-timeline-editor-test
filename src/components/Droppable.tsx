import _ from "lodash";
import { forwardRef } from "react";
import { useDroppable } from "@dnd-kit/core";
import { twMerge } from "tailwind-merge";
import type { DndData } from "@/types";

export type Props = {
  data: DndData;
  className?: string;
  overClass?: string;
  children?: React.ReactNode;
};

export const Droppable = forwardRef<HTMLElement, Props>(({ data, className, overClass, children }, ref) => {
  const { isOver, setNodeRef } = useDroppable({ id: data.droppableId, data });

  return (
    <div
      id={data?.nodeId ? String(data.nodeId) : undefined}
      className={twMerge(className, isOver ? overClass : undefined)}
      ref={(node) => {
        if (_.has(ref, "current")) {
          ref.current = node;
        } else if (_.isFunction(ref)) {
          ref(node);
        }
        setNodeRef(node);
      }}
    >
      {children}
    </div>
  );
});

export default Droppable;
