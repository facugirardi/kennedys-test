import type { NextPage } from "next";
import { useCallback, useEffect, useState } from "react";
import VillaItem from "./villa-item"
import { useRouter } from "next/router";
import styles from "./frame-component2.module.css"
import { fetchProperties, resolveMediaUrl, formatNightlyPriceLabel } from "@/lib/utils"
import { usePropertyLikes } from '@/src/hooks/usePropertyLikes'
import { buildRentalDetailPath } from "@/lib/rentalRoute";
import { formatPoolsJacuzziSpecLine } from "@/lib/propertyPoolCounts";

export type FrameComponent2Type = {
  className?: string;
};

const FrameComponent2: NextPage<FrameComponent2Type> = ({ className = "" }) => {
  const router = useRouter();
  const { isLiked, toggleFavorite, pendingIds } = usePropertyLikes();

  const [properties, setProperties] = useState<any[]>([]);

  useEffect(() => {
    const getProperties = async () => {
      const properties: any[] = await fetchProperties({ location: "Mykonos", rental: true, take: 6 });
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

  const onButtonsClick = useCallback(() => {
    router.push("/villas/list?location=Mykonos");
  }, [router]);

  return (
    <section className={[styles.mykonosVillasParent, className].join(" ")}>
      <h1 className={styles.mykonosVillas}>mykonos villas</h1>
      <div className={styles.villas}>{properties?.length} Villas</div>
      <div className={styles.vuesaxlineararchiveTickParent}>
        <div className={styles.vuesaxlineararchiveTick}>
          <img
            className={styles.vuesaxlineararchiveTickIcon}
            alt=""
            src="/vuesaxlineararchivetick.svg"
          />
        </div>
        {/* hacer un map de las propiedades y mostrarlas */}

        {properties?.map((property: any) => (
          <VillaItem
            key={property?.id}
            propBorder="unset"
            propFlex="1"
            propMinWidth="308px"
            villaImage={property?.images?.[0]?.urlImage || "/images/villa-placeholder.jpg"}
            propLeft="340px"
            title={property?.title || ''}
            country={property?.location || property?.country || ''}
            capa1="/images/capa-1-4@2x.png"
            price={formatNightlyPriceLabel(property?.price_per_night)}
            bedrooms={property?.classification?.bedrooms}
            guests={property?.classification?.idealPersons || property?.classification?.maxPersons}
            poolsSpecLabel={formatPoolsJacuzziSpecLine(property?.classification)}
            propDisplay="unset"
            propMinWidth1="unset"
            onCardContainerClick={() => router.push(buildRentalDetailPath(property))}
            liked={Boolean(property?.id && isLiked(property.id))}
            onToggleFavorite={property?.id ? () => toggleFavorite(property.id) : undefined}
            isTogglingFavorite={Boolean(property?.id && pendingIds.has(property.id))}
          />
        ))}
      </div>
      <button className={styles.buttons} onClick={onButtonsClick}>
        <div className={styles.label}>View All Villas in Mykonos</div>
        <img className={styles.vectorIcon} alt="" src="/vector.svg" />
      </button>
      <img
        className={styles.frameChild}
        loading="lazy"
        alt=""
        src="/group-81@2x.png"
      />
    </section>
  );
};

export default FrameComponent2;
