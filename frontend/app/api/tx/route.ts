import { FrameRequest } from '@coinbase/onchainkit/frame';
import { NextRequest, NextResponse } from 'next/server';
import { encodeFunctionData, parseEther } from 'viem';
import { baseSepolia } from 'viem/chains';

import GiftCardABI from '../../_contracts/GiftCardABI';
import { GIFT_CARD_ADDR } from '../../config';
import type { FrameTransactionResponse, FrameValidationData } from '@coinbase/onchainkit/frame';
import { getETHUSDPrice } from '../../../utils/pythMethods';
import { getFrameFlattened, getFrameMessage } from 'frames.js';

async function getResponse(req: NextRequest): Promise<NextResponse | Response> {
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

  if (!state.amount || !state.username || !state.message) {
    return new NextResponse('Invalid state', { status: 400 });
  }

  const eth_usdprice = await getETHUSDPrice();

  const sender = message.address as `0x${string}`;

  console.log('ETH/USD Price:', eth_usdprice);
  console.log('Amount', state.amount);
  const amountInETH = Number(state.amount) / Number(eth_usdprice);
  console.log('Amount in ETH:', amountInETH);
  const amount = parseEther(amountInETH.toString());

  const res = await fetch(
    `https://api.neynar.com/v1/farcaster/user-by-username?username=${state.username}`,
    {
      headers: {
        accept: 'application/json',
        api_key: 'NEYANR_API_DOCS',
      },
    },
  );

  if (!res.ok) {
    return new NextResponse('Recipient not found', { status: 404 });
  }
  const res_data = await res.json();
  const recepient =
    (res_data.result.user.verifiedAddresses.eth_addresses[0] as `0x${string}`) &&
    (res_data.result.user.custodyAddress as `0x${string}`);

  // TODO: Prepare the NFT Data which contains all the info for that msg , basically , the message, amount and the sender for starter
  const URI = '';

  const data = encodeFunctionData({
    abi: GiftCardABI,
    functionName: 'createGiftCard',
    args: [amount, sender, recepient, URI],
  });

  const txData: FrameTransactionResponse = {
    chainId: `eip155:${baseSepolia.id}`,
    method: 'eth_sendTransaction',
    params: {
      abi: [],
      data,
      to: GIFT_CARD_ADDR,
      value: amount.toString(), // 0.00004 ETH
    },
  };
  return NextResponse.json(txData);
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
}

export const dynamic = 'force-dynamic';
