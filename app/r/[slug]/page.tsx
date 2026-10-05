import type { Metadata } from "next"

import { ListingDetail } from "@/components/listing/listing-detail"
import { LocalListing } from "@/components/listing/local-listing"
import { PageContainer } from "@/components/shell/page-container"
import { getCreator, getCreatorListings, getListing } from "@/lib/data"

export async function generateMetadata(props: PageProps<"/r/[slug]">): Promise<Metadata> {
  const { slug } = await props.params
  const listing = getListing(slug)
  return listing
    ? { title: listing.title, description: listing.description }
    : { title: "Recipe" }
}

export default async function ListingPage(props: PageProps<"/r/[slug]">) {
  const { slug } = await props.params
  const listing = getListing(slug)
  const creator = listing && getCreator(listing.creatorId)

  return (
    <PageContainer>
      {listing && creator ? (
        <ListingDetail
          listing={listing}
          creator={creator}
          more={getCreatorListings(creator.id, slug)}
        />
      ) : (
        <LocalListing slug={slug} />
      )}
    </PageContainer>
  )
}
