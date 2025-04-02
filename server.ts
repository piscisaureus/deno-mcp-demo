async function handleRequest(req: Request): Promise<Response> {
  const url = new URL(req.url);

  if (url.pathname === "/sdk.ts") {
    const sdkContent = await Deno.readTextFile("./sdk.ts");
    return new Response(sdkContent, {
      headers: { "Content-Type": "application/typescript" },
    });
  }

  if (url.pathname === "/logs") {
    return new Response(generateMockLogs(), {
      headers: { "Content-Type": "text/plain" },
    });
  }

  const resourceMatch = url.pathname.match(/^\/(vm|bucket)\/(\d+)$/);
  if (resourceMatch) {
    const id = resourceMatch[2];
    if (isValidId(id)) {
      return new Response(JSON.stringify({ status: "ok" }), {
        headers: { "Content-Type": "application/json" },
      });
    } else {
      return new Response(null, {
        status: 400,
      });
    }
  }

  return new Response("Not Found", { status: 404 });
}

function isValidId(id: string): boolean {
  return /^\d{5,6}$/.test(id);
}

function generateMockLogs() {
  const logs = [];
  const types = ["vm", "bucket"];
  const actions = [
    "created",
    "started",
    "stopped",
    "deleted",
    "accessed",
    "updated",
  ];

  for (let i = 0; i < 200; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const id = Math.floor(Math.random() * 900000) + 100000;
    const action = actions[Math.floor(Math.random() * actions.length)];
    const timestamp = new Date().toISOString();
    logs.push(`[${timestamp}] ${type}:${id} was ${action}`);
  }

  const insertionPoint = Math.floor(Math.random() * logs.length);
  logs.splice(insertionPoint, 0, "failed to start vm:123456(deleted)");

  return logs.join("\n");
}

await Deno.serve(handleRequest);
