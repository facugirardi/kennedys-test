export type TeamMember = {
  slug: string;
  authorName: string;
  authorRole: string;
  avatarUrl: string;
  body: string;
  email?: string;
  phone?: string;
};

export const TEAM_MEMBERS: TeamMember[] = [
  {
    slug: "elpida",
    authorName: "Elpida",
    authorRole: "FOUNDER & CEO",
    avatarUrl: "/images/team1.png",
    body: "Elpida Kennedy, CEO of Kennedy's Group, is a holiday connoisseur, a globetrotter by habit and profession, and a travel designer by passion. For the past 20 years she has lived, worked, and studied in Monte Carlo, London, Miami, New York, and Mykonos, evolving and growing on a professional and personal basis each step of the way. Elpida has been part of top hospitality brands all over the globe, such as Hakkasan Group, Good Food Society, Nammos, Interni etc.",
  },
  {
    slug: "niky",
    authorName: "Niky",
    authorRole: "HEAD OF MARKETING & LIFESTYLE CONCIERGE",
    avatarUrl: "/images/team2.png",
    body: "Niki Armyrou, Head of Marketing & Lifestyle Concierge at Kennedy's Group, is a Sociology graduate from the University of the Aegean. Always perceiving the tourism industry from the traveller's point of view, Niki has been thriving in the hospitality business through various positions in 5* Luxury Resorts, Restaurants and Exclusive Villa Management agencies for the last 7 years.",
  },
  {
    slug: "olga",
    authorName: "Olga",
    authorRole: "SALES & PROPERTY MANAGER",
    avatarUrl: "/images/olgaImage.jpg",
    body: "Olga Michaloglou, Travel Designer at Kennedy's Group, holds a bachelor's degree in Business Administration, which she acquired before targeting her studies in a M.Sc in Management in Tourism & Hospitality. Olga has worked for several years in the hospitality industry on Mykonos island, as part of the Reservations Department of a Luxury Boutique Hotel.",
    email: "olga@kennedysgroup.com",
  },
];

export function getTeamMemberBySlug(slug: string): TeamMember | undefined {
  return TEAM_MEMBERS.find((m) => m.slug === slug);
}

// Unicode combining diacritical marks (U+0300–U+036F), built via character
// codes rather than a literal range to avoid any source-encoding ambiguity.
const DIACRITICS_REGEX = new RegExp(
  `[${String.fromCharCode(0x0300)}-${String.fromCharCode(0x036f)}]`,
  "g"
);

/** Turns "Olga Michaloglou" into "olga-michaloglou" for use in profile URLs. */
export function slugifyName(value: string): string {
  return value
    .normalize("NFD")
    .replace(DIACRITICS_REGEX, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// CMS-managed members (Content type "about_team") keep email/phone inside
// `extra` (no dedicated columns); the hardcoded fallback team has them as
// top-level fields. These helpers read either shape.
export function getTeamEmail(member: any): string {
  return member?.email || member?.extra?.email || "";
}

export function getTeamPhone(member: any): string {
  return member?.phone || member?.extra?.phone || "";
}
