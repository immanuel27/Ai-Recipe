import type { Metadata } from "next"

import { EditPost } from "@/components/sell/edit-post"
import { PageContainer } from "@/components/shell/page-container"

export const metadata: Metadata = { title: "Edit post" }

export default async function EditPostPage(props: PageProps<"/r/[slug]/edit">) {
  const { slug } = await props.params
  return (
    <PageContainer>
      <EditPost slug={slug} />
    </PageContainer>
  )
}
