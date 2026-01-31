import React from 'react';
import { Helmet } from 'react-helmet-async';

const SeoHead = () => {
    const domain = "https://gallefortwalkingtour.com";
    const title = "Galle Fort Walking Tour | #1 Rated Official Guide Madawa";
    const description = "Experience the best of Galle Fort with Madawa, a top-rated resident guide. Book your exclusive 90-minute heritage walking tour today. Historic sites, local stories & hidden gems.";
    const keywords = "Galle Fort walking tour, Galle tour guide, things to do in Galle, Galle Fort history, Madawa guide Galle, Sri Lanka heritage tour, best walking tour Galle, private tour Galle Fort";
    const image = "https://gallefortwalkingtour.com/og-image.jpg"; // Placeholder, assuming an image will be placed here or exists

    // Structured Data for TouristAttraction / Product
    const schemaData = {
        "@context": "https://schema.org",
        "@type": "TouristAttraction",
        "name": "Galle Fort Walking Tour",
        "description": description,
        "url": domain,
        "image": image,
        "touristType": ["History Buffs", "Culture Lovers", "Families", "Groups"],
        "address": {
            "@type": "PostalAddress",
            "addressLocality": "Galle",
            "addressRegion": "Southern Province",
            "addressCountry": "LK"
        },
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": "6.0328",
            "longitude": "80.2170"
        },
        "provider": {
            "@type": "Person",
            "name": "Madawa Galagedara",
            "jobTitle": "Official National Guide",
            "url": "https://www.tripadvisor.com/Attraction_Review-g297896-d27158137-Reviews-Madawa_Galagedara-Galle_Galle_District_Southern_Province.html"
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "5.0",
            "reviewCount": "250",
            "bestRating": "5",
            "worstRating": "1"
        },
        "offers": {
            "@type": "Offer",
            "name": "Galle Fort Walking Tour Ticket",
            "price": "12.00",
            "priceCurrency": "USD",
            "priceValidUntil": "2026-12-31",
            "url": domain,
            "availability": "https://schema.org/InStock",
            "validFrom": "2024-01-01"
        },
        "priceRange": "$12 - $40",
        "awards": ["TripAdvisor Certificate of Excellence", "Top Rated Guide Galle"]
    };

    return (
        <Helmet>
            {/* Basic Meta Tags */}
            <title>{title}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />
            <link rel="canonical" href={domain} />
            <meta name="robots" content="index, follow" />
            <meta name="author" content="Madawa Galagedara" />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={domain} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />
            <meta property="og:site_name" content="Galle Fort Walking Tour" />
            <meta property="og:locale" content="en_US" />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={domain} />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />

            {/* Structured Data */}
            <script type="application/ld+json">
                {JSON.stringify(schemaData)}
            </script>
        </Helmet>
    );
};

export default SeoHead;
