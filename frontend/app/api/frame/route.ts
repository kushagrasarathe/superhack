import {
  FrameRequest,
  getFrameMessage,
  getFrameHtmlResponse,
  FrameValidationData,
} from '@coinbase/onchainkit/frame';
import { NextRequest, NextResponse } from 'next/server';
import { NEXT_PUBLIC_URL } from '../../config';

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
    state = JSON.parse(decodeURIComponent(message.state));
  } catch (e) {
    console.error(e);
  }

  console.log(state);

  if (state.page === 0) {
    const type =
      message.buttonIndex === 0
        ? 'Birthday'
        : message.buttonIndex === 1
          ? 'Christmas'
          : message.buttonIndex === 2
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
          amount: message.inputText,
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
          message: message.inputText,
        },
      }),
    );
  } else if (state.page === 3) {
    const username = message.inputText;
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
