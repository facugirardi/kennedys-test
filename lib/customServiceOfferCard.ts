/** Mapea un custom service del payload de oferta al shape de ServiceOfferCard. */
export function mapCustomServiceForOfferCard(property: Record<string, unknown>) {
  const textBlocks = Array.isArray(property.contentBlocks)
    ? property.contentBlocks.filter(
        (b: { type?: string; content?: string }) =>
          b?.type === "text" &&
          typeof b.content === "string" &&
          b.content.replace(/<[^>]*>/g, "").trim()
      )
    : [];
  const combinedDescription = textBlocks
    .map((b: { content: string }) => b.content)
    .join("");

  const images = Array.isArray(property.images) ? property.images : [];

  return {
    ...property,
    id: property.customServiceId,
    images: images.map((url: string) => ({ urlImage: url })),
    name: property.name,
    title: property.name,
    grossRate: property.grossRate,
    finalPrice: property.grossRate,
    startDate: property.startDate,
    endDate: property.endDate,
    days: property.days,
    policies: property.policies,
    contentBlocks: property.contentBlocks,
    openText2: combinedDescription || property.openText2 || "",
  };
}
