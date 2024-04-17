import React from 'react';

const Spinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0)' }}>
    <svg
      width="50"
      height="50"
      viewBox="0 0 50 50"
      xmlns="http://www.w3.org/2000/svg"
      stroke="#fff"
    >
      <g fill="none" fillRule="evenodd">
        <g transform="translate(1 1)" strokeWidth="2">
          <path d="M6 23 L6 27" strokeOpacity=".1">
            <animate
              attributeName="d"
              values="M6 13 L6 37; M6 13 L6 37; M6 13 L6 37"
              dur="1s"
              repeatCount="indefinite"
            />
          </path>
          <path d="M18 23 L18 27" strokeOpacity=".1">
            <animate
              attributeName="d"
              values="M18 13 L18 37; M18 13 L18 37; M18 13 L18 37"
              dur="1s"
              repeatCount="indefinite"
            />
          </path>
          <path d="M30 23 L30 27" strokeOpacity=".5">
            <animate
              attributeName="d"
              values="M30 13 L30 37; M30 13 L30 37; M30 13 L30 37"
              dur="1s"
              repeatCount="indefinite"
            />
          </path>
        </g>
      </g>
    </svg>
  </div>
);

export default Spinner;
