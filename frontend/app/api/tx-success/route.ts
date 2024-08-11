import {
  FrameRequest,
  FrameValidationData,
  getFrameHtmlResponse,
} from '@coinbase/onchainkit/frame';
import { NextRequest, NextResponse } from 'next/server';
import { NEXT_PUBLIC_URL } from '../../config';
import { createPublicClient, http, fromHex } from 'viem';
import { baseSepolia } from 'viem/chains';
import { getFrameMessage } from 'frames.js';

async function getResponse(req: NextRequest): Promise<NextResponse> {
  const body = await req.json();
  console.log('Body:', body);

  const message = body.untrustedData;

  console.log('Message:', message);

  let state = {
    page: 0,
    type: null,
    amount: 0,
    message: null,
    username: null,
  };

  try {
    if (message.state) {
      state = JSON.parse(decodeURIComponent(message.state));
    }
  } catch (e) {
    console.error(e);
  }

  console.log(state);

  const txId = message.transactionId;

  if (!txId) {
    return new NextResponse('No transaction id', { status: 400 });
  }

  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http('https://sepolia.base.org	'),
  });

  const txReceipt = await publicClient.getTransactionReceipt({
    hash: txId as `0x${string}`,
  });

  const rawData = txReceipt.logs[0].data;
  const tokenId = fromHex(rawData, 'number');

  // TODO: Show the link in the image as well
  return new NextResponse(
    getFrameHtmlResponse({
      buttons: [
        {
          action: 'link',
          label: `Share`,
          target: `${NEXT_PUBLIC_URL}/gc/${tokenId}`,
        },
      ],
      image: {
        src: `${NEXT_PUBLIC_URL}/park-4.png`,
      },
    }),
  );
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
}

export const dynamic = 'force-dynamic';
