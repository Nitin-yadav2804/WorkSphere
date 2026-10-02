import { Loader2 } from "lucide-react";

export default function Spinner({ className = "animate-spin", ...props }) {
  return <Loader2 className={className} {...props} />;
}
