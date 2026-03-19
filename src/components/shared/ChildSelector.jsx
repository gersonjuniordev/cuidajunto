import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ChildSelector({ children, value, onChange, showAll = true }) {
  return (
    <Select value={value || "all"} onValueChange={onChange}>
      <SelectTrigger className="w-48">
        <SelectValue placeholder="Selecionar criança" />
      </SelectTrigger>
      <SelectContent>
        {showAll && <SelectItem value="all">Todas as crianças</SelectItem>}
        {children.map((child) => (
          <SelectItem key={child.id} value={child.id}>
            {child.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}