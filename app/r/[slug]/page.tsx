import type { Metadata } from "next"

import { ListingDetail } from "@/components/listing/listing-detail"
import { LocalListing } from "@/components/listing/local-listing"
import { PageContainer } from "@/components/shell/page-container"
import { getCreator, getCreatorListings, getListing } from "@/lib/data"

export async function generateMetadata(props: PageProps<"/r/[slug]">): Promise<Metadata> {
  const { slug } = await props.params
  const listing = await getListing(slug)
  return listing
    ? { title: listing.title, description: listing.description }
    : { title: "Recipe" }
}

export default async function ListingPage(props: PageProps<"/r/[slug]">) {
  const { slug } = await props.params
  const listing = await getListing(slug)
  const creator = listing && (await getCreator(listing.creatorId))
  const more = creator ? await getCreatorListings(creator.id, slug) : []

  return (
    <PageContainer>
      {listing && creator ? (
        <ListingDetail
          listing={listing}
          creator={creator}
          more={more}
        />
      ) : (
        <LocalListing slug={slug} />
      )}
    </PageContainer>
  )
}
