import { getFrameMetadata } from '@coinbase/onchainkit/frame';
import type { Metadata } from 'next';
import { NEXT_PUBLIC_URL } from './config';

const frameMetadata = getFrameMetadata({
  buttons: [
    {
      label: 'Birthday',
    },
    {
      label: 'Christmas',
    },
    {
      label: 'Graduation',
    },
    {
      label: 'Diwali',
    },
    // {
    //   action: 'tx',
    //   label: 'Send Base Sepolia',
    //   target: `${NEXT_PUBLIC_URL}/api/tx`,
    //   postUrl: `${NEXT_PUBLIC_URL}/api/tx-success`,
    // },
  ],
  image: {
    src: `${NEXT_PUBLIC_URL}/park-3.png`, // TODO: Add the initial image
    aspectRatio: '1:1',
  },
  // input: {
  //   text: 'Tell me a story',
  // },
  postUrl: `${NEXT_PUBLIC_URL}/api/frame`,
});

export const metadata: Metadata = {
  title: 'basecards.xyz',
  description: 'Buy gift cards with crypto from a frame',
  openGraph: {
    title: 'basecards.xyz',
    description: 'Buy gift cards with crypto from a frame',
    images: [`${NEXT_PUBLIC_URL}/park-1.png`],
  },
  other: {
    ...frameMetadata,
  },
};

export default function Page() {
  return (
    <>
      <h1>zizzamia.xyz</h1>
    </>
  );
}
