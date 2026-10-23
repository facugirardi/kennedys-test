import TeamMemberProfile from "@/components/custom/TeamMemberProfile";
import { getTeamMemberBySlug } from "@/lib/data/team";

const member = getTeamMemberBySlug("elpida")!;

export default function ElpidaPage() {
  return <TeamMemberProfile member={member} />;
}
