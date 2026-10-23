import { getChauffeur } from "@/lib/api/services"

export const getServiceTitle = (type, object) => {
    switch (type) {
        case 'Chauffeur':
            return object?.vehicleModel || object?.name || ''
        case 'Yacht':
            return object?.type || object?.name || ''
        case 'Helicopter':
            return object?.model || object?.name || ''
        case 'Chef':
            return object?.specialty || object?.name || ''
        case 'PrivateJet':
            return object?.model || object?.name || ''
        default:
            return object?.name || object?.title || ''
    }
}


export const getChauffeurDetails = (data) => {
    return {
        images: data?.images,
        title: `${data?.service?.type} in ${data?.serviceName}`,
        overview: data?.overview,
        id: data?.id,
        features: [
            { label: "Seating Capacity", value: data?.seatingCapacity + " Passengers" },
            { label: "Luggage Capacity", value: data?.luggageCapacity + " Pieces" },
            { label: "Seats Type", value: data?.seats },
            { label: "Seating Configuration", value: data?.seatsConfiguration },
            { label: "Baby Seats", value: data?.babySeat + " Available" },
            { label: "Transmission", value: data?.transmission },
            { label: "Vehicle Type", value: data?.vehicleType },
            { label: "Model", value: data?.vehicleModel },
            { label: "Year", value: data?.model },
            { label: "Color", value: data?.color },
            { label: "Ambience Lighting", value: data?.ambience ? "Available" : "Not Available" },
            { label: "Sunroof", value: data?.sunroof ? "Available" : "Not Available" },
            { label: "Air Conditioning", value: data?.airconditioning ? "Available" : "Not Available" },
            { label: "WiFi", value: data?.wifi ? "Available" : "Not Available" },
            { label: "Refrigerator", value: data?.refrigerator ? "Available" : "Not Available" },
            { label: "Charging Ports", value: data?.chargingPorts ? "Available" : "Not Available" },
            { label: "Refreshments", value: data?.refreshments ? "Available" : "Not Available" },
            { label: "Premium Audio", value: data?.premiumAudio ? "Available" : "Not Available" }
        ]
    }
}


export const getServiceOverview = (type) => {
    switch (type) {
        case "Chauffeur": return "Driving on your holidays, think again! For a large number of people driving in general, and driving around unknown roads in specific, constitutes quite an unpleasant challenge. Plus, having your own dedicated chauffeur for your holidays, kind of rocks! Our experienced and always-smiling team of professional drivers can be at your disposal 24/7, making your life as carefree and as stressless as possible. Take your pick from our vast collection of exclusive and VIP vans and vehicles and let our professional chauffeur take care of all the rest. Note that you can book our personal drivers’ services for only 12 hours per day or even less, if that is more to your liking."
        case "Helicopter": return "See the world from a breathtaking new perspective! Our helicopter charter service offers an exhilarating blend of convenience and spectacle, perfect for both business and pleasure. Skip the traffic and travel in style with door-to-door service to your destination. Our modern helicopter fleet, piloted by highly experienced aviators, provides the perfect solution for city transfers, sightseeing tours, or remote location access. Whether you're planning a dramatic entrance to a special event, a scenic tour over stunning landscapes, or need swift transportation to your yacht or private resort, our helicopter service delivers unmatched efficiency with a touch of luxury. Available for both short transfers and extended aerial tours, let us elevate your travel experience – literally!"
        case "Yacht": return "Set sail on your dream maritime adventure! From sun-soaked Mediterranean cruises to exotic Caribbean getaways, our luxury yachts offer the perfect blend of freedom and opulence on the open waters. Each vessel in our fleet combines stunning design with state-of-the-art navigation technology, while our professional crew tends to your every need. Dive into crystal-clear waters, discover secluded beaches, or simply bask in the sunshine on your private deck. Our yachts feature spacious cabins, gourmet galleys, and entertainment areas perfect for both intimate gatherings and grand celebrations. Whether you're planning a day trip along the coast or a week-long ocean voyage, we'll help you chart the course to an unforgettable nautical experience."
        case "Jet": return "Experience the ultimate in sky-high luxury and convenience! Skip the chaos of commercial flights and embrace the freedom of private aviation. Our meticulously maintained fleet of private jets stands ready to whisk you away at a moment's notice. Whether you're planning a business trip, family vacation, or special occasion, our jets offer unparalleled comfort, privacy, and flexibility. No more rigid schedules or lengthy check-ins – you decide when and where to fly. Our experienced flight crew ensures a seamless journey from takeoff to landing, while our luxurious cabin amenities guarantee you arrive refreshed and relaxed. Available for both short hops and intercontinental journeys, our private jet service redefines the meaning of exclusive travel."
        default: ""
    }
}


export const getYachDetails = (data) => {
    return {
        images: data?.images,
        title: `${data?.serviceType} in ${data?.type}`,
        overview: data?.overview,
        id: data?.id,
        features: [
            { label: "Boat Category", value: data?.boatCategory },
            { label: "Type", value: data?.type },
            { label: "Engine Type", value: data?.engine },
            { label: "Length", value: `${data?.lengthMeters}m / ${data?.lengthFeet}ft` },
            { label: "Engines", value: data?.engines },
            { label: "Fuel Type", value: data?.fuel },
            { label: "Cruising Speed", value: data?.cruisingSpeed },
            { label: "Top Speed", value: data?.topSpeed },
            { label: "Beam Overall", value: data?.beamOverall },
            { label: "Hull Number", value: data?.hullNumber },
            { label: "IMO Number", value: data?.imoNumber },
            { label: "Purpose", value: data?.purpose },
            { label: "Cabins", value: data?.cabins },
            { label: "Day Capacity", value: data?.capacityDay },
            { label: "Night Capacity", value: data?.capacityNight },
            { label: "Crew Members", value: data?.crew },
            { label: "Included Services", value: data?.included },
            { label: "Extra Charges", value: data?.extraCharge },
            { label: "Not Included", value: data?.notIncluded },
            { label: "Weather Conditions", value: data?.weatherConditions },
            { label: "Cancellation Policy", value: data?.cancellationPolicy }
        ]
    }
}