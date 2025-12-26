export const getPublicIdFromUrl = (url: string): string => {
  const parts = url.split("/");
  const filename = parts[parts.length - 1];
  const folderIndex = parts.findIndex(p => p === "upload") + 2;
  const folderPath = parts.slice(folderIndex, parts.length - 1).join("/");
  const nameWithoutExt = filename.split(".")[0];

  return `${folderPath}/${nameWithoutExt}`;
};