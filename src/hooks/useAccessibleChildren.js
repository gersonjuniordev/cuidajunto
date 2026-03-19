import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";
import { useState, useEffect } from "react";

/**
 * Retorna todas as crianças que o usuário tem acesso:
 * - crianças onde é o owner (owner_email === me.email)
 * - crianças onde está na lista caregiver_emails
 * - crianças criadas por ele (created_by === me.email) — fallback legado
 */
export function useAccessibleChildren() {
  const [me, setMe] = useState(null);

  useEffect(() => {
    api.auth.me().then(setMe).catch(() => {});
  }, []);

  const { data: allChildren = [], isLoading } = useQuery({
    queryKey: ["children"],
    queryFn: () => api.children.list(),
    enabled: !!me,
  });

  const accessibleChildren = me
    ? allChildren.filter(c =>
        c.owner_email === me.email ||
        c.created_by === me.email ||
        (c.caregiver_emails || []).includes(me.email)
      )
    : [];

  return { children: accessibleChildren, isLoading, me };
}