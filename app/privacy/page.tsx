import type { Metadata } from "next"

import { CONTACT_EMAIL, LegalPage, LegalSection, OPERATOR, UPDATED } from "@/components/legal/legal-page"

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "What Ai Recipy collects, why, who it's shared with, and your choices.",
}

const mail = <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy policy"
      updated={UPDATED}
      intro={
        <p>
          Ai Recipy (airecipy.com) is a place to share and discover the recipes behind AI-made videos, images and
          websites. It&apos;s run by {OPERATOR} (&quot;we&quot;, &quot;us&quot;). This policy explains, in plain
          words, what we collect, why, who it&apos;s shared with, and the choices you have.
        </p>
      }
    >
      <LegalSection n={1} title="The short version">
        <ul>
          <li>We collect what we need to run your account and show your posts, and nothing more.</li>
          <li>We don&apos;t sell your data, and we don&apos;t show ads.</li>
          <li>Your likes, saves and unlocks are private, except that a creator is told when you like, save or unlock their post.</li>
          <li>You can ask us to see, fix or delete your data at any time: {mail}.</li>
        </ul>
      </LegalSection>

      <LegalSection n={2} title="What we collect">
        <p>
          <strong>Your account.</strong> When you sign up with Google, Google shares your name, email address and
          profile picture with us. When you sign up with email, we get your email address. You then choose a
          username. We use your email to sign you in and to contact you about your account.
        </p>
        <p>
          <strong>Your profile.</strong> Your username, and anything you add: display name, bio and profile photo.
          Your profile is public.
        </p>
        <p>
          <strong>What you post.</strong> Videos, images, website links and screenshots, titles, descriptions, tags
          and the recipe itself (prompts, PDFs, the AI model, reference images, edit steps and failed takes). The
          post and a short preview of its recipe are public; the full recipe is shown to the people who unlock it.
        </p>
        <p>
          <strong>Proof links.</strong> The share link from your AI tool that shows your work is AI-made. It&apos;s
          kept private: only you, our team and people who unlock the recipe can see it.
        </p>
        <p>
          <strong>Your activity.</strong> What you like, save and unlock, and the notifications you receive.
        </p>
        <p>
          <strong>Visits.</strong> While you&apos;re signed in, we record when you last had the site open and which
          days you visited. We use this to count how many people are using Ai Recipy and to show a &quot;welcome
          back&quot; message. It&apos;s never shown publicly.
        </p>
        <p>
          <strong>Your device.</strong> Your browser keeps a few settings on your device (for example your theme,
          drafts and which messages you&apos;ve seen). We use sign-in cookies to keep you signed in. We don&apos;t
          use advertising or tracking cookies.
        </p>
      </LegalSection>

      <LegalSection n={3} title="How we use it">
        <ul>
          <li>To run your account and sign you in.</li>
          <li>To show your posts, profile and recipes, and to let you like, save and unlock recipes.</li>
          <li>To send you notifications about activity on your posts.</li>
          <li>To check uploads are AI-made and to verify creators&apos; proof links.</li>
          <li>To keep Ai Recipy safe, fix problems, and understand how it&apos;s used so we can improve it.</li>
        </ul>
        <p>We don&apos;t use your data for advertising, and we don&apos;t sell or rent it to anyone.</p>
      </LegalSection>

      <LegalSection n={4} title="Google user data">
        <p>
          This section explains exactly how Ai Recipy accesses, uses, stores and shares data from your Google account
          when you choose &quot;Continue with Google&quot;.
        </p>
        <p>
          <strong>What we access.</strong> Only your basic Google profile: your name, your email address and your
          profile picture, through Google&apos;s standard sign-in permissions (&quot;openid&quot;, &quot;email&quot; and
          &quot;profile&quot;). We don&apos;t access your Gmail, contacts, Drive, calendar, YouTube or any other
          Google data, and we never see your Google password.
        </p>
        <p>
          <strong>How we use it.</strong> Only to create your Ai Recipy account, sign you in, recognise you when you
          come back, and contact you about your account. Your email is never shown to other users. Your Google name
          and photo aren&apos;t shown publicly: your public profile shows the username and photo you choose.
        </p>
        <p>
          <strong>How we store it.</strong> It&apos;s stored with your account in our sign-in and database provider,
          Supabase, on servers in the EU (Sweden), protected by access rules and encrypted connections.
        </p>
        <p>
          <strong>Who we share it with.</strong> No one, except the service providers listed below that run Ai Recipy
          for us. We don&apos;t sell Google user data, use it for advertising, or use it to train AI models.
        </p>
        <p>
          <strong>Keeping and deleting it.</strong> We keep it while your account is open. To delete it, email{" "}
          {mail} and we&apos;ll delete your account and your Google data within 30 days. You can also remove Ai
          Recipy&apos;s access at any time from your Google account at{" "}
          <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer">
            myaccount.google.com/permissions
          </a>
          .
        </p>
        <p>
          Ai Recipy&apos;s use and transfer of information received from Google APIs adheres to the{" "}
          <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer">
            Google API Services User Data Policy
          </a>
          , including the Limited Use requirements.
        </p>
      </LegalSection>

      <LegalSection n={5} title="What other people can see">
        <ul>
          <li>Anyone can see your public profile and your posts.</li>
          <li>People who unlock your recipe see the full recipe and your proof link.</li>
          <li>When you like, save or unlock someone&apos;s post, they get a notification with your username.</li>
          <li>Your email address is never shown to other users.</li>
        </ul>
      </LegalSection>

      <LegalSection n={6} title="Who we share it with">
        <p>We use a few trusted services to run Ai Recipy. They process data for us, not for themselves:</p>
        <ul>
          <li>
            <strong>Supabase</strong>: our database, sign-in and file storage (data is stored in the EU, in Sweden).
          </li>
          <li>
            <strong>Vercel</strong>: hosts the website.
          </li>
          <li>
            <strong>Google</strong>: &quot;Sign in with Google&quot;, if you use it.
          </li>
          <li>
            <strong>Microlink</strong>: takes the cover screenshot when you post a website (it receives the website
            link).
          </li>
        </ul>
        <p>
          We may also share information if the law requires it, to protect people&apos;s safety, or as part of
          selling or reorganising Ai Recipy (in which case this policy keeps applying to your data). If we ever add
          payments, the payment provider will handle your payment details, not us.
        </p>
      </LegalSection>

      <LegalSection n={7} title="How long we keep it">
        <p>
          We keep your data while your account is open. If you delete a post, it disappears for everyone except
          people who already unlocked its recipe, who keep access to what they unlocked. If you ask us to delete
          your account, we&apos;ll delete your profile, posts and activity within 30 days, apart from anything we
          must keep by law.
        </p>
      </LegalSection>

      <LegalSection n={8} title="Your choices and rights">
        <ul>
          <li>Edit your profile, and edit or delete your posts, at any time.</li>
          <li>Ask for a copy of your data, or ask us to correct or delete it.</li>
          <li>Disconnect Google from your account in your Google account settings.</li>
        </ul>
        <p>
          Email {mail} and we&apos;ll reply within 30 days. Depending on where you live (for example the EU, the UK
          or Nigeria), you may have further rights under data protection law, including the right to complain to
          your local data protection authority.
        </p>
      </LegalSection>

      <LegalSection n={9} title="Keeping it safe">
        <p>
          Your data is protected with access rules on every table, so people can only see what they&apos;re allowed
          to. Files you attach to a recipe get unguessable links that are only shared with people who unlock it. No
          system is perfectly secure, but we work to protect your information and will tell you if something goes
          wrong that affects you.
        </p>
      </LegalSection>

      <LegalSection n={10} title="Children">
        <p>
          Ai Recipy isn&apos;t for children. You must be at least 13 to use it, or older if the law where you live
          requires it. Posts marked as adult content are only for people aged 18 or over. If you think a child has
          given us their information, contact us and we&apos;ll delete it.
        </p>
      </LegalSection>

      <LegalSection n={11} title="Changes to this policy">
        <p>
          If we change this policy, we&apos;ll update the date at the top, and for important changes we&apos;ll let
          you know on the site.
        </p>
      </LegalSection>

      <LegalSection n={12} title="Contact">
        <p>
          Questions about your privacy? Email {OPERATOR} at {mail}.
        </p>
      </LegalSection>
    </LegalPage>
  )
}
