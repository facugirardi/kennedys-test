import { fetchAPI } from "./fetcher";

export async function getReviews(params = {}) {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.append("page", params.page);
  if (params.pageSize) searchParams.append("pageSize", params.pageSize);
  if (typeof params.published === "boolean") {
    searchParams.append("published", params.published);
  }
  const suffix = searchParams.toString() ? `?${searchParams.toString()}` : "";
  return fetchAPI(`/content/reviews${suffix}`);
}

export async function getAboutContent() {
  return fetchAPI(`/content/about`);
}
