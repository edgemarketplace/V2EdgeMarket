import * as Header from '../../src/components/puck/blocks/Header';
import * as Hero from '../../src/components/puck/blocks/Hero';
import * as Grid from '../../src/components/puck/blocks/Grid';
import * as Story from '../../src/components/puck/blocks/Story';
import * as Trust from '../../src/components/puck/blocks/Trust';
import * as Media from '../../src/components/puck/blocks/Media';
import * as Conversion from '../../src/components/puck/blocks/Conversion';
import * as Footer from '../../src/components/puck/blocks/Footer';

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
