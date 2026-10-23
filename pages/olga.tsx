import TeamMemberProfile from "@/components/custom/TeamMemberProfile";
import { getTeamMemberBySlug } from "@/lib/data/team";

const member = getTeamMemberBySlug("olga")!;

export default function OlgaPage() {
  return <TeamMemberProfile member={member} />;
}
