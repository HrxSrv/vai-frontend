import { useState } from "react";
import { Check, Settings } from "lucide-react";
import { Button } from "@/components/ui/buttonSC";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ModelSelector() {
  const models = [
    "GPT-4",
    "GPT-3.5 Turbo", 
    "Claude Sonnet",
    "Claude Haiku",
    "Gemini Pro",
    "Gemini Ultra",
    "LLaMA 2",
    "PaLM 2"
  ];

  const [selectedModel, setSelectedModel] = useState(models[0]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="bg-background text-foreground border-border hover:bg-accent hover:text-accent-foreground">
          <Settings className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48 bg-background border-border">
        {models.map((model) => (
          <DropdownMenuItem
            key={model}
            onClick={() => setSelectedModel(model)}
            className="flex items-center justify-between hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
          >
            <span className="text-foreground">{model}</span>
            {selectedModel === model && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}