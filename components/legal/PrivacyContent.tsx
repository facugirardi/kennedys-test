import React from 'react';
import { LegalClause, LegalList, LegalSection } from '@/components/legal/legalTypography';

export const PRIVACY_SECTION_TITLES = [
  '1. Introduction',
  '2. Legislative framework',
  '3. Collected and Processed Personal Data and processing legality',
  '4. Processing of special categories Personal Data',
  "5. Minors' Personal Data",
  '6. Recipients of your Personal Data',
  '7. Personal Data international transfers',
  '8. Personal Data retention period',
  '9. Technical and Organizational measures',
  '10. Security - Data Breaches',
  '11. Cookies Collection',
  '12. Social Media Guidelines',
  '13. Data Subject rights and Exercising Data Subject rights',
  '14. Contact - Controller Details',
];

export default function PrivacyContent() {
  return (
    <>
      <LegalSection title="1. Introduction">
        <LegalClause id="1.1.">
          With the present Information policy regarding Personal Data processing for website visitors
          (hereinafter &ldquo;Policy&rdquo;, &ldquo;Privacy Policy&rdquo;), our Company with the name
          &ldquo;KENNEDY&rsquo;S GROUP AND REAL ESTATE SINGLE MEMBER P.C.&rdquo; (hereinafter
          &ldquo;Company&rdquo;, &ldquo;we&rdquo;, &ldquo;Controller&rdquo;, &ldquo;KG&rdquo;,
          &ldquo;My Blossom&rdquo;), respecting the privacy of its website users and visitors
          (hereinafter &ldquo;visitors&rdquo;, &ldquo;you&rdquo;, &ldquo;users&rdquo;) and vigilant
          to ensure personal data confidentiality and security, provides necessary information and
          notifies upon both personal data processing and your rights, being the subject of data
          processing.
        </LegalClause>
        <LegalClause id="1.2.">
          In order to be transparent regarding the way of collection, use and storage of personal
          data, the Company encourage website visitors, and anyone interested to read this Policy, so
          as to be aware of the following information.
        </LegalClause>
        <LegalClause id="1.3.">
          The Privacy Policy may be amended from time to time, whenever needed, without prior notice to
          you. The amendments will apply on the date they are published in this website. We encourage
          you to regularly review the Privacy Policy, as your continued use of our website implies
          that you have accepted such amendments.
        </LegalClause>
        <LegalClause id="1.4.">
          Website user, by reading this Policy, is informed for the below-mentioned processing, which
          is in agreement with the applicable personal data protection law, exclusively for the purposes
          mentioned and for all purposes compatible with them. If you do not agree with the use of your
          data according to Privacy Policy, please stop using our website.
        </LegalClause>
        <LegalClause id="1.5.">
          The &ldquo;KG website&rdquo; refers to KG&rsquo;s websites, our mobile, tablet and other
          smart applications, and all associated KG services.
        </LegalClause>
      </LegalSection>

      <LegalSection title="2. Legislative framework">
        <LegalClause id="2.1.">
          The processing of your personal data is governed by the relevant provisions of the applicable
          national legislation for personal data protection (law 2472/1997, law 4624/2019, law
          3471/2006, as they apply etc), European Union Directives and Regulations (in particular
          Personal Data Protection Regulation (EU) 2016/679 - GDPR, hereinafter &ldquo;GDPR&rdquo;),
          as well as relevant decisions, instructions and regulations of Hellenic Data Protection
          Authority (hereinafter &ldquo;HDPA&rdquo;) and is subjected to legal formalities and
          restrictions imposed.
        </LegalClause>
      </LegalSection>

      <LegalSection title="3. Collected and Processed Personal Data and processing legality">
        <LegalClause id="3.1.">
          Our Company informs you that, through its website, collects information about you
          contextually, only if you provide personal data, which are necessary for the beginning,
          maintenance and execution of transactional relations with the Company, existing or future,
          depending on the providing product or service and the current procedures and policies of our
          Company.
        </LegalClause>
        <LegalClause id="3.2.">
          In particular, according to the above-mentioned, our Company through its website, collects and
          processes the following personal data, with the following legal bases and for the following
          purposes:
        </LegalClause>
        <LegalList
          type="lower-alpha"
          items={[
            <>
              Your name, your e-mail address (e-mail) and all information that you provide in the
              &ldquo;contact&rdquo; field, when you fill the contact form in order to contact with the
              Company, for the purpose of communication, answering any queries, solving any issues and
              in general managing any issues arising, as necessary to pursue Company&apos;s legal
              interests, in the context of service and providing optimal services to you (art. 6 par.1
              per. f GDPR) or/and in the context of taking action upon your request, before and/or
              after the contract/agreement conclusion between us (art.6 par.1 per. f GDPR).
            </>,
            <>
              Your name, e-mail address (e-mail), and any other information you may provide in
              &ldquo;Newsletter&rdquo; field, in order to stay in touch with our Company, to receive
              from us promotional material, in order to be informed about the range of our services that
              may interest you and are provided through the website as necessary to pursue
              Company&apos;s legal interests, including our interests in providing innovative,
              personalized, secure and profitable services to our users and partners (art.6 par.1 per.f
              GDPR).
            </>,
            <>
              Your name, e-mail address, address, financial details, card details, phone number,
              mobile phone number, bank account, id, tax id and other proof of identification or
              verification in order to verify your identity, check-in and check-out dates when you make
              a booking from our website or by contacting us via e-mail and in order to process your
              booking as necessary to pursue Company&apos;s legal interest, in the context of service
              and providing optimal services to you (art. 6 par.1 per. f GDPR) or/and in the context of
              taking action upon your request, before and/or after the contract/agreement conclusion
              between us (art.6 par.1 per. b GDPR).
            </>,
            <>
              We receive your technical data such as Internet Protocol (IP) address, whenever you browse
              our website, as well as the way you use our website (q.v. Cookies Policy), navigation
              program you use, time zone and location, operating system and its version, the size of
              the screen, the name of the device and its manufacturer, the IMEI code of the device etc.
            </>,
          ]}
        />
        <LegalClause id="3.3.">
          Collection and processing of the above-mentioned personal data by the Company, is carried out
          only if you provide them to us, for purposes mentioned herein and for purposes compatible with
          them.
        </LegalClause>
        <LegalClause id="3.4.">
          In any case, our Company ensures that complies with the processing principles, according to
          the current legal framework for personal data protection, namely, the principle of legality,
          objectivity and transparency, the principle of purpose limitation, the principle of data
          minimization, the principle of accuracy, the principal of limitation of storage period and
          the principle of integrity and confidentiality (art.5 GDPR).
        </LegalClause>
        <LegalClause id="3.5.">
          Our website may contain links to third party websites or services, such as third-party
          integrations, co-branded services, or third party-branded services (&ldquo;Third Party
          Partners&rdquo;). The Company doesn&apos;t own or control these Third Party Partners and when
          you interact with them, you may be providing information directly to the Third Party Partner,
          or both. These Third Party Partners will have their own rules about the collection, use, and
          disclosure of information. We encourage you to review the privacy policies of the other
          websites you visit.
        </LegalClause>
        <LegalClause id="3.6.">
          Parts of the website use Google Maps/Earth services, including the Google Maps API(s). Use of
          Google Maps/Earth is subject to Google Maps/Earth Additional Terms of Use and the Google
          Privacy Policy.
        </LegalClause>
      </LegalSection>

      <LegalSection title="4. Processing of special categories Personal Data">
        <LegalClause id="4.1.">
          Our Company does not process, through its website, your sensitive personal data (special
          categories data), such as data related to your racial or ethnic origin, political views,
          religious and philosophical views or your participation in a trade union, genetic or
          biometric data for the purpose of identifying you as the subject of process, as well as health
          data or data related to your sexual life or your sexual orientation, given that all the above
          are not necessary for the fulfilment of the above purposes, applying the principal of
          minimization, necessity and proportionality.
        </LegalClause>
      </LegalSection>

      <LegalSection title="5. Minors' Personal Data">
        <LegalClause id="5.1.">
          For the purposes of this Policy, minors are considered as the people who haven&apos;t complete
          their eighteenth (18) year. Our Company does not process, through its website, minors&apos;
          personal data.
        </LegalClause>
        <LegalClause id="5.2.">
          It is pointed out, when personal data processing is based on consent according to art.6 par. 1
          f a) GDPR, in relation to service provision by information society directly to a child, the
          consent provided by the minor and consequently the processing is legal, if the minor is at
          least fifteen (15) years old. In case that the minor is under fifteen (15) years old, process
          is legal only if the consent is provided or approved by the person who has the parental care of
          the minor (q.v. art. 8 GDPR in combination with art. 21 law 4624/2019).
        </LegalClause>
        <LegalClause id="5.3.">
          If you are a parent or guardian and occurred to you that your minor child has provided his
          personal data to our Company, please contact us immediately. For our part, if we realize that
          personal data that we process belongs to a minor, without his parent or guardian consent, the
          Company takes necessary measures to immediate delete this data and to avoid such future
          incidents.
        </LegalClause>
      </LegalSection>

      <LegalSection title="6. Recipients of your Personal Data">
        <LegalClause id="6.1.">
          Our Company preserves the confidentiality of your personal data and, as a rule, does not
          transfer them to any third party (individual or legal), apart from where it is required or
          permitted by the law. Your personal data, on a case by case, is transferred to our
          Company&apos;s departments, whichever is in charge in any case. The employees authorized by
          the Company process them for the purposes of contractual and transactional relation and are
          committed with clauses of confidentiality, in order to ensure your data privacy.
        </LegalClause>
        <LegalClause id="6.2.">
          Contextually, the Company may transfer personal data to the competent supervisory, control,
          regulatory, independent, judicial, public or/and other authorities and bodies, in the context
          of fulfilling Company&apos;s legal obligations, when permitted by the law and required in
          order to comply with a legal obligation or to document, exercise, defend or refute legal
          claims.
        </LegalClause>
        <LegalClause id="6.3.">
          Furthermore, personal data may, in case by case, be transferred to third parties (individuals
          or legal), to whom our Company entrusts the execution of specific tasks such as managing of
          your accommodation, coordinating your stay or providing additional services, such as
          cleaning services, insurance or activities providers.
        </LegalClause>
        <LegalClause id="6.4.">
          Our Company may transfer your personal data within our corporate family of companies (both
          financial and non-financial entities) that are related by common ownership or control.
          Additionally, we share your information with our affiliates to support, integrate, promote,
          and improve the KG website and our affiliates&apos; services. Our affiliates include other
          Kennedy&apos;s Group companies.
        </LegalClause>
      </LegalSection>

      <LegalSection title="7. Personal Data international transfers">
        <LegalClause id="7.1.">
          Our Company does not generally transfer your personal data to third countries (outside EU or
          EEA) or international organizations that do not ensure an adequate level of protection (under
          Adequacy Decision etc.).
        </LegalClause>
        <LegalClause id="7.2.">
          In any case all transfers follow and comply with the relevant provisions of the applicable
          legal framework, especially art.44 GDPR.
        </LegalClause>
      </LegalSection>

      <LegalSection title="8. Personal Data retention period">
        <LegalClause id="8.1.">
          Personal data retention takes place for specific purposes and lasts for a reasonable period,
          in order to fulfil the respective purpose (process limitation).
        </LegalClause>
        <LegalClause id="8.2.">
          Your personal data are maintained by our Company in printed or/and electronic form, during
          your contractual relation with the Company and individual contractual commitments of the
          latter, depending on its nature, taking into consideration Company&apos;s legal obligations
          and any legal claims that may be raised by it, in order to justify the retention period of
          personal data.
        </LegalClause>
        <LegalClause id="8.3.">
          Additionally, contextually, received and processed data during the pre-contractual stage (e.g.,
          when sending a message of interest etc.), are kept for five (5) years, under the reservation of
          applicable law, to extend its time.
        </LegalClause>
        <LegalClause id="8.4.">
          The Company sets as a maximum retention period of personal data, the twenty (20) years with
          the possibility of extension, in case of a claim or pending litigation or indication of
          control by public (tax, etc.) authorities.
        </LegalClause>
        <LegalClause id="8.5.">
          In cases that personal data processing is based on the consent provided, data is kept by the
          Company for as long as provided by the law, depending on the purpose and processing type,
          including Company&apos;s legal obligation for this retention.
        </LegalClause>
      </LegalSection>

      <LegalSection title="9. Technical and Organizational measures">
        <LegalClause id="9.1.">
          Our Company takes the appropriate technical and organizational measures to safeguard the
          technological and physical security, according to the applicable law (art. 32 GDPR).
        </LegalClause>
      </LegalSection>

      <LegalSection title="10. Security - Data Breaches">
        <LegalClause id="10.1.">
          The Company shows, as far as possible, diligence in order to continuously implementing and
          updating administrative, technical, and physical security measures to help protect your
          information against unauthorized access, loss, destruction, or alteration and ensure the
          integrity, confidentiality and availability of personal data. Thus, it remains prepared in
          order to validly and timely deal with a possible personal data breach. For this reason, it
          draws up, adopts, updates and applies appropriate internal procedures, in accordance with best
          practices and international standards.
        </LegalClause>
      </LegalSection>

      <LegalSection title="11. Cookies Collection">
        <LegalClause id="11.1.">
          For the proper functioning of our website, cookies are used, in order to make or facilitate
          communication transfer between us, through the electronic communication network. For further
          information about cookies, you may refer to our Company&apos;s Cookies Policy, which is posted
          in our website.
        </LegalClause>
      </LegalSection>

      <LegalSection title="12. Social Media Guidelines">
        <LegalClause id="12.1.">
          Our Company ensures its presence in social media Facebook, Instagram, LinkedIn, YouTube,
          Pinterest, Twitter. In combination with our Policy, the Company provides to its website users
          the necessary information about personal data processing, through social media.
        </LegalClause>
        <LegalClause id="12.2.">
          Thus, through social media, our Company often gives you the opportunity to submit comments,
          send messages, be informed about our news etc. In all above-mentioned cases, regarding personal
          data processing, Controllers are both our Company and the respective responsible person of
          social media platform (Facebook, Instagram, etc.) according to art. 26 GDPR. So, it is not
          always possible to have full knowledge about data type that operators of each platform
          process, but we still make effort, take care of our social media pages configuration and act
          according to the possibilities we have from operators, in order to ensure personal data
          processing, according to the applicable legal framework. When you interact with us through
          social media, the purpose of processing your personal data is, in particular, your support
          (where the possibility exists, e.g., contact us through sending message or comment). If you
          contact us through the above-mentioned ways, legal basis of processing is the legal interest
          of our Company, in the context of your service and requests, issues or concerns resolution
          (art.6 par1 per.f GDPR).
        </LegalClause>
        <LegalClause id="12.3.">
          If you wish to receive more information about personal data processing from social media
          platforms operators and to be further informed, you may refer to the privacy policies of:
        </LegalClause>
        <LegalList
          type="lower-alpha"
          items={['Facebook', 'Instagram', 'Twitter', 'LinkedIn', 'YouTube', 'Pinterest']}
        />
      </LegalSection>

      <LegalSection title="13. Data Subject rights and Exercising Data Subject rights">
        <LegalClause id="13.1.">
          As data subjects, you retain all your rights, as provided by the legal framework on data
          protection, namely:
        </LegalClause>
        <LegalList
          type="lower-alpha"
          items={[
            <>
              The right to transparent information for the exercise of your rights (art.12,13,14 GDPR),
              before and during the processing, i.e., the right to be informed about personal data
              processing (as detailed in this Policy).
            </>,
            <>
              Right of access (art.15 GDPR) to your personal data processed by the Company, as a
              Controller, i.e., the ability to know and to receive a copy of the data concerning you.
            </>,
            <>
              The right to correct inaccurate data and to complete incomplete data (art. 16 GDPR), i.e.,
              the right to correct your data and information, retained by our Company.
            </>,
            <>
              The right to delete personal data / &ldquo;the right to be forgotten&rdquo; (art. 17
              GDPR). This right is under conditions and obligations and Company&apos;s legal claims, in
              order to retain data, according to the provisions of applicable law.
            </>,
            <>
              The right to personal data portability (art. 20 GDPR).
            </>,
            <>
              The right to object to personal data processing (art. 21 GDPR).
            </>,
            <>
              The right to withdraw the already given consent (art. 7 par. 3 GDPR).
            </>,
          ]}
        />
        <LegalClause id="13.2.">
          Any request regarding your personal data and your rights exercise, according to the provisions
          of the applicable legal framework for personal data protection, should be addressed in written
          to:{' '}
          <a href="mailto:reservations@kennedysgroup.com" className="text-[#B17520] underline">
            reservations@kennedysgroup.com
          </a>
          . Moreover, you may also send a letter to our postal address or submit a request by yourself,
          in our Company address.
        </LegalClause>
        <LegalClause id="13.3.">
          Our Company binds to make every effort, in order to take the required actions, within a period
          of thirty (30) days from the receipt of each request, unless the work, regarding its
          fulfillment, is characterized by particularities or/and complications, under which the Company
          has the right to extend the time for completion of operations, for an additional sixty (60)
          days. Certainly, in this case, the subject will be informed for the above-mentioned extension,
          within thirty (30) days.
        </LegalClause>
        <LegalClause id="13.4.">
          In case our answer does not satisfy you, you have the right to file a complaint to the
          competent national supervisory authority, the Hellenic Data Protection Authority (Kifisias Av.
          1-3, 11523, Athens, phone: 210 6475600,{' '}
          <a href="https://www.dpa.gr" className="text-[#B17520] underline" target="_blank" rel="noopener noreferrer">
            www.dpa.gr
          </a>
          ).
        </LegalClause>
      </LegalSection>

      <LegalSection title="14. Contact - Controller Details">
        <LegalClause id="14.1.">
          &ldquo;KENNEDY&rsquo;S GROUP AND REAL ESTATE SINGLE MEMBER P.C.&rdquo; Mykonos Argirena
          84600, Greece. E-mail:{' '}
          <a href="mailto:reservations@kennedysgroup.com" className="text-[#B17520] underline">
            reservations@kennedysgroup.com
          </a>
        </LegalClause>
      </LegalSection>
    </>
  );
}
