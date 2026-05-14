import * as Header from '../components/puck/blocks/Header';
import * as Hero from '../components/puck/blocks/Hero';
import * as Grid from '../components/puck/blocks/Grid';
import * as Story from '../components/puck/blocks/Story';
import * as Trust from '../components/puck/blocks/Trust';
import * as Media from '../components/puck/blocks/Media';
import * as Conversion from '../components/puck/blocks/Conversion';
import * as Footer from '../components/puck/blocks/Footer';

export const storefrontRegistry = {
  ...Header,
  ...Hero,
  ...Grid,
  ...Story,
  ...Trust,
  ...Media,
  ...Conversion,
  ...Footer,
};

export function getStorefrontComponent(type: string) {
  return storefrontRegistry[type as keyof typeof storefrontRegistry] ?? null;
}
