import { redirect } from "next/navigation";

export default async function NewMasterPage() {
  redirect("/teachers/new");
}
