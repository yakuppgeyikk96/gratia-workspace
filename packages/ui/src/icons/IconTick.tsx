import React from "react";
import IconComponent from "../interfaces/IconComponent";

export default function IconTick({ color = "#000", size = 14 }: IconComponent) {
  return (
    <svg
      width={size}
      height={size * 0.8125}
      viewBox="0 0 16 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M13.4854 0.439339C14.0606 -0.146446 14.9933 -0.146446 15.5686 0.439339C16.1368 1.01794 16.1437 1.95163 15.5895 2.53894L7.74859 12.5195C7.73727 12.5339 7.72518 12.5476 7.71237 12.5607C7.13712 13.1464 6.20444 13.1464 5.62919 12.5607L0.431442 7.26777C-0.143814 6.68198 -0.143814 5.73223 0.431442 5.14645C1.0067 4.56066 1.93937 4.56066 2.51463 5.14645L6.6264 9.33349L13.4463 0.484209C13.4584 0.46847 13.4715 0.453486 13.4854 0.439339Z"
        fill={color}
      />
    </svg>
  );
}
