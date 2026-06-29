import ProfileClient from "./ProfileClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Profile | Barn",
  description: "View and manage your account profile.",
};

export default function ProfilePage() {
  return <ProfileClient />;
}
