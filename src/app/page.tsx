import { ThreadList } from "./components/thread/thread-list";
import { ThreadCreateButton } from "./thread/[threadId]/components/thread/thread-create-button";

export default function Home() {
  return (
    <div className="p-2">
      <div className="max-w-4xl mx-auto">
        <ThreadList />
      </div>
      <ThreadCreateButton></ThreadCreateButton>
    </div>
  );
}
