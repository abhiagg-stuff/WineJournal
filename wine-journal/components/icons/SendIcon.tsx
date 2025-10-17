import React from 'react';

const SendIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M3.5 4.25l17 7.25-17 7.25 4-7.25-4-7.25zm4 7.25h6"
    />
  </svg>
);

export default SendIcon;
