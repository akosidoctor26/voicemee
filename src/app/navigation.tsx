"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

function Navigation() {
  const pathname = usePathname();
  return (
    <nav>
      <ul>
        <li>
          <Link className={pathname === "/" ? "active" : ""} href="/">
            Home
          </Link>
          <Link
            className={pathname === "/history" ? "active" : ""}
            href="/history"
          >
            History
          </Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navigation;
