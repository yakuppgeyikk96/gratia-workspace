import React from "react";
import IconComponent from "../interfaces/IconComponent";

export default function IconX({ color = "#000", size = 14 }: IconComponent) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.99386 7.44804L0 0H4.74756L8.44753 4.6034L12.4004 0.0207268H15.0151L9.71175 6.17632L16 14H11.2666L7.2603 9.02171L2.98317 13.9862H0.354296L5.99386 7.44804ZM11.9565 12.62L2.91105 1.37999H4.0571L13.0912 12.62H11.9565Z"
        fill={color}
      />
    </svg>
  );
}
