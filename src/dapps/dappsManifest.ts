type DAppManifestIcon = {
  name: string;
  source: "mdi" | "file";
  color?: string;
};

export type DAppManifestItem = {
  name: string;
  icon: DAppManifestIcon;
  path: string;
};

export const dappsManifest: DAppManifestItem[] = [
  {
    name: "Babel Fees Liquidity",
    icon: { name: "chess-rook", source: "mdi", color: "text-yellow-500" },
    path: "dapps/babel-fees"
  },
  {
    name: "Decentralized Grid Bots",
    icon: { name: "robot-outline", source: "mdi", color: "text-blue-gray-500" },
    path: "dapps/grid-bots"
  },
  {
    name: "UTxO Consolidation",
    icon: { name: "consolidate", source: "mdi", color: "text-purple-500" },
    path: "dapps/consolidate"
  },
  {
    name: "Token Burning Tool",
    icon: { name: "fire", source: "mdi", color: "text-red-500" },
    path: "dapps/burn"
  },
  {
    name: "SigmaBonds",
    icon: { name: "widgets-outline", source: "mdi", color: "text-blue-500" },
    path: "dapps/sigma-bonds"
  }
];
