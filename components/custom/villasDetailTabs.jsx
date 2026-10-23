import React, { useState, useEffect } from 'react';

const UnderlineTabs = ({ tabs, initialTab = 0 }) => {
    const [activeTab, setActiveTab] = useState(initialTab);
    const [isMounted, setIsMounted] = useState(false);

    // Handle client-side mounting
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Don't render content until client-side
    if (!isMounted) {
        return null;
    }

    return (
        <div className="tabs-container">
            <div className="tabs-header">
                {tabs.map((tab, index) => (
                    <button
                        key={index}
                        className={`tab-button ${activeTab === index ? 'active' : ''}`}
                        onClick={() => setActiveTab(index)}
                    >
                        {tab?.label}
                    </button>
                ))}
            </div>

            <div className="tab-content">
                {tabs[activeTab]?.content}
            </div>

            <style>{`
        .tabs-container {
              width: 100%;
            max-height: 390px;
            max-width: 1200px;
            margin: 0 auto;
            border: 1px solid #E5E7EB;
            padding: 4rem;
        }

        .tabs-header {
          display: flex;
          gap: 32px;
          border-bottom: 1px solid #E5E7EB;
          margin-bottom: 24px;
        }

        .tab-button {
          position: relative;
          padding: 8px 0;
          background: none;
          border: none;
          font-size: 16px;
          color: #9CA3AF;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .tab-button:hover {
          color: #4B5563;
        }

        .tab-button::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          width: 100%;
          height: 2px;
          background-color: transparent;
          transition: background-color 0.3s ease;
        }

        .tab-button.active {
          color: #f4a641;
        }

        .tab-button.active::after {
          background-color: #f4a641;
        }

        .tab-content {
          padding: 20px 0;
          opacity: 1;
          transition: opacity 0.3s ease;
              overflow: auto;
    max-height: 350px;
        }

        .tab-content h4 {
            font-size: 20px;
            margin: 0px;  
        }

        .tab-content li, .tab-content ul {
                font-size: 18px;
        }
      `}</style>
        </div>
    );
};

// Example usage component
const PropertyDetailsTabs = ({ property }) => {
    const tabs = [
        {
            label: "Square Footage",
            content: (
                <div>
                    <h3>Square Footage</h3>
                    <p>Interior: {property?.classification?.indoorArea || 0} sqm | Exterior: {property?.classification?.outdoorArea || 0} sqm | Total: {(property?.classification?.indoorArea || 0) + (property?.classification?.outdoorArea || 0)} sqm</p>
                </div>
            )
        },
        {
            label: "Complimentary services",
            content: (
                <div className="text-sm md:text-base text-[#506A70] font-haas">
                    <h3 className="text-lg font-gtsuper-ds font-semibold text-[#172338] mb-3">Services included with this booking:</h3>
                    <p className="text-lg font-gtsuper-ds font-semibold text-[#172338] mb-2">Daily</p>
                    <ul className="space-y-2 list-disc list-inside">
                        {property?.classification?.includedServices?.map((e, i) => <li key={i} className="text-sm md:text-base text-[#506A70] font-haas">{e}</li>)}
                    </ul>
                    <p className="text-lg font-gtsuper-ds font-semibold text-[#172338] mb-2 mt-4">At an additional cost:</p>
                    <ul className="space-y-2 list-disc list-inside">
                        <li className="text-sm md:text-base text-[#506A70] font-haas">{property?.classification?.extraServices}</li>
                    </ul>
                </div>
            )
        },
        property?.extraInfo && {
            label: "Need to Know",
            content: (
                <div>
                    <h3>Need to Know Information</h3>
                    {property?.extraInfo}
                </div>
            )
        }
    ];

    return <UnderlineTabs tabs={tabs} initialTab={0} />;
};

export default PropertyDetailsTabs;