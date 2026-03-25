export function getRequiredString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export function getOptionalString(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();

  return value.length > 0 ? value : undefined;
}

export function getOptionalId(formData: FormData, key: string) {
  const value = getOptionalString(formData, key);

  if (!value || value === "none") {
    return undefined;
  }

  return value;
}

export function getTagList(formData: FormData, key: string) {
  const rawValue = getOptionalString(formData, key);

  if (!rawValue) {
    return [];
  }

  return rawValue
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}
