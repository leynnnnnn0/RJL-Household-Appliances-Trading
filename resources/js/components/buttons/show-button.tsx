import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

interface ShowButtonProps {
  onClick?: () => void; // optional function prop
}

export default function ShowButton({ onClick }: ShowButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8"
      onClick={onClick} // attach the function here
    >
      <Eye className="h-4 w-4" />
    </Button>
  );
}
