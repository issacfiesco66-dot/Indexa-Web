import { NextRequest } from "next/server";
import { spawn } from "child_process";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query");
  const max = request.nextUrl.searchParams.get("max") || "20";

  if (!query) {
    return new Response(JSON.stringify({ error: "Missing query parameter" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const encoder = new TextEncoder();
  const projectRoot = path.resolve(process.cwd());
  const scriptPath = path.join(projectRoot, "scraper_indexa.py");

  const stream = new ReadableStream({
    start(controller) {
      const args = [
        scriptPath,
        query,
        "--max", max,
        "--headless", "true",
        "--json-progress",
      ];

      const child = spawn("python", args, {
        cwd: projectRoot,
        env: { ...process.env },
        stdio: ["ignore", "pipe", "pipe"],
      });

      let buffer = "";

      child.stdout.on("data", (chunk: Buffer) => {
        buffer += chunk.toString("utf-8");
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.trim()) {
            controller.enqueue(encoder.encode(`data: ${line}\n\n`));
          }
        }
      });

      child.stderr.on("data", (chunk: Buffer) => {
        const msg = chunk.toString("utf-8").trim();
        if (msg) {
          const errorEvent = JSON.stringify({ event: "log", message: msg });
          controller.enqueue(encoder.encode(`data: ${errorEvent}\n\n`));
        }
      });

      child.on("close", (code) => {
        if (buffer.trim()) {
          controller.enqueue(encoder.encode(`data: ${buffer}\n\n`));
        }
        const endEvent = JSON.stringify({ event: "stream_end", exitCode: code });
        controller.enqueue(encoder.encode(`data: ${endEvent}\n\n`));
        controller.close();
      });

      child.on("error", (err) => {
        const errEvent = JSON.stringify({ event: "error", message: err.message });
        controller.enqueue(encoder.encode(`data: ${errEvent}\n\n`));
        controller.close();
      });

      // Abort handler
      request.signal.addEventListener("abort", () => {
        child.kill("SIGTERM");
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
