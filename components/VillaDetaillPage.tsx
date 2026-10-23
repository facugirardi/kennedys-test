"use client";

import { sanitizeCmsHtml } from '@/lib/sanitizeCmsHtml';
import { trackContactAgentClick } from '@/lib/utils/googleAdsConversions';
import { OpenNavbarContact } from '@/components/custom/OpenNavbarContact';
import { useState, useCallback, useEffect } from 'react'
import { Property } from '../interfaces/property'
import { TbBed, TbBath, TbUser, TbPool } from 'react-icons/tb'
import { CalendarDaysIcon, Camera, ChevronRight, Euro, HeartHandshakeIcon } from 'lucide-react';
import { GoogleMap, useJsApiLoader, Marker, Libraries } from "@react-google-maps/api";
import { CiStar } from "react-icons/ci";
import { TiDocumentText } from "react-icons/ti";
import { RiMapPinLine } from "react-icons/ri";
import { patchProperty } from '@/lib/api/properties'
import { ImagesCarrousel } from './imagesCarrousel'
import { formatDateRange, expandAvailabilityRangesToDays, formatCurrency, groupAvailabilityRangesByPriceAndMinStay } from '@/lib/utils'
import AvailabilityCalendar from './custom/AvailabilityCalendar'
import { CheckinForm } from './custom/CheckinForm'
import { GoHeart } from "react-icons/go";
import { BsShare } from "react-icons/bs";
import { ContactForm } from './custom/ContactForm'
import { MdOutlineRectangle } from "react-icons/md";
import { PropertieCard } from './custom/propertieCard'

interface Props {
  property: Property;
  similarVillas?: Property[];
}

const containerStyle = {
  width: "100%",
  height: "100%",
};

const initialCenter = {
  lat: 37.422,
  lng: -122.0841,
};
const GOOGLE_MAPS_LIBRARIES: Libraries = ["places"];

// Configuración del mapa

interface GoogleMapComponentProps {
  property: Property;
}

function GoogleMapComponent({ property }: GoogleMapComponentProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markerPosition, setMarkerPosition] = useState(initialCenter);

  const onLoad = useCallback(function callback(map: google.maps.Map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback() {
    setMap(null);
  }, []);

  const extractGoogleMapUrlFromUrl = (url: string) => {
    try {
      // Multiple regex patterns to extract googleMapUrl
      const patterns = [
        /@([-\d.]+),([-\d.]+)/, // @lat,lng format
        /place\/[^\/]+\/([-\d.]+),([-\d.]+)/, // place/ format
        /ll=([-\d.]+),([-\d.]+)/, // ll= format
      ];

      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match.length >= 3) {
          const lat = parseFloat(match[1]);
          const lng = parseFloat(match[2]);
          if (!isNaN(lat) && !isNaN(lng)) {
            return { lat, lng };
          }
        }
      }
    } catch (error) {
      console.error("Coordinate extraction error:", error);
    }
    return null;
  };

  useEffect(() => {
    if (isLoaded && property?.googleMapUrl) {
      const extractedCoords = extractGoogleMapUrlFromUrl(property?.googleMapUrl);

      if (extractedCoords) {
        setMarkerPosition(extractedCoords);
        if (map) {
          map.panTo(extractedCoords);
          map.setZoom(17);
        }
      }
    }
  }, [isLoaded, property?.googleMapUrl, map]);

  if (loadError) {
    return <div className="w-full h-full flex items-center justify-center">Map cannot be loaded right now, sorry.</div>;
  }

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={markerPosition}
      zoom={15}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={{
        disableDefaultUI: false,
        zoomControl: true,
        streetViewControl: true,
        mapTypeControl: true,
      }}
    >
      <Marker position={markerPosition} />
    </GoogleMap>
  ) : (
    <div className="w-full h-full flex items-center justify-center">Loading...</div>
  );
}

export const VillaDetaillPage = ({ property, similarVillas }: Props) => {

  const [activeIndex, setActiveIndex] = useState(0); // index de imagen activa
  const [activeTab, setActiveTab] = useState("prices"); // Para tabs de Prices/Availability
  const [sectionTab, setSectionTab] = useState("Complimentary services"); // Para tabs de la sección inferior
  const [openGallery, setOpenGallery] = useState<boolean>(false); // Para la galería principal
  const [openCarrousel, setOpenCarrousel] = useState<string | null>(null); // Para el carrusel de secciones
  const [beforeScrollPosition, setBeforeScrollPosition] = useState(0);
  const tabs = ["Square Footage", "Complimentary services", "Need to Know"];
  
  // Procesar outdoorFacilities - puede venir como array o string separado por comas
  const outdoorFacilities = property?.classification?.outdoorFacilities
    ? (Array.isArray(property.classification.outdoorFacilities)
        ? property.classification.outdoorFacilities
        : typeof property.classification.outdoorFacilities === 'string'
          ? (property.classification.outdoorFacilities as string).split(',').filter(Boolean).map((s: string) => s.trim())
          : [])
    : [];
  const imagesGallery = property?.images?.filter((image) => image.section === "Gallery")?.slice(0, 5) || [];
  const imageBedroom = property?.images?.filter((image) => image.section === "Bedroom")?.slice(0, 5) || [];
  const imageKitchen = property?.images?.filter((image) => image.section === "Kitchen")?.slice(0, 5) || [];
  const imagePool = property?.images?.filter((image) => image.section === "Pool")?.slice(0, 5) || [];
  const imageDiningRoom = property?.images?.filter((image) => image.section === "Dining Room")?.slice(0, 5) || [];
  const imageOutdoor = property?.images?.filter((image) => image.section === "Outdoor Image")?.slice(0, 5) || [];
  // need to be only one image
  const imageHeader = property?.images?.filter((image) => image.section === "Header")?.slice(0, 1) || [];

  const handleOpenGallery = (open: boolean) => {
    setOpenGallery(open);
    if (open) {
      setBeforeScrollPosition(window.scrollY);
    } else {
      setTimeout(() => {
        window.scrollTo({ top: beforeScrollPosition, behavior: "auto" });
      }, 0);
    }
  };

  const handleOpenCarrousel = (type: string | null) => {
    setOpenCarrousel(prev => {
      if (!prev && type) {
        setBeforeScrollPosition(window.scrollY);
        return type;
      }
      return null;
    });
  };
  useEffect(() => {
    if (openGallery || openCarrousel) {
      document.body.style.overflow = "hidden";
      // Espera al siguiente tick para asegurarse de que el modal ya está en el DOM
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "auto" });
      }, 0);
    } else {
      document.body.style.overflow = "auto";
      // También espera un poco antes de restaurar el scroll
      setTimeout(() => {
        window.scrollTo({ top: beforeScrollPosition, behavior: "auto" });
      }, 0);
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [openGallery, openCarrousel, beforeScrollPosition]);

  const handleContactClick = useCallback(() => {
    trackContactAgentClick();
    const propertyName = property?.title;
    const msg = `Hello, I'm interested in the property${propertyName ? ` ${propertyName}` : ''}.`;
    const phone = property?.rental ? '306972152778' : '306978137391';
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  }, [property?.rental, property?.title]);

  return (
    <div className={`h-full w-full scroll-smooth ${(openGallery || openCarrousel) ? "overflow-y-hidden scroll-none" : "overflow-auto scroll-smooth"}`}>
      <div className='h-full w-full px-32 pb-20 mt-5 '>
        <section className="w-full  text-left flex  gap-2  ">
          {
            property?.rental &&
            (
              <div className="absolute left-0 w-full h-[28rem]">
                <img src={`${process?.env?.NEXT_PUBLIC_BASE_URL}${imageHeader?.[0]?.urlImage || ""}`} alt="header image" className="absolute top-0 left-0 w-full h-full object-cover" />
              </div>
            )
          }
          <div className=' flex  w-full  py-8  gap-5 z-10'>
            <div className='w-full flex flex-col gap-5 '>
              {
                property?.rental ?
                  <h1 className={property?.rental ? "text-6xl text-white font-gtsuper font-thin" : "text-6xl text-soft-gray-dark font-gtsuper font-thin"}>{property?.title || "Teresa"}</h1>
                  :
                  <h1 className={property?.rental ? "text-6xl text-white font-gtsuper font-thin" : "text-6xl text-soft-gray-dark font-gtsuper font-thin"}>{property?.propertyCode || "hwkY6W0SXVCygHo2"}</h1>
              }
              <div className='w-fit flex flex-col gap-5 '>
                <div className={property?.rental ? "w-[45%] flex flex-col gap-5" : "break-words max-w-[90ch] flex flex-col gap-5"}>
                  <div
                    className={property?.rental ? "text-white text-md" : "text-soft-gray-dark text-md"}
                    dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(property?.description?.longDescription) }}
                  />
                  <div className={property?.rental ? "w-full text-white flex gap-6" : "w-full text-soft-gray-dark flex gap-6"}>
                    <span className='flex gap-1'>
                      <TbBed size={27} />
                      <span>{property?.classification?.bedrooms || "6"} bedrooms</span>
                    </span>
                    <span className='flex gap-2'>
                      <TbBath size={27} />
                      <span>{property?.classification?.baths || "6"} bathrooms</span>
                    </span>
                    {
                      property?.rental &&
                      <span className='flex gap-2'>
                        <TbUser size={27} />
                        <span>{property?.classification?.idealPersons || "20"} guests</span>
                      </span>
                    }
                    <span className='flex gap-2'>
                      <TbPool size={27} />
                      <span>{property?.pools?.length || "2"} pools</span>
                    </span>
                    {
                      !property?.rental && (
                        <>
                          <span className='flex gap-2'>
                            <MdOutlineRectangle size={27} />
                            <span>{property?.classification?.indoorArea || "631 sqm Living Area"} </span>
                          </span>
                          <span className='flex gap-2'>
                            <MdOutlineRectangle size={27} />
                            <span>{property?.classification?.totalSurface || "2600 sqm total Surface"} </span>
                          </span>
                        </>
                      )
                    }
                  </div>
                  <div className={property?.rental ? "w-full text-white flex gap-5 items-center" : "w-full text-soft-gray-dark flex gap-5 items-center"}>
                    <div className='flex gap-2 items-center'>
                      <GoHeart size={27} />
                      <span>Save</span>
                    </div>
                    <div className='flex gap-2 items-center'>
                      <BsShare size={27} />
                      <span>Share</span>
                    </div>
                  </div>
                  {
                    property?.rental &&
                    <p className='text-white underline'>Price upon request</p>
                  }
                </div>
              </div>
            </div>
            {
              property?.rental &&
              (
                <div className=' mr-10 h-fit p-4  bg-white'>
                  <CheckinForm />
                </div>
              )
            }
            {/* <p className='text-white font-gtsuper-display font-thin text-3xl'>{"Mykonos Agios Lazzaro"}</p> */}
          </div>
          {
            !property?.rental && (
              <div className='w-[26rem] ml-auto h-full pb-4'>
                <ContactForm />
              </div>
            )
          }
          {/* <div className='w-[25%] h-[25%] bg-white'>
            <div className='flex flex-col h-full'>
              <div className='flex mb-2'>
                <span className='font-gtsuper-display font-thin  text-soft-gray text-3xl'>5 Guest</span>
                <span className='text-3xl'>-</span>
                <span className='font-gtsuper-display font-thin text-soft-gray text-3xl'>4 Nights</span>
              </div>
              <div className='flex items-center gap-2 mb-10'>
                <span><CalendarDaysIcon size={27} className='text-soft-gray' /></span> <span className='font-gtsuper-display text-soft-gray '>Feb, Sat 1 - Feb, Sat 8</span>
              </div>
              <div className='relative flex flex-col justify-end gap-2 w-fit'>
                <div className='relative flex items-center gap-2'>
                  <Euro size={27} className='absolute -left-5 text-primary' /><p className='text-4xl ml-2 font-gtsuper font-thin text-primary'>{property?.price || "12,000.00"}</p>
                </div>
                <div className="flex justify-end items-center gap-1">
                  <Euro size={19} className=' text-soft-gray font-thin' /> <span className="text-soft-gray font-gtsuper-display font-thin text-lg">3000 per night</span>
                </div>
              </div>
            </div>
          </div> */}
        </section>
        {
          property?.rental && (
            <section id="detail" className='mt-16 flex flex-col bg-[#F0F3F5] h-[499px] -mx-32 py-10 gap-5  mb-10'>
              <h2 className='text-4xl font-gtsuper  text-center font-thin text-soft-gray-dark '>About {property?.title}</h2>
              <div className='flex w-full items-center'>
                <div className='w-full flex flex-col gap-5 items-center'>
                  <div className='w-[50%]'>
                    <p className=' text-justify text-soft-gray-dark font-gtsuper'>{property?.description?.detiledDescription || ""}</p>
                  </div>
                </div>
              </div>
            </section>
          )
        }
        {
          property?.rental && (

            <section className={`flex relative gap-14 pl-20 pb-20 mb-10 h-[600px] translate-y-[-100px]`}>
              {/* images */}
              <img
                src={`${process.env.NEXT_PUBLIC_BASE_URL}${imageBedroom[0]?.urlImage}`}
                className="w-[30rem] h-[26rem] z-10 object-cover cursor-pointer hover:opacity-90 transition-opacity border"
                alt="Bedroom"
                onClick={() => handleOpenCarrousel("Bedroom")}
              />
              <img
                src={`${process.env.NEXT_PUBLIC_BASE_URL}${imageDiningRoom[0]?.urlImage}`}
                className="w-[25rem] h-[15rem] z-1 bottom-[0rem] left-[30rem] absolute object-cover cursor-pointer hover:opacity-90 transition-opacity border"
                alt="Dining Room"
                onClick={() => handleOpenCarrousel("Dining Room")}
              />
              <img
                src={`${process.env.NEXT_PUBLIC_BASE_URL}${imageKitchen[0]?.urlImage}`}
                className="w-[30rem] h-[20rem] object-cover cursor-pointer hover:opacity-90 transition-opacity border"
                alt="Kitchen"
                onClick={() => handleOpenCarrousel("Kitchen")}
              />
              <img
                src={`${process.env.NEXT_PUBLIC_BASE_URL}${imagePool[0]?.urlImage}`}
                className="w-[30rem] h-[23rem] object-cover cursor-pointer hover:opacity-90 transition-opacity border"
                alt="Pool"
                onClick={() => handleOpenCarrousel("Pool")}
              />
            </section>
          )}
        {openCarrousel && (
          <ImagesCarrousel
            images={[
              ...imageBedroom,
              ...imageDiningRoom,
              ...imageKitchen,
              ...imagePool
            ]}
            type={openCarrousel}
            handleOpenGallery={() => handleOpenCarrousel(null)}
          />
        )}

        {
          property?.rental && (
            <section className="mt-10 flex flex-col gap-5 justify-center items-center">
              <h2 className="text-2xl font-gtsuper font-thin text-soft-gray-dark text-center">IN DETAIL</h2>
              <div className="flex justify-center gap-10">
                <a href="#gallery" className="flex flex-col justify-center items-center  rounded-full w-20 h-20 border border-primary">
                  <Camera size={27} className='text-primary' />
                  <span className="text-xs text-primary">Photos</span>
                </a>
                <a href="#detail" className="flex flex-col justify-center items-center  rounded-full w-20 h-20 border border-primary">
                  <TiDocumentText size={27} className='text-primary' />
                  <span className="text-xs text-primary">Detail</span>
                </a>
                <a href="#facilities" className="flex flex-col justify-center items-center  rounded-full w-20 h-20 border border-primary">
                  <CiStar size={27} className='text-primary' />
                  <span className="text-xs text-primary">Facilities</span>
                </a>
                <a href="#map" className="flex flex-col justify-center items-center  rounded-full w-20 h-20 border border-primary">
                  <RiMapPinLine size={27} className='text-primary' />
                  <span className="text-xs text-primary">Map</span>
                </a>
              </div>
              {property?.description?.detiledDescription && (
                <p className='text-center mx-auto break-words max-w-[98ch]'>{property.description.detiledDescription}</p>
              )}
            </section>
          )
        }
        {
          property?.rental && (
            <section className='my-10 flex flex-col gap-5'>
              <div className="flex flex-wrap justify-between gap-6 border-t pt-6">
                <div className="flex-1 min-w-[180px] border-r">
                  <h4 className="font-medium mb-2 font-gtsuper text-soft-gray text-center text-lg">GENERAL</h4>
                  <ul className="list-disc pl-4 text-md text-gray-700">
                    <li>Bedrooms: {property?.classification?.bedrooms}</li>
                    <li>Sleeps: {property?.classification?.idealPersons}</li>
                    <li>Baths: {property?.classification?.baths}</li>
                    <li>Property Size:  270 sqm</li>
                    <li>Land Size: 4500 sqm</li>
                  </ul>
                </div>
                <div className="flex-1 min-w-[12rem] border-r">
                  <h4 className="font-medium mb-2 font-gtsuper text-soft-gray text-center text-lg">ACOMODATIONS</h4>
                  <ul className="list-disc pl-4 text-md text-gray-700">
                    {
                      property?.description?.accomodationDetails?.split('\n')?.map((item: string, index: number) => (
                        <li key={index}>{item}</li>
                      ))
                    }
                  </ul>
                </div>
                <div className="flex-1 min-w-[12rem] border-r">
                  <h4 className="font-medium mb-2 font-gtsuper text-soft-gray text-center text-lg">FACILITIES</h4>
                  <ul className="list-disc pl-4 text-md text-gray-700">
                    {outdoorFacilities.length > 0 ? (
                      outdoorFacilities.map((facility: string, index: number) => (
                        <li key={index}>{facility}</li>
                      ))
                    ) : (
                      <li>Information upon request</li>
                    )}
                  </ul>
                </div>
                <div className="flex-1 min-w-[12rem] border-r">
                  <h4 className="font-medium mb-2 font-gtsuper text-soft-gray text-center text-lg">SERVICES</h4>
                  <ul className="list-disc pl-4 text-md text-gray-700">
                    <li>Fireplace</li>
                    <li>Alarm System</li>
                    <li>Safe Boxes</li>
                    <li>Fully equipped Kitchen</li>
                    <li>Air conditioning</li>
                  </ul>
                </div>
                <div className="flex-1 min-w-[12rem]">
                  <h4 className="font-medium mb-2 font-gtsuper text-soft-gray text-center text-lg">ENJOY</h4>
                  <ul className="list-disc pl-4 text-md text-gray-700">
                    <li>Barbecue near the sea</li>
                    <li>Private Pool</li>
                    <li>Sea View</li>
                    <li>Sunset View</li>
                  </ul>
                </div>
                {/* Repite para las demás secciones */}
              </div>
            </section>
          )
        }

      </div>
      {
        property?.rental && (

          <div className='flex justify-center items-center'>
            <button onClick={handleContactClick} className='bg-[#28F7EA] text-[#172338] px-10 py-5'>Need personalized assistance</button>
          </div>
        )
      }

      <section id="gallery" className='py-20 px-32 bg-gray-100'>
        {/* gallery */}
        <div className='w-full h-full'>
          {
            openGallery && (
              <ImagesCarrousel
                images={imagesGallery}
                type="Gallery"
                handleOpenGallery={() => handleOpenGallery(false)}
              />
            )
          }
          <div className='w-full h-[36rem] cursor-pointer' onClick={() => handleOpenGallery(true)}>
            <img
              src={`${process.env.NEXT_PUBLIC_BASE_URL}${imagesGallery[activeIndex]?.urlImage}` || ""}
              alt=""
              className='w-full h-full object-contain'
            />
          </div>
          <div className='flex gap-5 mt-5'>
            {imagesGallery.map((img, index) => (
              <div
                key={index}
                className='w-full h-48 cursor-pointer'
                onClick={() => setActiveIndex(index)}
              >
                <img
                  src={`${process.env.NEXT_PUBLIC_BASE_URL}${img?.urlImage}` || ""}
                  alt=""
                  className='w-full h-full object-cover'
                />
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-4 space-x-2">
            {imagesGallery.map((_, index) => (
              <span
                key={index}
                className={`transition-all duration-300 ${index === activeIndex
                  ? 'w-8 h-2 bg-primary'
                  : 'w-2 h-2 bg-primary'
                  } rounded-full`}
              />
            ))}
          </div>
        </div>
      </section>
      {
        // property?.rental && (
        //   <div className=''>
        //     <section className='w-full bg-gray-100 p-20 flex justify-center items-center'>
        //       <p className="max-w-[800px] mx-auto text-center text-3xl font-gtsuper font-thin text-soft-gray text-clip ">Embark on an unforgettable vacation by reserving this highly sought-after villa. Due to its incredible features and prime location, early booking is strongly recommended.</p>
        //     </section>
        //   </div>
        // )
      }

      {
        property?.rental && (
          <section className='w-full px-32 flex h-[35rem] bg-soft-gray-dark'>
            <div className='flex justify-center items-center '>
              <div className='flex flex-col gap-5 w-[55%] text-balance'>
                <h2 className="text-4xl font-gtsuper font-thin  text-white">Villa Serenity offer beautiful outdoor spaces with a spacious swimming pool.</h2>
                <p className="text-white text-lg">The guests would have the opportunity to share unforgettable moments with their beloved ones while enjoying a refreshing cocktail by the pools. The family atmosphere and the surrounding pure landscape are inviting and can offer you moments of ultimate relaxation!</p>
              </div>
            </div>
            <div className='w-full h-full'>
              <img src={`${process.env.NEXT_PUBLIC_BASE_URL}${imageOutdoor[0]?.urlImage}`} alt="" className="w-full h-full object-cover scale-105" />
            </div>
          </section>
        )
      }
      {
        property?.rental && (
          <div className='mt-20 px-32'>
            <section className='w-full bg-gray-100 p-20'>
              {/* the villa */}
              <div className='flex  ml-32 gap-10 justify-around   mr-24'>
                <div className='bg-white flex flex-col p-10 justify-center  border border-gray-300  '>
                  <h2 className="text-3xl pb-2 font-gtsuper font-thin border-b border-primary  text-soft-gray-dark">The Villa</h2>
                  {
                    property?.description?.theVilla?.groups?.map((item: any, index: number) => (
                      <div key={item.id} className={`flex flex-col  w-fit  gap-5 ${index === 1 ? 'max-w-[40ch]' : 'max-w-[42ch]'}`}>
                        <h3 className={`text-2xl font-gtsuper text-left font-light text-soft-gray ${index === 1 ? 'first-letter:text-3xl mt-5' : 'mt-6'}`}>{item.title}</h3>
                        {
                          item.items?.map((item: any, index: number) => (
                            <div key={index} className='pl-5'>
                              <p className='  list-item text-soft-gray-dark'>{item}</p>
                            </div>
                          ))
                        }
                      </div>
                    ))
                  }
                </div>
                <div className='w-[39rem] h-[35rem] bg-white p-10 border border-gray-300'>
                  <div className="flex gap-10 border-b border-primary">
                    <button
                      onClick={() => setActiveTab('prices')}
                      className={`text-3xl pb-2 font-gtsuper font-thin transition-all ${
                        activeTab === 'prices' 
                          ? 'text-soft-gray-dark border-b-2 border-b-primary' 
                          : 'text-soft-gray-dark/50'
                      }`}
                    >
                      Prices/Night
                    </button>
                    <button
                      onClick={() => setActiveTab('availability')}
                      className={`text-3xl pb-2 font-gtsuper font-thin transition-all ${
                        activeTab === 'availability' 
                          ? 'text-soft-gray-dark border-b-2 border-b-primary' 
                          : 'text-soft-gray-dark/50'
                      }`}
                    >
                      Availability
                    </button>
                  </div>
                  <div className="mt-4">
                    {
                      activeTab === "prices" && (
                        property?.availabilityRanges && property.availabilityRanges.length > 0 ? (
                          <table className="w-full table-auto border-separate border-spacing-y-4 text-left">
                            <thead>
                              <tr className="text-[#506A70] text-lg font-semibold">
                                <th className="px-4">DATES</th>
                                <th className="px-4">MIN.STAY</th>
                                <th className="px-4">PRICE</th>
                              </tr>
                            </thead>
                            <tbody className="text-[#506A70] text-base font-light">
                              {
                                groupAvailabilityRangesByPriceAndMinStay(property.availabilityRanges).map((range: any, index: number) => (
                                  <tr key={index}>
                                    <td className="px-4 py-2">{range.dateRangeFormatted}</td>
                                    <td className="px-4 py-2">{range.minStay}</td>
                                    <td className="px-4 py-2">{range.price}</td>
                                  </tr>
                                ))
                              }
                            </tbody>
                          </table>
                        ) : (
                          <div className="rounded border border-[#E4E8EA] p-4 text-sm text-[#506A70] font-haas">
                            Price information is provided upon request.
                          </div>
                        )
                      )
                    }
                    {
                      activeTab === "availability" && (
                        property?.icalendarURL || (property?.availabilityRanges && property.availabilityRanges.length > 0) ? (
                          <AvailabilityCalendar
                            icalUrl={property?.icalendarURL || null}
                            availabilityRanges={property?.availabilityRanges || []}
                            showPrices={property?.price_visibility !== false}
                          />
                        ) : (
                          <div className="rounded border border-[#E4E8EA] p-4 text-sm text-[#506A70] font-haas">
                            Availability information is provided upon request.
                          </div>
                        )
                      )
                    }
                  </div>
                  {
                    activeTab === "availability" && (
                      property?.icalendarURL || (property?.availabilityRanges && property.availabilityRanges.length > 0) ? (
                        <AvailabilityCalendar
                          icalUrl={property?.icalendarURL || null}
                          availabilityRanges={property?.availabilityRanges || []}
                        />
                      ) : (
                        <div className="rounded border border-[#E4E8EA] p-4 text-sm text-[#506A70] font-haas">
                          Availability information is provided upon request.
                        </div>
                      )
                    )
                  }
                </div>
              </div>
            </section>

          </div>
        )
      }
      {
        property?.rental && (
          <section className="w-full px-32 pt-20 pb-10 flex items-center">
            <div className="w-full h-[600px]">
              {/* Tabs */}
              <div className="pl-10 flex gap-10 mb-5 relative">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setSectionTab(tab)}
                    className={`relative text-xl font-gtsuper-display pb-2 transition-all duration-200
                ${sectionTab === tab
                        ? "text-primary font-bold border-b-2 border-b-primary"
                        : "text-soft-gray border-b-2 border-b-gray-300"
                      }`}
                  >
                    {tab}
                    {/* Borde superior que sobresale */}

                  </button>
                ))}
              </div>

              {/* Contenido */}
              <div className="flex flex-col border-2 justify-start gap-5 p-10">
                {sectionTab === "Complimentary services" && (
                  <>
                    <h3 className="text-lg font-gtsuper-ds font-semibold text-[#172338] mb-3">Services included with this booking:</h3>
                    <div className="space-y-2">
                      <p className="text-lg font-gtsuper-ds font-semibold text-[#172338] mb-2">Daily</p>
                      <ul className="space-y-2 list-disc list-inside">
                        <li className="text-sm md:text-base text-[#506A70] font-haas">
                          Maya Luxe Concierge - Speaks English & Spanish
                        </li>
                        <li className="text-sm md:text-base text-[#506A70] font-haas">Housekeeping</li>
                      </ul>
                    </div>
                    <div className="space-y-2 mt-4">
                      <p className="text-lg font-gtsuper-ds font-semibold text-[#172338] mb-2">At an additional cost</p>
                      <ul className="space-y-2 list-disc list-inside">
                        <li className="text-sm md:text-base text-[#506A70] font-haas">Chef Service</li>
                        <li className="text-sm md:text-base text-[#506A70] font-haas">
                          Chef services are available at an additional charge
                        </li>
                      </ul>
                    </div>
                    <div className="space-y-2 mt-4">
                      <p className="text-lg font-gtsuper-ds font-semibold text-[#172338] mb-2">Square Footage</p>
                      <p className="text-sm md:text-base text-[#506A70] font-haas">
                        Interior: 1903 sq ft | Exterior: 1312 sq ft | Total: 2733 sq ft
                      </p>
                    </div>
                    <div className="space-y-2 mt-4">
                      <p className="text-lg font-gtsuper-ds font-semibold text-[#172338] mb-2">What Maya Luxe Guests Think</p>
                      <p className="text-sm md:text-base text-[#506A70] font-haas">
                        Our community's ratings & reviews for this villa
                      </p>
                    </div>
                  </>
                )}

                {sectionTab === "Square Footage" && (
                  <div>
                    <p className="font-bold">Square Footage</p>
                    <p className="font-gtsuper-display">
                      Interior: 1903 sq ft | Exterior: 1312 sq ft | Total: 2733 sq ft
                    </p>
                  </div>
                )}

                {sectionTab === "Need to Know" && (
                  <div>
                    <p className="font-gtsuper-display">Important details go here...</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      {
        property?.rental && (
          <>
            <section className="w-full mb-20 bg-gray-100 h-[28rem] flex justify-end items-center relative">
              <div className="absolute left-0 top-0 translate-x-52 -translate-y-20 w-[24rem] h-[14rem] bg-black opacity-50"></div>
              <div className="absolute left-0 bottom-0 translate-x-44 translate-y-14 z-20  w-[28rem] h-[14rem] bg-red-500 "></div>
              <div className="w-[36rem] h-[16rem] -translate-x-14 z-10 bg-green-500 "></div>
              <div className=' flex flex-col justify-center h-full items-center px-32'>
                <div className='self-end  text-left  '>
                  <p className="font-gtsuper break-words max-w-[20ch]  mb-2 text-black text-3xl">Personalized itineraries and bookings in Theresa</p>
                  <p className="text-base font-gtsuper break-words max-w-[46ch]">Experience luxury at its finest with our range of Concierge Packages tailored to meet your every need. Choose from our<span className="font-bold"> 5-star, 6-star, and 7-star packages,</span> each offering a unique blend of services to ensure an unforgettable experience.</p>
                </div>
              </div>
            </section>
            <section className='w-full mt-10 flex justify-between gap-10  items-center px-40'>
              <div>
                <p className='font-gtsuper-display  text-primary text-2xl mb-4'>5 STARS</p>
                <p className='break-words max-w-[65ch]'>Indulge in a stress-free getaway with personalized itinerary planning, VIP access, and seamless coordination of your travel needs.</p>
              </div>
              <div>
                <p className='font-gtsuper-display  text-primary text-2xl mb-4'>6 STARS</p>
                <p className='break-words max-w-[65ch]'>Elevate your experience with enhanced services, including 24/7 dedicated concierge support, expedited access, and prime seating at top venues and events.</p>
              </div>
              <div>
                <p className='font-gtsuper-display  text-primary text-2xl mb-4'>7 STARS</p>
                <p className='break-words max-w-[65ch]'>Reach for the sky with our most exclusive package, offering unlimited changes to your itinerary, personalized assistance throughout your stay, and access to the most coveted experiences and venues worldwide.</p>
              </div>
            </section>
            <div className='flex justify-center items-center mt-10'>
              <OpenNavbarContact contactPreset='CONCIERGE' className='flex justify-center items-center gap-2 w-48 h-8 p-8 bg-[#28F6EA] text-[#172338]'>
                Contact Us <ChevronRight size={20} />
              </OpenNavbarContact>
            </div>
          </>
        )
      }
      <section className={`w-full px-32 pt-20  flex items-center ${property?.rental ? 'pb-10' : 'pb-5'}`}>
        <div className="w-full flex flex-col h-[500px]">
          <h1 className={`text-4xl font-gtsuper font-thin text-soft-gray-dark mb-5 ${property?.rental ? 'text-center' : 'text-left'}`}>LOCATION AND DISTANCES</h1>
          <div className="w-full h-full relative">
            <GoogleMapComponent property={property} />
            <div className='border absolute top-10 flex flex-col left-10 w-[26rem] h-[12rem] p-5 bg-white shadow-md z-10'>
              <div className='w-full flex gap-10 mb-5'>
                <h1 className='font-gtsuper-display font-bold text-primary border-b-2 border-b-primary text-lg'>Location</h1>
                <h1 className='font-gtsuper-display font-bold text-gray-400 border-b-2 border-b-gray-400 text-lg'>Distances</h1>
              </div>
              <div className='text-left'>
                <p>{property?.location || 'Location not specified'}</p>
                <p>{property?.area ? `${property?.area}, ` : ''}{property?.region || 'Region not specified'}</p>
                <p>{property?.country || 'Country not specified'}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      {
        !property?.rental && (
          <section className='w-full px-32  pb-10 flex flex-col justify-start mb-10'>
            <h1 className='text-xl font-gtsuper-display font-bold text-soft-gray-dark mb-5'>About Mykonos</h1>
            <p className="text-soft-gray-dark">We will be visiting the famous Windmills, Little Venice, Paraportiani church the old port and some nice streets in the town!The social and cultural center of the island is Mykonos Town, also called Chora: Here you will find the largest selection of exclusive properties, aside from the most of the restaurant, Hotel and club offers Since most of the shopping and leisure opportunities are also in Chora</p>
          </section>
        )
      }
      {
        !property?.rental && (
          <section className='w-full px-20 bg-gray-100 py-10 flex flex-col justify-start mb-10'>
            <h1 className='text-xl font-gtsuper font-thin text-soft-gray-dark mb-5'>About the building</h1>
            <div className='grid grid-cols-2 gap-20  border border-black'>
              <div className='flex flex-col w-full'>
                <div className='flex justify-between w-full'>
                  <span>Object type</span>
                  <span>{property?.classification?.objectType || 'Flat'}</span>
                </div>
                <div className='flex justify-between w-full'>
                  <span>Condition</span>
                  <span>{property?.classification?.condition || 'Good'}</span>
                </div>
                <div className='flex justify-between w-full'>
                  <span>Bedrooms</span>
                  <span>{property?.classification?.bedrooms || '1'}</span>
                </div>
              </div>
              <div className='flex flex-col w-full'>
                <div className='flex justify-between w-full'>
                  <span>Total Surface</span>
                  <span>{property?.classification?.totalSurface || '100m2'}</span>
                </div>
                <div className='flex justify-between w-full'>
                  <span>Living Area</span>
                  <span>{property?.classification?.livingArea || '50m2'}</span>
                </div>
                {/* add flooring to the database and the cms */}
                <div className='flex justify-between w-full'>
                  <span>Flooring</span>
                  <span>{property?.classification?.flooring || 'Marble, Stone'}</span>
                </div>
              </div>
            </div>
          </section>)
      }
      {
        property?.rental ? (
          <section>
            <h1 className='text-xl font-gtsuper-display font-bold text-soft-gray-dark mb-5'>Similar Villas</h1>

            <div className='grid grid-cols-3 gap-20'>
              {
                similarVillas?.map((villa: Property) => (
                  <PropertieCard key={villa.id} villaImage={villa.image as string} title={villa.title as string} location={villa.location as string} country={villa.country as string} bedrooms={villa.bedrooms} guests={villa.guests} pools={villa.pools} capa1={villa.capa1} price={villa.price} simple={villa.simple} rental={villa.rental} liked={villa.liked} onClick={villa.onClick} />
                ))
              }
            </div>
          </section>
        ) : null
      }
    </div>
  )
}
