import type { GetServerSideProps } from "next";
import TeamMemberProfile from "@/components/custom/TeamMemberProfile";
import { getAboutContent } from "@/lib/api/content";
import {
  getTeamMemberBySlug,
  getTeamEmail,
  getTeamPhone,
  slugifyName,
  type TeamMember,
} from "@/lib/data/team";
import { resolveMediaUrl } from "@/lib/utils";
import { getPublicSiteOriginFromRequest } from "@/lib/seo/config";

type Props = { member: TeamMember; profilePath: string; siteOrigin: string };

function resolveTeamAvatarUrl(avatarUrl?: string | null): string {
  if (!avatarUrl) return "";
  return avatarUrl.startsWith("/images/") || avatarUrl.startsWith("http")
    ? avatarUrl
    : resolveMediaUrl(avatarUrl) || avatarUrl;
}

export default function TeamMemberPage({ member, profilePath, siteOrigin }: Props) {
  return <TeamMemberProfile member={member} profilePath={profilePath} siteOrigin={siteOrigin} />;
}

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const id = context.params?.id;
  if (!id || typeof id !== "string") {
    return { notFound: true };
  }
  const profilePath = `/about-us/team/${id}`;
  const siteOrigin = getPublicSiteOriginFromRequest(context.req);

  try {
    const res = await getAboutContent();
    const cmsTeam = Array.isArray(res?.data?.team) ? res.data.team : [];
    // Primary lookup: the pretty name-based slug used in the carousel links.
    // Fallback lookup: the raw id, in case an older link is still floating around.
    const cmsMember = cmsTeam.find(
      (m: any) => slugifyName(m.authorName || "") === id || String(m.id) === id
    );
    if (cmsMember) {
      const member: TeamMember = {
        slug: id,
        authorName: cmsMember.authorName || "",
        authorRole: cmsMember.authorRole || "",
        avatarUrl: resolveTeamAvatarUrl(cmsMember.avatarUrl),
        body: cmsMember.body || "",
        email: getTeamEmail(cmsMember) || undefined,
        phone: getTeamPhone(cmsMember) || undefined,
      };
      return { props: { member, profilePath, siteOrigin } };
    }
  } catch (err) {
    console.error("getServerSideProps about-us/team/[id]:", err);
  }

  // Not a CMS member (or the API call failed) — fall back to the hardcoded team.
  const fallbackMember = getTeamMemberBySlug(id);
  if (fallbackMember) {
    return { props: { member: fallbackMember, profilePath, siteOrigin } };
  }

  return { notFound: true };
};
