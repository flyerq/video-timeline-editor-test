import "./App.css";
import { DndContext } from "@dnd-kit/core";
import ResourcePanel from "@/components/ResourcePanel";
import PreviewPanel from "@/components/PreviewPanel";
import TimelinePanel from "@/components/TimelinePanel";

function App() {
  return (
    <DndContext autoScroll={{ acceleration: 1 }}>
      <div className="flex h-screen w-screen overflow-hidden">
        <aside className=" w-[25%] border-r border-r-neutral-700 bg-neutral-900">
          <ResourcePanel />
        </aside>
        <main className="flex w-[75%] flex-col divide-y divide-neutral-700 bg-neutral-900">
          <PreviewPanel />
          <TimelinePanel />
        </main>
      </div>
    </DndContext>
  );
}

export default App;
