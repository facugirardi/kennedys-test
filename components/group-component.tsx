import type { NextPage } from "next";
import { useMemo, type CSSProperties, useCallback } from "react";
import { useRouter } from "next/router";
import styles from "./group-component.module.css"

export type GroupComponentType = {
  className?: string;
  eventTypeImage?: string;
  private1?: string;
  events?: string;
  experienceExclusivityAsWeRedefi?: string;
  eventTypeIcons?: string;

  /** Style props */
  privateLeft?: CSSProperties["left"];
  eventsWidth?: CSSProperties["width"];
  experienceExclusivityAsHeight?: CSSProperties["height"];
  propLeft?: CSSProperties["left"];
  propWidth?: CSSProperties["width"];
  propWidth1?: CSSProperties["width"];
};

const GroupComponent: NextPage<GroupComponentType> = ({
  className = "",
  privateLeft,
  eventTypeImage,
  eventsWidth,
  experienceExclusivityAsHeight,
  private1,
  events,
  experienceExclusivityAsWeRedefi,
  propLeft,
  propWidth,
  eventTypeIcons,
  propWidth1,
}) => {
  const groupDivStyle: CSSProperties = useMemo(() => {
    return {
      left: privateLeft,
    };
  }, [privateLeft]);

  const groupDiv1Style: CSSProperties = useMemo(() => {
    return {
      width: eventsWidth,
    };
  }, [eventsWidth]);

  const privateEventsStyle: CSSProperties = useMemo(() => {
    return {
      height: experienceExclusivityAsHeight,
    };
  }, [experienceExclusivityAsHeight]);

  const experienceExclusivityAsStyle: CSSProperties = useMemo(() => {
    return {
      left: propLeft,
      width: propWidth,
    };
  }, [propLeft, propWidth]);

  const eventTypeIconsStyle: CSSProperties = useMemo(() => {
    return {
      width: propWidth1,
    };
  }, [propWidth1]);

  const router = useRouter();

  const onGroupContainerClick = useCallback(() => {
    router.push("/concierge");
  }, [router]);

  return (
    <div
      className={[styles.eventTypeImageParent, className].join(" ")}
      onClick={onGroupContainerClick}
      style={groupDivStyle}
    >
      <img
        className={styles.eventTypeImage}
        loading="lazy"
        alt=""
        src={eventTypeImage}
      />
      <div className={styles.privateEventsParent} style={groupDiv1Style}>
        <h2 className={styles.privateEvents} style={privateEventsStyle}>
          <p className={styles.private}>{private1}</p>
          <p className={styles.private}>{events}</p>
        </h2>
        <div
          className={styles.experienceExclusivityAs}
          style={experienceExclusivityAsStyle}
        >
          {experienceExclusivityAsWeRedefi}
        </div>
        <img
          className={styles.eventTypeIcons}
          loading="lazy"
          alt=""
          src={eventTypeIcons}
          style={eventTypeIconsStyle}
        />
      </div>
    </div>
  );
};

export default GroupComponent;
