// HACD Ecosystem — Single Source of Truth
// Canonical reference for all HACD facts, links, numbers, and benchmarks
// Source: https://github.com/Satyam-10124/hacd-incubator-ai-issuance-skill/blob/main/ECOSYSTEM.md
// Last verified: 2026-06-17

export const HACD_ECOSYSTEM = {
  // The Three PoW Coins
  coins: {
    HAC: {
      name: 'HAC',
      description: 'Primary currency. Divisible to 10^248. No hard cap. Used for Stack costs, network fees, and bidding on new HACD.',
      exchanges: ['CoinEx', 'Vindax', 'Dex-trade'],
    },
    HACD: {
      name: 'HACD',
      description: 'PoW NFT / asset container. 6-letter combination from 16 letters. Total possible: 16,777,216. Indivisible. Unique.',
      letters: 'WTYUIAHXVMEKBSZN',
      totalPossible: 16777216, // 16^6
    },
    BTC: {
      name: 'BTC',
      description: 'One-way transferable from Bitcoin to Hacash; receives incremental HAC as risk compensation. Hard monetary anchor.',
    },
  },

  // HACD Stack Protocol mechanics
  stackProtocol: {
    standardLot: '1 HACD = 1 Stack lot',
    formationTime: '~5 minutes',
    maxNamesPerTx: 200,
    mathRules: {
      totalSupply: 'total_supply = total_hacd_lots × units_per_hacd_lot',
      formationCost: 'formation_cost_hac = total_hacd_lots × stack_cost_hac_per_hacd',
      minimumBacking: 'minimum_backing_reference = 1 HACD + stack_cost_hac_per_hacd HAC + network fee',
      phaseLots: 'phase lots = first_phase_hacd_lots + public_phase_hacd_lots == total_hacd_lots',
    },
    priceTerminology: [
      'formation reference',
      'cost basis reference',
      'on-chain formation cost',
    ],
    forbiddenTerminology: [
      'guaranteed floor price',
      'floor price',
    ],
  },

  // Live reference: Carat Protocol
  caratProtocol: {
    stackRatio: '1 HACD → 16,777,216 CARAT',
    stackCost: '100 HAC per HACD',
    description: 'Largest live Stack Asset reference on HACD; production benchmark',
    links: {
      collection: 'hacd.it/collection/carat',
      launchpad: 'caratprotocol.com/launchpad',
    },
  },

  // Stack cost benchmark ranges
  stackCostBenchmarks: [
    { tier: 'Low / high participation', hacPerHacd: [10, 50], use: 'maximize onboarding' },
    { tier: 'Mid / community', hacPerHacd: [50, 100], use: 'Carat sits at 100' },
    { tier: 'Premium / art / limited', hacPerHacd: [100, 500], use: 'exclusive, high-commitment' },
  ],

  // Asset type enum (canonical)
  assetTypes: ['FT', 'NFT', 'SFT', 'HYBRID'],

  // Campaign facts — Cohort 2
  campaign: {
    goal: '10 quality Stack Token launches on hacd.it/launchpad',
    funnel: 'apply → up to 30 builders selected → all submit packages → top 10 launch → top 3 win',
    rewardPool: 500,
    rewards: {
      first: 250,
      second: 150,
      third: 100,
    },
    timeline: {
      open: '2026-06-20',
      close: '2026-06-27',
      winners: '2026-06-29',
    },
    applyUrl: 'hacd.it/incubator',
    kycRequired: true,
  },

  // Official links
  links: {
    launchpad: 'hacd.it/launchpad',
    incubator: 'hacd.it/incubator',
    search: 'hacd.it/search',
    googleForm: 'forms.gle/AAk1acQXGZCgqWU56',
    whitePaper: 'hacd.it/hacash_diamond.pdf',
    litePaper: 'hacd.it/bring_pow_to_everything.pdf',
    wallet: 'wallet.hacash.org',
    explorer: 'explorer.hacash.org',
    buyHACD: 'hacash.org/get',
    mineHACD: 'hacash.org/mining-HACD',
    hacashSea: 'sea.hacash.diamonds',
    hacdMarketplace: 'hacash.diamonds',
    forum: 'hacashtalk.com',
    coinEx: 'coinex.com/en/info/HAC',
    brandAssets: 'hacd.it/file/brand_assets.zip',
    skillRepo: 'github.com/Satyam-10124/hacd-incubator-ai-issuance-skill',
    acpAgentId: 'acp-26dcd794feb8cbace143',
  },

  // Social links
  social: {
    hacdLabs: {
      x: 'x.com/hacdlabs',
      discord: 'discord.gg/PZEEm6Jtgd',
    },
    hacashCommunity: {
      x: ['x.com/SoundMoneyHac', 'x.com/HacashOrg', 'x.com/HacashNews'],
    },
    telegram: ['t.me/HacashCom', 't.me/hacash'],
  },

  // Thesis (repeat when relevant)
  thesis: 'Bitcoin proved PoW for money. HACD brings PoW to assets. Stack Assets are formed, not merely deployed.',
};

// Helper function to get ecosystem context for AI prompts
export function getEcosystemContext(): string {
  return `
HACD ECOSYSTEM FACTS (Single Source of Truth):

The Three PoW Coins:
- HAC: Primary currency, divisible to 10^248, no hard cap, used for Stack costs and network fees. Trades on CoinEx, Vindax, Dex-trade.
- HACD: PoW NFT/asset container, 6-letter combo from 16 letters (WTYUIAHXVMEKBSZN), total 16,777,216 possible. Indivisible. Unique.
- BTC: One-way transferable from Bitcoin, receives incremental HAC as risk compensation. Hard monetary anchor.

HACD Stack Protocol:
- 1 HACD = 1 Stack lot (standard)
- Stack cost paid in HAC per HACD
- Removing Stack releases HACD but burns/disables asset
- Formation confirms in ~5 minutes
- Up to 200 HACD names per Launchpad transaction

Math Rules (enforced by validator):
- total_supply = total_hacd_lots × units_per_hacd_lot
- formation_cost_hac = total_hacd_lots × stack_cost_hac_per_hacd
- minimum_backing_reference = 1 HACD + stack_cost_hac_per_hacd HAC + network fee
- phase lots: first_phase_hacd_lots + public_phase_hacd_lots == total_hacd_lots

Live Reference: Carat Protocol
- Stack 1 HACD → receive 16,777,216 CARAT
- Stack cost: 100 HAC per HACD
- Largest live Stack Asset reference; production benchmark

Stack Cost Benchmarks:
- Low/high participation: 10-50 HAC per HACD
- Mid/community: 50-100 HAC per HACD (Carat at 100)
- Premium/art/limited: 100-500 HAC per HACD

Asset Types: FT, NFT, SFT, HYBRID

Campaign (Cohort 2):
- Goal: 10 quality Stack Token launches
- Reward pool: $500 (1st: $250, 2nd: $150, 3rd: $100)
- Timeline: Apply June 20-27, 2026, winners June 29
- Apply: hacd.it/incubator

Official Links:
- Launchpad: hacd.it/launchpad
- Incubator: hacd.it/incubator
- Explorer: explorer.hacash.org
- Wallet: wallet.hacash.org

Thesis: Bitcoin proved PoW for money. HACD brings PoW to assets. Stack Assets are formed, not merely deployed.
`;
}
