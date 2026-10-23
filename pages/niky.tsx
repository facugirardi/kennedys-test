import TeamMemberProfile from "@/components/custom/TeamMemberProfile";
import { getTeamMemberBySlug } from "@/lib/data/team";

const member = getTeamMemberBySlug("niky")!;

export default function NikyPage() {
  return <TeamMemberProfile member={member} />;
}
