import { FrameRequest, getFrameMessage, getFrameHtmlResponse } from '@coinbase/onchainkit/frame';
import { NextRequest, NextResponse } from 'next/server';
import { NEXT_PUBLIC_URL } from '../../config';

async function getResponse(req: NextRequest): Promise<NextResponse> {
  const body: FrameRequest = await req.json();
  const { isValid, message } = await getFrameMessage(body, { neynarApiKey: 'NEYNAR_ONCHAIN_KIT' });

  if (!isValid) {
    return new NextResponse('Message not valid', { status: 500 });
  }

  let state = {
    page: 0,
    type: null,
    amount: 0,
    message: null,
    username: null,
  };

  try {
    state = JSON.parse(decodeURIComponent(message.state?.serialized));
  } catch (e) {
    console.error(e);
  }

  // /**
  //  * Use this code to redirect to a different page
  //  */
  // if (message?.button === 3) {
  //   return NextResponse.redirect(
  //     'https://www.google.com/search?q=cute+dog+pictures&tbm=isch&source=lnms',
  //     { status: 302 },
  //   );
  // }

  if (state.page === 0) {
    const type =
      message.button === 0
        ? 'Birthday'
        : message.button === 1
          ? 'Christmas'
          : message.button === 2
            ? 'Graduation'
            : 'Diwali';
    return new NextResponse(
      getFrameHtmlResponse({
        buttons: [
          {
            label: `Next`,
          },
        ],
        input: {
          text: `Enter the amount`,
        },
        image: {
          src: `${NEXT_PUBLIC_URL}/park-1.png`,
        },
        postUrl: `${NEXT_PUBLIC_URL}/api/frame`,
        state: {
          page: state?.page + 1,
          type,
        },
      }),
    );
  } else if (state.page === 1) {
    return new NextResponse(
      getFrameHtmlResponse({
        buttons: [
          {
            label: `Next`,
          },
        ],
        input: {
          text: `Enter the message`,
        },
        image: {
          src: `${NEXT_PUBLIC_URL}/park-2.png`,
        },
        postUrl: `${NEXT_PUBLIC_URL}/api/frame`,
        state: {
          page: state?.page + 1,
          type: state?.type,
          amount: message.input,
        },
      }),
    );
  } else if (state.page === 2) {
    return new NextResponse(
      getFrameHtmlResponse({
        buttons: [
          {
            label: `Next`,
          },
        ],
        input: {
          text: `Enter the username`,
        },
        image: {
          src: `${NEXT_PUBLIC_URL}/park-3.png`,
        },
        postUrl: `${NEXT_PUBLIC_URL}/api/frame`,
        state: {
          page: state?.page + 1,
          type: state?.type,
          amount: state?.amount,
          message: message.input,
        },
      }),
    );
  } else if (state.page === 3) {
    const username = message.input;
    return new NextResponse(
      getFrameHtmlResponse({
        buttons: [
          {
            label: `Send a gift card to ${username}`,
            action: 'tx',
            target: `${NEXT_PUBLIC_URL}/api/tx`,
            postUrl: `${NEXT_PUBLIC_URL}/api/tx-success`,
          },
        ],
        image: {
          src: `${NEXT_PUBLIC_URL}/park-4.png`,
        },
        postUrl: `${NEXT_PUBLIC_URL}/api/frame`,
        state: {
          page: state?.page + 1,
          type: state?.type,
          amount: state?.amount,
          message: state?.message,
          username: username,
        },
      }),
    );
  } else {
    return new NextResponse('Invalid page', { status: 500 });
  }
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
}

export const dynamic = 'force-dynamic';
