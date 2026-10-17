import type { Metadata } from "next"

import { CONTACT_EMAIL, LegalPage, LegalSection, OPERATOR, UPDATED } from "@/components/legal/legal-page"

export const metadata: Metadata = {
  title: "Terms of use",
  description: "The rules for using Ai Recipy: your account, what you post, and what you can do with recipes.",
}

const mail = <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of use"
      updated={UPDATED}
      intro={
        <p>
          These terms are the rules for using Ai Recipy (airecipy.com), run by {OPERATOR} (&quot;we&quot;,
          &quot;us&quot;). By creating an account or using the site, you agree to them. We&apos;ve kept them as plain
          as we can.
        </p>
      }
    >
      <LegalSection n={1} title="What Ai Recipy is">
        <p>
          Ai Recipy lets creators share the &quot;recipe&quot; behind their AI-made videos, images and websites (the
          prompts, the AI model, reference files, edit steps and failed takes) and lets everyone discover and unlock
          those recipes. Recipes are currently free to unlock.
        </p>
      </LegalSection>

      <LegalSection n={2} title="Your account">
        <ul>
          <li>You must be at least 13, or older if the law where you live requires it. Adult content is only for people aged 18 or over.</li>
          <li>Give accurate information, keep your sign-in secure, and don&apos;t use someone else&apos;s account.</li>
          <li>Choose a username that doesn&apos;t pretend to be someone else or a brand you don&apos;t represent.</li>
          <li>You&apos;re responsible for what happens on your account.</li>
        </ul>
      </LegalSection>

      <LegalSection n={3} title="Posting your work">
        <ul>
          <li>
            <strong>It must be made with AI, by you.</strong> Only post work you made yourself with AI tools, and a
            recipe that honestly describes how you made it.
          </li>
          <li>
            <strong>Proof.</strong> We check uploads for AI content credentials. If a file doesn&apos;t have them, you
            must add a share link from your AI tool. Don&apos;t submit someone else&apos;s link.
          </li>
          <li>
            <strong>You need the rights.</strong> Only post what you have the right to share, including any reference
            images, music or footage you used.
          </li>
          <li>
            <strong>Verified badge.</strong> We may mark posts as Verified after checking the proof link. It means we
            checked the link, not that we guarantee the post.
          </li>
          <li>
            <strong>Label adult content.</strong> Mark anything with nudity or adult themes as adult content.
          </li>
        </ul>
      </LegalSection>

      <LegalSection n={4} title="What's not allowed">
        <ul>
          <li>Anything illegal, or that helps someone break the law.</li>
          <li>Sexual content involving anyone under 18, or that looks like it does. We report this to the authorities.</li>
          <li>Sexual or intimate images of a real person without their consent, including AI-made ones.</li>
          <li>Deepfakes meant to deceive people, or that put words or actions in a real person&apos;s mouth to harm or mislead.</li>
          <li>Harassment, hate, threats, or content that encourages violence or self-harm.</li>
          <li>Copying other people&apos;s work or recipes and passing them off as your own.</li>
          <li>Spam, scams, malware, or links that trick people.</li>
          <li>Trying to break, overload, scrape or get around the protections of Ai Recipy.</li>
        </ul>
        <p>We can remove content or suspend accounts that break these rules.</p>
      </LegalSection>

      <LegalSection n={5} title="Who owns what">
        <p>
          <strong>You keep ownership of what you post.</strong> By posting, you give us a worldwide, free licence to
          host, store, display, resize and share your posts and recipes on Ai Recipy and in promoting Ai Recipy (for
          example, showing your post on our social media with credit to you). This licence ends when you delete the
          post, except for people who already unlocked its recipe, and copies we can&apos;t reasonably remove.
        </p>
        <p>
          <strong>Using recipes you unlock.</strong> When you unlock a recipe, you may use it to make your own work,
          including commercial work. That&apos;s the point: steal the recipe, make it your own. You may not
          republish, resell or share the recipe itself (its prompts, files and notes) as a recipe, or claim the
          creator&apos;s original post as yours.
        </p>
        <p>
          Ai Recipy&apos;s name, logo and design belong to us. AI tools named on the site belong to their owners, and
          we&apos;re not affiliated with them.
        </p>
      </LegalSection>

      <LegalSection n={6} title="Copyright complaints">
        <p>
          If you believe something on Ai Recipy infringes your copyright or uses your likeness without permission,
          email {mail} with a link to it, what you own, and how to contact you. We&apos;ll review it and remove it if
          appropriate. We close the accounts of people who repeatedly infringe.
        </p>
      </LegalSection>

      <LegalSection n={7} title="Payments">
        <p>
          Recipes are free for now. If we introduce paid recipes, we&apos;ll update these terms first, including the
          platform fee and how creators are paid, and nobody will be charged without clearly agreeing to it.
        </p>
      </LegalSection>

      <LegalSection n={8} title="Third-party tools and links">
        <p>
          Recipes mention and link to AI tools and websites we don&apos;t control. Your use of them is covered by
          their own terms. Results from AI tools vary, so following a recipe won&apos;t always give the same result.
        </p>
      </LegalSection>

      <LegalSection n={9} title="Ending your account">
        <p>
          You can stop using Ai Recipy at any time and ask us to delete your account by emailing {mail}. We may
          suspend or close an account that breaks these terms or puts others at risk. Where it&apos;s reasonable,
          we&apos;ll tell you why.
        </p>
      </LegalSection>

      <LegalSection n={10} title="No guarantees">
        <p>
          Ai Recipy is provided &quot;as is&quot;. We work hard to keep it running and safe, but we can&apos;t promise
          it will always be available or error-free, or that every post and recipe is accurate. Creators are
          responsible for their own posts.
        </p>
      </LegalSection>

      <LegalSection n={11} title="Limits on our liability">
        <p>
          As far as the law allows, we&apos;re not liable for indirect or unexpected losses (such as lost profits or
          data) from using Ai Recipy, and our total liability to you is limited to the amount you&apos;ve paid us in
          the 12 months before the claim (which, while recipes are free, is nothing). Nothing in these terms limits
          rights you have by law that can&apos;t be limited.
        </p>
      </LegalSection>

      <LegalSection n={12} title="Changes to these terms">
        <p>
          We may update these terms as Ai Recipy grows. We&apos;ll change the date at the top, and for important
          changes we&apos;ll tell you on the site before they apply. If you keep using Ai Recipy after that, you
          accept the new terms.
        </p>
      </LegalSection>

      <LegalSection n={13} title="Contact">
        <p>
          Questions about these terms? Email {OPERATOR} at {mail}.
        </p>
      </LegalSection>
    </LegalPage>
  )
}
