import { ProfileForm } from "@/components/profile/ProfileForm";
import { prisma } from "@/lib/db/prisma";

const TEMP_USER_ID = "cltemp0000000000000000000";

export default async function ProfilePage() {
  let profileYaml: string | undefined;
  try {
    const user = await prisma.user.findUnique({
      where: { id: TEMP_USER_ID },
      select: { profileYaml: true },
    });
    profileYaml = user?.profileYaml ?? undefined;
  } catch {
    profileYaml = undefined;
  }

  return (
    <div className="px-6 py-8 space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-semibold text-white">Profile</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Your profile powers AI resume tailoring and cover letter generation.
        </p>
      </div>
      <ProfileForm initialYaml={profileYaml} />
    </div>
  );
}
