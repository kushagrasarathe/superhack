import { FrameRequest, getFrameMessage } from '@coinbase/onchainkit/frame';
import { NextRequest, NextResponse } from 'next/server';
import { encodeFunctionData, parseEther } from 'viem';
import { baseSepolia } from 'viem/chains';

import GiftCardABI from '../../_contracts/GiftCardABI';
import { GIFT_CARD_ADDR } from '../../config';
import type { FrameTransactionResponse } from '@coinbase/onchainkit/frame';
import { getETHUSDPrice } from '../../../utils/pythMethods';

async function getResponse(req: NextRequest): Promise<NextResponse | Response> {
  const body: FrameRequest = await req.json();
  // Remember to replace 'NEYNAR_ONCHAIN_KIT' with your own Neynar API key
  const { isValid, message } = await getFrameMessage(body, { neynarApiKey: 'NEYNAR_ONCHAIN_KIT' });

  if (!isValid) {
    return new NextResponse('Message not valid', { status: 500 });
  }
  const state = JSON.parse(decodeURIComponent(message.state?.serialized));

  if (!state.amount || !state.username || !state.message) {
    return new NextResponse('Invalid state', { status: 400 });
  }

  const eth_usdprice = await getETHUSDPrice();

  const sender = message.address as `0x${string}`;
  const amountInETH = Number(state.amount) / Number(eth_usdprice);
  const amount = parseEther(amountInETH.toString());

  //   --url 'https://api.neynar.com/v1/farcaster/user-by-username?username=0xdhruv&viewerFid=3' \
  //  --header 'accept: application/json' \
  //  --header 'api_key: NEYNAR_API_DOCS'
  const res = await fetch(
    `https://api.neynar.com/v1/farcaster/user-by-username?username=${state.username}`,
    {
      headers: {
        accept: 'application/json',
        api_key: 'NEYNAR_API_DOCS',
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
