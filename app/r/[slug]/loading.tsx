import { ListingDetailSkeleton } from "@/components/listing/local-listing"
import { PageContainer } from "@/components/shell/page-container"

export default function Loading() {
  return (
    <PageContainer>
      <ListingDetailSkeleton />
    </PageContainer>
  )
}
