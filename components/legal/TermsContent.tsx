import React from 'react';
import { LegalClause, LegalList, LegalSection } from '@/components/legal/legalTypography';

export const TERMS_SECTION_TITLES = [
  '1. Introduction',
  '2. Content – Intellectual Property Rights',
  '3. Links',
  '4. Conduct',
  '5. Limitation of liability – No Warranties',
  '6. Indemnification',
  '7. Additional Rules and Conditions',
  '8. Applicable Law',
  '9. Miscellaneous',
  '10. Contact – Controller Details',
];

export default function TermsContent() {
  return (
    <>
      <LegalSection title="1. Introduction">
        <LegalClause id="1.1.">
          Welcome to{' '}
          <a href="https://www.kennedysgroup.com" className="text-[#B17520] underline">
            www.kennedysgroup.com
          </a>{' '}
          (hereinafter &ldquo;Website&rdquo;), a website owned by the Single Member Private Company
          incorporated under the laws of Greece with the name &ldquo;KENNEDY&rsquo;S GROUP AND REAL
          ESTATE SINGLE MEMBER P.C.&rdquo; (hereinafter &ldquo;Company&rdquo;, &ldquo;we&rdquo;,
          &ldquo;KG&rdquo;, &ldquo;My Blossom&rdquo;), established on 14.04.2021 with registration
          no 159000638000 at General Commercial Registry and has its seat at Mykonos Island, Cyclades,
          Greece, with TIN 801552482. Your use of the Website is accompanied by the following general
          Terms of Use (hereinafter &ldquo;Terms of Use&rdquo;).
        </LegalClause>
        <LegalClause id="1.2.">
          The Terms of Use, the Privacy Policy and the Cookies Policy of our Website constitute a
          legally binding agreement governing any transaction between the Company and you.
        </LegalClause>
        <LegalClause id="1.3.">
          Before you continue the navigation in the Website, you are kindly requested to carefully read
          these Terms of Use, as well as the Privacy Policy and the Cookies Policy.
        </LegalClause>
        <LegalClause id="1.4.">
          By using the Website, you unconditionally declare that you understand and agree with the Terms
          of Use. In case you disagree with their content, in whole or in part, please do not use the
          Website and the services provided through it.
        </LegalClause>
        <LegalClause id="1.5.">
          The Terms of Use may be amended from time to time and at a frequency without prior notice.
          You are kindly requested to review them regularly, since the use of the Website shall be
          deemed as your consent to the Terms of Use, as applicable and in force from time to time.
        </LegalClause>
        <LegalClause id="1.6.">
          My Blossom reserves the right to, without notice and for any reason, modify or remove content
          from the Website, suspend or terminate the operation of the Website and deny access to any
          user to all or part of the Website.
        </LegalClause>
      </LegalSection>

      <LegalSection title="2. Content – Intellectual Property Rights">
        <LegalClause id="2.1.">
          All the content (text, photographs, videos, graphic designs, designs, trademarks, logos,
          sounds, artwork, computer code, structure, look &amp; feel etc) used in this website is either
          created or legally obtained by KG. This content includes intellectual property rights
          (industrial rights and copyright), which are owned by the Company and are protected by the
          Greek Law, EU law and international treaties and agreements.
        </LegalClause>
        <LegalClause id="2.2.">
          Download and reproduction of this content for non-commercial purposes only (personal use) is
          allowed if there is a clear reference to the source of the content. You may not reproduce,
          republish, post, publicly display, transmit or distribute any content of the Website unless
          expressly permitted in these Terms of Use or elsewhere on the Website.
        </LegalClause>
        <LegalClause id="2.3.">
          You unconditionally acknowledge that you do not have any right to use, copy, extract,
          re-utilise, sell, resell, distribute, download, upload and/or commercially exploit, present to
          the public in any way any content or parts of the content of the Website for any reason,
          unless you have our prior written consent or the consent of our Company.
        </LegalClause>
      </LegalSection>

      <LegalSection title="3. Links">
        <LegalClause id="3.1.">
          The Website may have links towards other websites or social media accounts in our website or
          blog, which are owned and administrated by other parties. KG is not responsible for the
          content of those websites, which may be regulated by other general terms of use and policies.
        </LegalClause>
      </LegalSection>

      <LegalSection title="4. Conduct">
        <LegalClause id="4.1.">
          Users of the Website are expected to act in conformity with the Law, the Terms of Use, the
          Privacy Policy and the Cookies Policy and to refrain from actions that may cause damage to
          third parties or disrupt the work of the Website or breach the applicable intellectual
          property laws.
        </LegalClause>
        <LegalClause id="4.2.">
          By using the Website, you declare that you are an adult (over 18 years of age), legally
          competent and the real user of the Website. By sharing any data of yours or third
          parties&rsquo; within the Website (e.g. sending a message via the contact form) you declare
          to the Company that you are entitled to share such personal data (e.g. the information you
          share refers to you, or to third parties on behalf of which you act). You are exclusively
          liable for the content of the information you provide and their accuracy. You should refrain
          from sharing inaccurate, misleading, illegal, offensive or otherwise harmful content and
          information.
        </LegalClause>
        <LegalClause id="4.3.">You also agree not to:</LegalClause>
        <LegalList
          type="lower-roman"
          items={[
            'make any false, speculative or fraudulent inquiry, request or reservation;',
            'access, monitor or copy any content or information of this Website using any deep-link, page-scrape, robot, spider or other automatic device, program, algorithm or any similar process;',
            'take any action that imposes, or may impose an unreasonable or disproportionately large load on our infrastructure;',
            'use any device, software or routine to interfere with the proper working of the Website, any transaction being conducted on the Website or any other person’s use of the Website; or',
            'attempt to gain unauthorized access to the Website or any systems or networks connected to the Website by hacking or any other illegitimate means.',
          ]}
        />
        <LegalClause id="4.4.">
          You may not use the Website or any content for any purpose that is unlawful or prohibited by
          the Terms of Use or that infringes the rights of My Blossom or others.
        </LegalClause>
        <LegalClause id="4.5.">
          Apart from your personal information (which is addressed in our Privacy Policy), any
          communications or materials you send to the Website, including data, questions, comments,
          suggestions or submissions (hereinafter &ldquo;Submissions&rdquo;), are and will be treated
          as non-confidential and nonproprietary. KG may use the aforementioned for any purpose,
          including reproduction, transmission, disclosure, publication, broadcast, and posting. By
          making a Submission to the Site, you irrevocably transfer and assign to KG copyrights or other
          rights that you may have in such material, and you waive any right to compensation.
        </LegalClause>
      </LegalSection>

      <LegalSection title="5. Limitation of liability – No Warranties">
        <LegalClause id="5.1.">
          While Kennedy&rsquo;s Group uses reasonable efforts to include accurate and up-to-date
          information on the Website, KG makes no warranties or representations as to its accuracy. The
          properties, information, products and services published on this site may include
          inaccuracies or errors, including pricing errors. Kennedy&rsquo;s Group does not guarantee
          the accuracy of them and disclaims all liability for any errors or other inaccuracies
          relating to the information and description of the villas and other travel products displayed
          on this site (including indicatively and without limitation, the pricing, photographs, list of
          amenities and general product descriptions), much of which information is provided by the
          respective suppliers, landlords etc. In addition, My Blossom expressly reserves the right to
          correct any pricing errors on the site and/or on pending reservations made under an incorrect
          price. The property owners and other suppliers providing travel or other services in
          connection with the site are independent contractors and not agents or employees of My
          Blossom. KG and its affiliates are not liable for the acts, errors, omissions,
          representations, warranties, breaches or negligence of any such suppliers or for any personal
          injuries, death, property damage, or other damages or expenses resulting therefrom. By
          offering travel products and services located in particular destinations, My Blossom does not
          represent or warrant that travel to such points is advisable or without risk, and is not
          liable for damages or losses that may result from travel to such destinations.
        </LegalClause>
        <LegalClause id="5.2.">
          The information and services provided or referenced on the site are provided &ldquo;as
          is&rdquo; and with all faults, and the entire risk as to satisfactory quality, performance,
          accuracy and effort is with the user. In no event shall My Blossom, its affiliates and/or
          their respective suppliers be liable for any direct, indirect, punitive, incidental, special
          or consequential damages arising out of or in any way connected with the use of or access to
          the Website or the delay or inability to use the Website, or for any viruses, information,
          software, linked sites, products and services obtained through the site, or otherwise arising
          out of the use of the Website, whether based on contract, tort, negligence, strict liability,
          or otherwise, even if My Blossom, its affiliates or any of their respective suppliers has
          been advised of the possibility of damages.
        </LegalClause>
        <LegalClause id="5.3.">
          If, despite the limitation above, Kennedy&rsquo;s Group, its affiliates or their respective
          suppliers are found liable for any loss or damage which arises out of or in any way connected
          with any of the occurrences described above, then My Blossom, its affiliates or their
          respective suppliers liabilities will in no event exceed the greater of the total related
          rental revenue paid by you at the time of the occurrence or EUR 300.00.
        </LegalClause>
      </LegalSection>

      <LegalSection title="6. Indemnification">
        <LegalClause id="6.1.">
          You agree to defend, indemnify and hold harmless KG and its affiliates and their respective
          directors, officers, employees and agents from and against all demands, losses, liability,
          claims or expenses, including attorneys&rsquo; fees, made against My Blossom by any third
          party due to or arising out of or in connection with your use of the Website.
        </LegalClause>
      </LegalSection>

      <LegalSection title="7. Additional Rules and Conditions">
        <LegalClause id="7.1.">
          Separate terms and conditions, including your cancellation rights, if any, will apply to your
          reservation and purchase of travel-related goods and services that you select. Please read
          these separate terms and conditions carefully. Any violation of these additional terms and
          conditions may result in cancellation of your reservation(s) or in your forfeiting any monies
          paid for such reservation(s).
        </LegalClause>
      </LegalSection>

      <LegalSection title="8. Applicable Law">
        <LegalClause id="8.1.">
          The Terms of Use, any amendment of the Terms of Use as well as all issues associated with the
          Website are subject to Greek law. The Courts of Athens are exclusively competent for any
          dispute arising from the Terms of Use and the Website. The exclusive jurisdiction of Athens
          Courts includes interim measures, temporary restraint orders and disputes arising from tort.
        </LegalClause>
      </LegalSection>

      <LegalSection title="9. Miscellaneous">
        <LegalClause id="9.1.">
          The relationship between My Blossom and you will be that of independent contractors/parties,
          and neither of us nor any of our respective officers, agents or employees will be held or
          construed to be partners, joint ventures, fiduciaries, employees or agents of the other. If
          any part of the Terms of Use is determined to be invalid or unenforceable pursuant to
          applicable law, including the warranty disclaimers and liability limitations set forth above,
          then the invalid or unenforceable provision will be deemed superseded by a valid, enforceable
          provision that most closely matches the intent of the original provision and the remainder of
          the Terms of Use shall continue in effect. You may not assign, convey, subcontract or
          delegate your rights, duties or obligations hereunder.
        </LegalClause>
        <LegalClause id="9.2.">The Terms of Use are provided only in English.</LegalClause>
        <LegalClause id="9.3.">
          For any queries regarding the content and services of the website and the Terms of Use, you may
          send an e-mail to{' '}
          <a href="mailto:reservations@kennedysgroup.com" className="text-[#B17520] underline">
            reservations@kennedysgroup.com
          </a>
          .
        </LegalClause>
      </LegalSection>

      <LegalSection title="10. Contact – Controller Details">
        <LegalClause id="10.1.">
          &ldquo;KENNEDY&rsquo;S GROUP AND REAL ESTATE SINGLE MEMBER P.C.&rdquo; Mykonos Argirena
          84600, Greece. Phone:{' '}
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
