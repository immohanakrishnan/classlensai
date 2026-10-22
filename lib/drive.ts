export function parseDriveUrl(value: string) {
  try {
    const url = new URL(value.trim());
    if (
      url.hostname !== "drive.google.com" &&
      url.hostname !== "www.drive.google.com"
    )
      return { kind: "invalid" as const };
    if (url.pathname.includes("/folders/")) return { kind: "folder" as const };
    const match =
      url.pathname.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
      url.pathname.match(
        /\/uc(?:\?|\/)(?:export=download&)?id=([a-zA-Z0-9_-]+)/,
      );
    const id = match?.[1] ?? url.searchParams.get("id");
    return id
      ? {
          kind: "file" as const,
          id,
          previewUrl: `https://drive.google.com/file/d/${id}/preview`,
        }
      : { kind: "invalid" as const };
  } catch {
    return { kind: "invalid" as const };
  }
}
