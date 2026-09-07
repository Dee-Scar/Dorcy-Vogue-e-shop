"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export const AnnouncementMarquee = () => {
  const [announcementText, setAnnouncementText] = useState("PRE-ORDER IS ON GOING ✦ Check Out Our Available Items ✦ ORDER NOW");

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const { data } = await supabase
          .from("cms_settings")
          .select("announcement_text")
          .eq("id", 1)
          .single();
        
        if (data?.announcement_text) {
          setAnnouncementText(data.announcement_text);
        }
      } catch (err) {
        console.error("Error fetching announcement:", err);
      }
    };

    fetchAnnouncement();

    // Refetch when tab becomes visible
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchAnnouncement();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full z-50 bg-[#B78A62] text-white overflow-hidden">
      <div className="marquee-container py-2">
        <div className="marquee-content">
          <span className="marquee-text font-sans text-sm font-semibold tracking-wide">
            {announcementText}
          </span>
          <span className="marquee-text font-sans text-sm font-semibold tracking-wide">
            {announcementText}
          </span>
          <span className="marquee-text font-sans text-sm font-semibold tracking-wide">
            {announcementText}
          </span>
          <span className="marquee-text font-sans text-sm font-semibold tracking-wide">
            {announcementText}
          </span>
        </div>
      </div>

      <style jsx>{`
        .marquee-container {
          width: 100%;
          white-space: nowrap;
        }

        .marquee-content {
          display: inline-block;
          animation: marquee 25s linear infinite;
          padding-left: 100%;
        }

        .marquee-text {
          display: inline-block;
          padding: 0 3rem;
        }

        @keyframes marquee {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(-50%, 0);
          }
        }

        /* Pause on hover */
        .marquee-container:hover .marquee-content {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};
