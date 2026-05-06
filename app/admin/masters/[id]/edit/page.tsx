import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditMasterPage({ params }: PageProps) {
  const { id } = await params;
  redirect(`/index/${id}/edit`);
}
