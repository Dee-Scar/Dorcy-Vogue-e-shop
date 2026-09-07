"use client";

import React from "react";

export const AnnouncementMarquee = () => {
  return (
    <div className="fixed top-0 left-0 w-full z-50 bg-[#B78A62] text-white overflow-hidden">
      <div className="marquee-container py-2">
        <div className="marquee-content">
          <span className="marquee-text font-sans text-sm font-semibold tracking-wide">
            PRE-ORDER IS ON GOING ✦ Check Out Our Available Items ✦ ORDER NOW
          </span>
          <span className="marquee-text font-sans text-sm font-semibold tracking-wide">
            PRE-ORDER IS ON GOING ✦ Check Out Our Available Items ✦ ORDER NOW
          </span>
          <span className="marquee-text font-sans text-sm font-semibold tracking-wide">
            PRE-ORDER IS ON GOING ✦ Check Out Our Available Items ✦ ORDER NOW
          </span>
          <span className="marquee-text font-sans text-sm font-semibold tracking-wide">
            PRE-ORDER IS ON GOING ✦ Check Out Our Available Items ✦ ORDER NOW
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
