import { redirect } from "next/navigation";

type MasterPageProps = {
  params: Promise<{ id: string }>;
};

export default async function MasterPage({ params }: MasterPageProps) {
  const { id } = await params;
  redirect(`/index/${id}`);
}
