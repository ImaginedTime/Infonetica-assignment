import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Workflow Engine UI",
  description: "Modern UI for WorkflowEngine APIs",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={cn(inter.className, "bg-gray-50 min-h-screen")}> 
        <nav className="bg-white border-b shadow-sm px-4 py-3 flex items-center gap-4">
          <Link href="/">
            <span className="font-bold text-xl tracking-tight text-blue-700">WorkflowEngine</span>
          </Link>
          <div className="flex-1" />
          <Link href="/">
            <Button variant="ghost">Dashboard</Button>
          </Link>
          <Link href="/workflows/new">
            <Button>Create Workflow</Button>
          </Link>
        </nav>
        <div className="pt-6">{children}</div>
      </body>
    </html>
  );
}
