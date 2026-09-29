"use client";

import Link, { useLinkStatus } from "next/link";
import type { ComponentProps } from "react";
import { createPortal } from "react-dom";
import PageLoading from "@/components/PageLoading/PageLoading";

function PendingNavigation() {
  const { pending } = useLinkStatus();
  return pending ? createPortal(<PageLoading />, document.body) : null;
}

/** Keep initial exported HTML visible; show the loader only for navigation. */
export default function NavigationLink({ children, ...props }: ComponentProps<typeof Link>) {
  return <Link {...props}>{children}<PendingNavigation /></Link>;
}
