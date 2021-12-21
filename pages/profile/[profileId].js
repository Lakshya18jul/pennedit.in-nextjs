import Profile from "../../components/Profile";
import { useRouter } from "next/router";

function ProfilePage() {
  const router = useRouter();
  const { profileId } = router.query;

  return <Profile profileId={profileId} />;
}

export default ProfilePage;
