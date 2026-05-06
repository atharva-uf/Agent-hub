import { useState } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Play } from "lucide-react";
import { TASK_LABEL, type TaskType } from "@/types";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onRun: (task: TaskType, config: string) => void;
}

export function TaskModal({ open, onOpenChange, onRun }: Props) {
  const [task, setTask] = useState<TaskType>("tests");
  const [config, setConfig] = useState("");

  const submit = () => {
    onRun(task, config);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Run agent task</DialogTitle>
          <DialogDescription>
            Choose a task. The agent will stream execution into the panel below.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-1">
          <div className="grid gap-1.5">
            <Label htmlFor="task-type" className="text-xs text-text-secondary">Task type</Label>
            <Select value={task} onValueChange={(v) => setTask(v as TaskType)}>
              <SelectTrigger id="task-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(TASK_LABEL) as TaskType[]).map((t) => (
                  <SelectItem key={t} value={t}>{TASK_LABEL[t]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="config" className="text-xs text-text-secondary">
              Config <span className="text-text-muted">(optional)</span>
            </Label>
            <Textarea
              id="config"
              placeholder='e.g. --shard=1/4 or { "branch": "feat/x" }'
              value={config}
              onChange={(e) => setConfig(e.target.value)}
              className="min-h-[80px] font-mono text-xs"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} className="gap-1.5">
            <Play className="h-3.5 w-3.5" /> Run task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
