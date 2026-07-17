import type { NextConfig } from 'next';
import createMDX from '@next/mdx';

const nextConfig: NextConfig = {
  /* Guides and docs are authored as .mdx so the prose can be edited without
     touching a component, per the brief's "content lives in easily editable
     places" rule. */
  pageExtensions: ['ts', 'tsx', 'mdx'],
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
