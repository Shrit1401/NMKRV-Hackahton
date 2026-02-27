import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type MediaListResponse = {
  files?: unknown[];
  total?: number;
  [key: string]: unknown;
};

function absolutizeMaybe(value: unknown, base: string): unknown {
  if (typeof value !== "string") {
    return value;
  }
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }
  try {
    return new URL(value, base).toString();
  } catch {
    return value;
  }
}

export async function GET() {
  const base = process.env.API_BASE_URL;
  if (!base) {
    return NextResponse.json(
      { error: "API_BASE_URL not configured" },
      { status: 500 },
    );
  }

  try {
    const upstream = await fetch(new URL("/media/list", base), {
      cache: "no-store",
    });

    const contentType = upstream.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      const body = await upstream.text();
      return new Response(body, {
        status: upstream.status,
        headers: { "content-type": contentType || "text/plain" },
      });
    }

    const json = (await upstream.json()) as MediaListResponse;
    const files = Array.isArray(json.files) ? json.files : [];

    const mapped = files.map((file) => {
      if (typeof file === "string") {
        return absolutizeMaybe(file, base);
      }
      if (typeof file === "object" && file !== null) {
        const record = file as Record<string, unknown>;
        return {
          ...record,
          url: absolutizeMaybe(record.url, base),
          path: absolutizeMaybe(record.path, base),
          filepath: absolutizeMaybe(record.filepath, base),
        };
      }
      return file;
    });

    return NextResponse.json(
      { ...json, files: mapped },
      { status: upstream.status },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Upstream fetch failed", message },
      { status: 502 },
    );
  }
}

