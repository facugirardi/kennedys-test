export const mockProperties = [
  {
    id: '1',
    title: 'Villa Paradise',
    location: 'Mykonos, Greece',
    country: 'Greece',
    price_per_night: 2500,
    classification: {
      bedrooms: 5,
      maxPersons: 10,
      pools: [{ id: '1', name: 'Main Pool' }]
    },
    images: [
      { urlImage: '/images/villa-detail@2x.png' }
    ]
  },
  {
    id: '2',
    title: 'Ocean View Villa',
    location: 'Santorini, Greece',
    country: 'Greece',
    price_per_night: 1800,
    classification: {
      bedrooms: 4,
      maxPersons: 8,
      pools: [{ id: '1', name: 'Infinity Pool' }]
    },
    images: [
      { urlImage: '/images/image-23@2x.png' }
    ]
  },
  {
    id: '3',
    title: 'Luxury Beach House',
    location: 'Ibiza, Spain',
    country: 'Spain',
    price_per_night: 3200,
    classification: {
      bedrooms: 6,
      maxPersons: 12,
      pools: [
        { id: '1', name: 'Main Pool' },
        { id: '2', name: 'Jacuzzi' }
      ]
    },
    images: [
      { urlImage: '/images/image-19@2x.png' }
    ]
  },
  {
    id: '4',
    title: 'Mountain Retreat',
    location: 'Swiss Alps, Switzerland',
    country: 'Switzerland',
    price_per_night: 1500,
    classification: {
      bedrooms: 3,
      maxPersons: 6,
      pools: []
    },
    images: [
      { urlImage: '/images/group-197@2x.png' }
    ]
  },
]
