import type { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="13" cy="30" r="4" fill="white" fillOpacity="0.55" />
            <circle cx="30" cy="13" r="4.5" fill="white" />
            <path d="M13 30 Q21 9 30 13" stroke="white" strokeWidth="3" strokeLinecap="round" />
            <circle cx="21" cy="21" r="3" fill="white" fillOpacity="0.85" />
        </svg>
    );
}
