import { PriceServiceConnection } from '@pythnetwork/price-service-client';
import { parseUnits, formatUnits } from 'viem';

export const getETHUSDPrice = async () => {
  try {
    // Get the Stable Hermes service URL from https://docs.pyth.network/price-feeds/api-instances-and-providers/hermes
    const connection = new PriceServiceConnection('https://hermes.pyth.network');

    const priceIds = [
      '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace', // ETH/USD price id
    ];

    const currentPrices = await connection.getLatestPriceFeeds(priceIds);
    console.log(currentPrices);
    if (!currentPrices || currentPrices.length === 0) {
      console.log('No price data found');
      return;
    }
    const price = currentPrices[0].getPriceUnchecked();
    const ethUsd = formatUnits(BigInt(price.price), price.expo);
    return ethUsd;
  } catch (error) {
    console.log(error);
    console.log('Error fetching price data');
  }
};
