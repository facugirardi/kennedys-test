import React from 'react';
import { LegalClause, LegalList, LegalSection } from '@/components/legal/legalTypography';

export const COOKIES_SECTION_TITLES = [
  '1. Introduction',
  '2. Cookies definition',
  '3. Cookies used by this website',
  '4. Accept Cookies',
  '5. Disable Cookies',
  '6. User rights',
  '7. Contact - Controller Details',
];

export default function CookiesContent() {
  return (
    <>
      <LegalSection title="1. Introduction">
        <LegalClause id="1.1.">
          With this Cookies Policy (hereinafter &ldquo;Policy&rdquo;, &ldquo;Cookies Policy&rdquo;),
          our Company with the name &ldquo;KENNEDY&rsquo;S GROUP AND REAL ESTATE SINGLE MEMBER
          P.C.&rdquo; (hereinafter &ldquo;Company&rdquo;, &ldquo;we&rdquo;, &ldquo;Controller&rdquo;,
          &ldquo;KG&rdquo;, &ldquo;My Blossom&rdquo;), provides to its website users and visitors
          (hereinafter &ldquo;visitors&rdquo;, &ldquo;you&rdquo;, &ldquo;users&rdquo;) information
          regarding the use of digital trackers (hereinafter &ldquo;cookies&rdquo;) for this website.
          Specifically, we provide you with necessary information on cookies definition, the type of
          cookies installed in your browser, the period timed they are stored, the type of data they
          collect, the purpose and the recipients to whom this data may be transferred.
        </LegalClause>
        <LegalClause id="1.2.">
          Moreover, in this Policy, we inform you about the way to enable or disable cookies, depending
          on the type of cookies and the browser used, although a deactivation may degrade your online
          experience and may make some features of Website unavailable.
        </LegalClause>
        <LegalClause id="1.3.">
          We collect such data through cookies in order to help us improve the quality of the experience
          we offer to you during your navigation on our website.
        </LegalClause>
        <LegalClause id="1.4.">
          This Policy may be amended anytime and will always be updated and posted in our website. The
          most recent amendment of this Policy is always considered as valid. The webpage user, reading
          this policy, is aware of the above-mentioned processing, which is in accordance with the
          applicable law for personal data protection.
        </LegalClause>
      </LegalSection>

      <LegalSection title="2. Cookies definition">
        <LegalClause id="2.1.">
          Cookies are small digital text files, which are placed by the websites you visit and are sent
          by the web server to the browser of each user, in which they are stored, when the user visits
          the website. Cookies&apos; purpose is to send information to the server each time the user
          performs specific functions on the website (e.g. selecting another webpage in the website,
          selecting a specific product in the webpage, selecting personal settings etc.) and widely
          used to make websites work more effectively, as well as to provide information to the website
          owners.
        </LegalClause>
        <LegalClause id="2.2.">
          Cookies act as an identity of the website&apos;s user, each time the user browses on it. The
          way the user is identified by the server is simple. The browser used by the user and once the
          user has visited the website, sends the cookie to the websites&apos; support server (by sending
          unique identifiers to the user, for example ip address, id, unique device identifier etc.). In
          this way data collection is implemented for reasons of connection security (load balancing,
          bot identification etc.), for statistical reasons or/and for marketing reasons, thus achieving
          personalized information to each user. If you want to learn more about cookies, you can visit{' '}
          <a href="https://www.aboutcookies.org" className="text-[#B17520] underline" target="_blank" rel="noopener noreferrer">
            aboutcookies.org
          </a>{' '}
          or{' '}
          <a href="https://www.allaboutcookies.org" className="text-[#B17520] underline" target="_blank" rel="noopener noreferrer">
            allaboutcookies.org
          </a>
          .
        </LegalClause>
        <LegalClause id="2.3.">
          However, this information can only be stored in website&apos;s server (by storing digital
          trackers in each user&apos;s browser), if only each user approves it (providing electronic
          approval). Exemption constitutes the stored information by the necessary (essential) cookies,
          which are absolutely necessary, for website&apos;s operation, for security reasons or/and
          uninterrupted browsing by the user on the website.
        </LegalClause>
      </LegalSection>

      <LegalSection title="3. Cookies used by this website">
        <LegalClause id="3.1.">
          This website uses cookies and specifically the following cookies categories:
        </LegalClause>
        <div className="space-y-4">
          <div>
            <p className="font-haas text-base font-medium text-[#172338]">a. Necessary (essential) cookies</p>
            <p className="mt-2 font-haas text-base leading-relaxed text-[#506A70]">
              Necessary or essential cookies are used to support website&apos;s necessary operations and
              help make a website usable by enabling basic functions like page navigation and access to
              secure areas of the website. The website cannot function properly without these cookies.
            </p>
          </div>
          <div>
            <p className="font-haas text-base font-medium text-[#172338]">b. Statistic cookies</p>
            <p className="mt-2 font-haas text-base leading-relaxed text-[#506A70]">
              Statistic cookies help website owners to understand how visitors interact with the websites
              by collecting and reporting information to a usually anonymous base, in order to improve
              the website and the content provision that users seek.
            </p>
          </div>
          <div>
            <p className="font-haas text-base font-medium text-[#172338]">c. Marketing cookies</p>
            <p className="mt-2 font-haas text-base leading-relaxed text-[#506A70]">
              These cookies are intended to provide content that suits more to users and their interests.
              They collect users&apos; preferences, in order to send targeted advertising, limited
              advertising impressions or measuring the effectiveness of a specific advertising campaign.
            </p>
          </div>
          <div>
            <p className="font-haas text-base font-medium text-[#172338]">d. Preference cookies</p>
            <p className="mt-2 font-haas text-base leading-relaxed text-[#506A70]">
              Preference cookies enable a Website to remember information that changes the way the Website
              behaves or looks, like your preferred language or the region that you are in.
            </p>
          </div>
          <div>
            <p className="font-haas text-base font-medium text-[#172338]">e. Analysis Cookies</p>
            <p className="mt-2 font-haas text-base leading-relaxed text-[#506A70]">
              We use Google Analytics cookies to help us improve our Website by gathering information
              about how you use it.
            </p>
          </div>
        </div>
      </LegalSection>

      <LegalSection title="4. Accept Cookies">
        <LegalClause id="4.1.">
          By connecting to this site, you are aware of the relevant information message (pop-up window or
          banner) for the use of cookies in our website, in which you should choose the cookies category
          you wish to accept (apart from the necessary cookies). With the above acceptance, you
          explicitly provide your consent to use the specific cookies category, keeping a relevant
          electronic file of your choice by us.
        </LegalClause>
      </LegalSection>

      <LegalSection title="5. Disable Cookies">
        <LegalClause id="5.1.">
          The process of deleting or managing cookies is simple and corresponding to the browser, each
          user uses. Specifically, the process of deleting cookies regarding the most well-known
          browsers, is described in the following links:
        </LegalClause>
        <LegalList
          type="lower-alpha"
          items={[
            <a key="chrome" href="https://support.google.com/chrome/answer/95647" className="text-[#B17520] underline" target="_blank" rel="noopener noreferrer">Google Chrome</a>,
            <a key="firefox" href="https://support.mozilla.org/en-US/kb/clear-cookies-and-site-data-firefox" className="text-[#B17520] underline" target="_blank" rel="noopener noreferrer">Mozilla Firefox</a>,
            <a key="edge" href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" className="text-[#B17520] underline" target="_blank" rel="noopener noreferrer">Microsoft Edge</a>,
            <a key="safari" href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" className="text-[#B17520] underline" target="_blank" rel="noopener noreferrer">Safari Web Browser</a>,
          ]}
        />
        <LegalClause id="5.2.">
          Moreover, you can at any time change or withdraw your consent from the Cookies Policy on our
          Website.
        </LegalClause>
      </LegalSection>

      <LegalSection title="6. User rights">
        <LegalClause id="6.1.">
          In any case, you have the control of your personal data processing, preserving your rights
          (right of access, correction, deletion of data portability, objection, restriction of
          processing) as provided in the applicable legal framework on personal data protection,
          especially in General Data Protection Regulation (EU) 679/2016 (art. 13 GDPR) and in the
          Privacy Policy of our Company.
        </LegalClause>
      </LegalSection>

      <LegalSection title="7. Contact - Controller Details">
        <LegalClause id="7.1.">
          &ldquo;KENNEDY&rsquo;S GROUP AND REAL ESTATE SINGLE MEMBER P.C.&rdquo; Mykonos Argirena 84600,
          Greece. Phone:{' '}
          <a href="tel:+306955654507" className="text-[#B17520] underline">
            +30 695 565 4507
          </a>
          . E-mail:{' '}
          <a href="mailto:reservations@kennedysgroup.com" className="text-[#B17520] underline">
            reservations@kennedysgroup.com
          </a>
        </LegalClause>
      </LegalSection>
    </>
  );
}
