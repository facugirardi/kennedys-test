'use client'

import React from 'react'
import poolWithOceanImage from '@/public/images/pool-with-ocean-image.png'
import smilingWomanImage from '@/public/images/smiling-woman-image.jpg'
import poolWithNiceViewImage from '@/public/images/pool-with-nice-view-image.png'
import sellWithUsHeaderImage from '@/public/images/sell-with-us-header-image.png'
import girlOnBalconyImage from '@/public/images/girl-on-balcony-image.jpg'
import girlImage from '@/public/images/girl-image.jpg'
import girlInBedImage from '@/public/images/girl-in-bed-image.jpg'
import twoGrilsImage from '@/public/images/two-grils-image.jpg'
import Footer from '@/components/custom/footerNew'
import OwnerLeadForm from '@/components/custom/OwnerLeadForm'

export const SellWithUsPage = () => {
    return (
        <>
            <section className='relative flex items-center justify-center h-[18rem] md:h-[28rem]'>
                <img className='absolute top-0 left-0 w-full h-full object-cover' src={sellWithUsHeaderImage.src} alt="" />
                <div className='absolute top-0 left-0 w-full h-full bg-black opacity-20 z-10' />
                <h1 className='text-white text-3xl md:text-7xl text-center font-gtsuper-ds font-light z-10 px-4'>SELL YOUR PROPERTY WITH <br className='hidden md:block' /> KENNEDYS GROUP</h1>
            </section>
            <section className='px-4 md:px-32 mt-10 flex flex-col items-center justify-center gap-5'>
                <h1 className='font-gtsuper-ds font-light  text-[#172338] text-2xl md:text-4xl text-center'>Maximize Your Investment with Our Expertise</h1>
                <p className='text-[#172338] font-haas mb-6 md:mb-10 font-thin text-[16px] md:text-[18px] text-center'>At Kennedy's Group, we specialize in transforming luxury properties into high-value assets. With years of experience in the real estate <br className='hidden md:block' />market, we offer tailored strategies, premium marketing, and a global network to ensure the best results for your property.</p>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10 w-full place-items-center'>
                    <div className='flex flex-col gap-2 items-center md:items-start'>
                        <div className='w-full h-44 md:w-[292px] md:h-[187px]'>
                            <img src={twoGrilsImage.src} className='w-full h-full object-cover' alt="" />
                        </div>
                        <p className='font-gtsuper-ds  text-[#172338] text-lg md:text-xl text-center md:text-left'>EXCLUSIVE MARKET ACCESS</p>
                        <p className='text-[#172338] max-w-[32ch] font-haas font-thin text-sm md:text-base text-center md:text-left'>Gain visibility among high-net-worth buyers worldwide.</p>
                    </div>
                    <div className='flex flex-col gap-2 items-center md:items-start'>
                        <div className='w-full h-44 md:w-[292px] md:h-[187px]'>
                            <img src={girlImage.src} className='w-full h-full object-cover' alt="" />
                        </div>
                        <p className='font-gtsuper-ds  text-[#172338] text-lg md:text-xl text-center md:text-left'>BESPOKE MARKETING</p>
                        <p className='text-[#172338] max-w-[34ch] font-haas font-thin text-sm md:text-base text-center md:text-left'>High-end photography, video tours, and targeted campaigns.</p>
                    </div>
                    <div className='flex flex-col gap-2 items-center md:items-start'>
                        <div className='w-full h-44 md:w-[292px] md:h-[187px]'>
                            <img src={girlOnBalconyImage.src} className='w-full h-full object-cover' alt="" />
                        </div>
                        <p className='font-gtsuper-ds  text-[#172338] text-lg md:text-xl text-center md:text-left'>PERSONALIZED SERVICE</p>
                        <p className='text-[#172338] max-w-[34ch] font-haas font-thin text-sm md:text-base text-center md:text-left'>Dedicated advisors guiding you through every step.</p>
                    </div>
                    <div className='flex flex-col gap-2 items-center md:items-start'>
                        <div className='w-full h-44 md:w-[292px] md:h-[187px]'>
                            <img src={girlInBedImage.src} className='w-full h-full object-cover' alt="" />
                        </div>
                        <p className='font-gtsuper-ds text-[#172338] text-lg md:text-xl text-center md:text-left'>SEAMLESS TRANSACTIONS</p>
                        <p className='text-[#172338] max-w-[34ch] font-haas font-thin text-sm md:text-base text-center md:text-left'>Expert negotiation and legal assistance to streamline the process.</p>
                    </div>
                </div>
            </section>
            <section className="relative bg-white px-4 md:px-32 pb-10">
                <div className="absolute inset-0 bg-[#F5F8FE] top-16 md:top-28 h-[300px] md:h-[553px] z-10" />
                <div className="z-20 max-w-7xl mx-auto px-4 py-20 grid grid-cols-1 md:grid-cols-2 gap-20 items-start relative">
                    <div>
                        <div className="mb-6">
                            <img
                                src={smilingWomanImage.src}
                                className="w-full -translate-y-6 h-auto object-cover scale-[1.02]"
                                alt="Connect with a local expert to guide your journey."
                            />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-gtsuper-ds font-light mb-2">Local expertise and exceptional service.</h2>
                        <p className="font-haas font-light text-gray-700 mb-6">
                            With specialists worldwide, we bring local insight everywhere. Using cutting-edge technology and unmatched service, our brokerage offices enhance your property and selling experience.
                        </p>
                    </div>
                    <div className="md:translate-y-16">
                        <h2 className="text-3xl md:text-4xl font-gtsuper-ds font-light mb-2">Connect with a local expert to guide your journey.</h2>
                        <p className="font-haas font-light text-gray-700">
                            Our real estate professionals leverage in-depth market knowledge to craft a tailored strategy for your property. Find the nearest advisor and benefit from their expertise.
                        </p>
                        <div className="w-full md:w-[500px] mt-10 md:mt-28">
                            <img
                                src={poolWithOceanImage.src}
                                className="w-full  h-auto object-cover scale-[1.02]"
                                alt="Local expertise and exceptional service."
                            />
                        </div>
                    </div>
                </div>
            </section>
            <section className="relative pt-10 px-4 md:px-32 min-h-[260px] md:h-[400px] flex flex-col">
                <img className='absolute top-0 left-0 w-full h-full object-cover -scale-x-100' src={poolWithNiceViewImage.src} alt="" />
                <div className='z-10 max-w-[85ch] break-words flex flex-col '>
                    <h1 className='text-[#172338] text-3xl md:text-4xl font-gtsuper-ds font-light z-10'>Your Trusted <br className='hidden md:block' /> Real Estate Partner</h1>
                    <p className='text-[#172338] font-haas font-normal text-sm md:text-md z-10 mt-5 max-w-[60ch]'>Selling a luxury property requires a refined approach. Our expertise in the market, combined with our commitment to excellence, ensures a smooth and successful transaction for every client.</p>
                </div>
            </section>
            <section className="relative min-h-[320px] md:h-[400px] flex flex-col gap-5 justify-center items-center bg-[#172338] px-4 text-center py-10 md:py-0">
                <div className="flex flex-col overflow-hidden rounded-full w-[113px] h-[113px]">
                    <img
                        src="/images/dianaImage.jpg"
                        className="object-cover scale-150 w-full h-full  translate-y-7"
                    />
                </div>
                <div>
                    <h1 className='text-white text-3xl md:text-4xl font-gtsuper-ds font-light z-10'>CONTACT OUR REAL ESTATE TEAM</h1>
                </div>
                <p className='text-white text-center text-sm md:text-base font-haas font-light z-10'>Ready to sell? Leave your details and our team will personally assist you <br className='hidden md:block' />in maximizing your property's potential.</p>
                <button
                    type="button"
                    className='bg-[#28F7EA] text-[#172338] text-center text-base font-haas z-10 px-5 w-fit h-10 hover:bg-[#1fe8dc] transition'
                    onClick={() =>
                        document
                            .getElementById('sell-with-us-lead-form')
                            ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }
                >
                    Contact Us
                </button>
            </section>
            <section
                id="sell-with-us-lead-form"
                className='bg-[#F5F8FE] px-4 md:px-32 py-12 scroll-mt-28 md:scroll-mt-36'
            >
                <div className='max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1.1fr,0.9fr] gap-8 md:gap-12 items-start'>
                    <div className='flex flex-col gap-4'>
                        <h2 className='text-[#172338] text-3xl md:text-4xl font-gtsuper-ds font-light'>Share your property with Kennedy&apos;s</h2>
                        <p className='text-[#506A70] text-sm md:text-base font-haas font-light'>Tell us about your residence and our team will prepare a tailored valuation, marketing plan, and onboarding roadmap. We work hands-on with owners to position each villa for sustained success.</p>
                        <ul className='text-[#506A70] text-sm md:text-base font-haas font-light space-y-2'>
                            <li>• Dedicated advisor to review your goals and timelines</li>
                            <li>• Bespoke revenue projection based on our global demand data</li>
                            <li>• Concierge-level support from onboarding through guest management</li>
                        </ul>
                    </div>
                    <OwnerLeadForm
                        leadType="sell-with-us"
                        visualVariant="navbarContact"
                        title="Let&apos;s discuss your property"
                        description="Complete the form and we will reach out within one business day."
                    />
                </div>
            </section>
            <Footer disableTravelSection={true} />
        </>
    )
}
