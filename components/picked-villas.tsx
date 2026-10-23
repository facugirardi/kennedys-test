import type { NextPage } from "next";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import VillaItem from "./villa-item"
import styles from "./picked-villas.module.css"
import usePropertyStore from "@/store/propertyStore"
import { fetchProperties, resolveMediaUrl, formatNightlyPriceLabel } from "@/lib/utils"
import { usePropertyLikes } from '@/src/hooks/usePropertyLikes'
import { buildRentalDetailPath } from "@/lib/rentalRoute";
import { formatPoolsJacuzziSpecLine } from "@/lib/propertyPoolCounts";

export type PickedVillasType = {
  className?: string;
};

const PickedVillas: NextPage<PickedVillasType> = ({ className = "" }) => {
  const router = useRouter();
  const setSelectedProperty = usePropertyStore((state) => state.setSelectedProperty);
  const [properties, setProperties] = useState<any[]>([]);
  const { isLiked, toggleFavorite, pendingIds } = usePropertyLikes();

    useEffect(() => {
      const getProperties = async () => {
        const properties:any[] = await fetchProperties({ take: 3, rental: true });
        const withMedia = properties.map((property) => ({
          ...property,
          images: Array.isArray(property?.images)
            ? property.images.map((img: any) => ({
                ...img,
                urlImage: resolveMediaUrl(img?.urlImage || img?.url || ""),
              }))
            : [],
        }));
        setProperties(withMedia);
      };
      getProperties();
    }, []);

  const onCardContainerClick = useCallback((id: string) => {
    const property = properties.find((p: any) => p.id === id);
    setSelectedProperty(property);
    router.push(buildRentalDetailPath(property || { id }));
    return;
  }, [router, properties, setSelectedProperty]);
  
  const onViewAllVillasClick = useCallback(() => {
    router.push("/villas/list");
  }, [router]);

  return (
    <section className={[styles.pickedVillas, className].join(" ")}>
      <div className={styles.pickedHeader}>
        <h1 className={styles.pickedForYou}>Picked for you</h1>
        <div className={styles.viewAllVillas} onClick={onViewAllVillasClick}>
          View All Villas
        </div>
      </div>
      <div className={styles.villasGrid}>
        <div className={styles.vuesaxlineararchiveTick}>
          <img
            className={styles.vuesaxlineararchiveTickIcon}
            alt=""
            src="/vuesaxlineararchivetick.svg"
          />
        </div>
        {/* reemplazar por seccion picked for you en cms */}
        {
          properties?.map((property: any, i: number) => {
            return (
              <VillaItem
                key={i}
                title={property?.title || ''}
                country={property?.country || ''}
                capa1="/images/capa-1-4@2x.png"
                price={formatNightlyPriceLabel(property?.price_per_night)}
                bedrooms={property?.classification?.bedrooms}
                guests={property?.classification?.idealPersons || property?.classification?.maxPersons}
                poolsSpecLabel={formatPoolsJacuzziSpecLine(property?.classification)}
                onCardContainerClick={() => onCardContainerClick(property?.id)}
                villaImage={
                  property?.images?.[0]?.urlImage
                    ? property.images[0].urlImage
                    : "/images/villa-placeholder.jpg"
                }
                liked={Boolean(property?.id && isLiked(property.id))}
                onToggleFavorite={property?.id ? () => toggleFavorite(property.id) : undefined}
                isTogglingFavorite={Boolean(property?.id && pendingIds.has(property.id))}

              />
            )
          })
        }
      </div>
    </section>
  );
};

export default PickedVillas;
