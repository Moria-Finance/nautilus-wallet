import BigNumber from "bignumber.js";
import { ErgoBox, UnsignedTx } from "./connector";
import { LedgerDeviceModelId } from "@/constants/ledger";
import { TransactionHintsBag } from "ergo-lib-wasm-browser";

export enum AddressState {
  Used,
  Unused
}

export enum WalletType {
  Standard,
  ReadOnly,
  Ledger
}

export enum Network {
  ErgoMainnet,
  ErgoTestnet
}

export enum AddressType {
  P2PK,
  P2SH,
  P2S
}

export enum AssetStandard {
  Native = "Native",
  EIP4 = "EIP-004",
  Unstandardized = "Unstandardized"
}

export enum AssetType {
  Unknown = "00",
  NFT = "01",
  MembershipToken = "02"
}

export enum AssetSubtype {
  PictureArtwork = "0101",
  AudioArtwork = "0102",
  VideoArtwork = "0103",
  ThresholdSignature = "0201"
}

export type StateAddress = {
  script: string;
  state: AddressState;
  index: number;
  balance?: StateAsset[];
};

export type WalletSettings = {
  avoidAddressReuse: boolean;
  hideUsedAddresses: boolean;
  defaultChangeIndex: number;
};

export type StateWallet = {
  id: number;
  name: string;
  type: WalletType;
  publicKey: string;
  extendedPublicKey: string;
  addresses?: AddressType[];
  settings: WalletSettings;
};

export type StateAsset = {
  tokenId: string;
  confirmedAmount: BigNumberType;
  unconfirmedAmount?: BigNumberType;
  info?: BasicAssetInfo;
};

export type BasicAssetInfo = {
  name?: string;
  decimals?: number;
  type?: AssetSubtype;
  artworkUrl?: string;
};

export type StateAssetInfo = {
  [tokenId: string]: BasicAssetInfo;
};

export type BigNumberType = Omit<BigNumber, "_isBigNumber">;

export type FeeSettings = {
  tokenId: string;
  readonly value: BigNumberType;
  readonly nanoErgsPerToken?: BigNumberType;
  readonly assetInfo?: BasicAssetInfo;
  box?: ErgoBox;
};

export type SignTxCommand = {
  tx: UnsignedTx;
  inputsToSign?: number[];
  walletId: number;
  password: string;
  callback?: (newState: Partial<SigningState>) => void;
};

export type SignMultiTxCommand = {
  tx: UnsignedTx;
  inputsToSign?: number[];
  publicHintBag: TransactionHintsBag,
  walletId: number;
  password: string;
  callback?: (newState: Partial<SigningState>) => void;
};

export type SignEip28MessageCommand = {
  message: string;
  address: string;
  origin: string;
  walletId: number;
  password: string;
};

export type Eip28SignedMessage = {
  signedMessage: string;
  proof: string;
};

export type UpdateWalletSettingsCommand = {
  walletId: number;
  name: string;
  avoidAddressReuse: boolean;
  hideUsedAddresses: boolean;
  devMode: boolean;
};

export type UpdateChangeIndexCommand = {
  walletId: number;
  index: number;
};

export const enum ProverStateType {
  success,
  error,
  busy,
  unavailable
}

export type ProverDeviceState = {
  model: LedgerDeviceModelId;
  appId: number;
  connected: boolean;
  screenText?: string;
};

export type SigningState = {
  statusText: string;
  type?: ProverStateType;
  device?: ProverDeviceState;
};

export type TransactionBuilderFunction = () => Promise<UnsignedTx>;

// eslint-disable-next-line @typescript-eslint/ban-types
export type Prettify<T> = { [K in keyof T]: T[K] } & {};

export type UpdateUsedAddressesFilterCommand = {
  walletId: number;
  filter: boolean;
};
