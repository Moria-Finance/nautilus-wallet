<template>
  <div class="flex flex-col h-full gap-4">
    <dapp-plate :origin="origin" :favicon="favicon" compact />
    <h1 class="text-xl m-auto text-center">
      <template
        v-if="operation === 'signTxInputs' && inputsToSign !== undefined && inputsToSign.length > 0"
        >Wants to partially sign a transaction</template
      >
      <template v-else>Wants to sign a transaction</template>
    </h1>
    <tx-sign-view
      :transaction="rawTx"
      :inputs-to-sign="inputsToSign"
      :public-hint-bag="publicHintBag"
      :operation="operation"
      @fail="onFail"
      @refused="onRefused"
      @success="onSuccess"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapState } from "vuex";
import { rpcHandler } from "@/background/rpcHandler";
import { find, isEmpty } from "lodash";
import { ErgoTx, SignError, SignErrorCode, UnsignedTx } from "@/types/connector";
import DappPlate from "@/components/DappPlate.vue";
import { ACTIONS } from "@/constants/store";
import { connectedDAppsDbService } from "@/api/database/connectedDAppsDbService";
import TxSignView from "@/components/TxSignView.vue";
import { TransactionHintsBag } from "ergo-lib-wasm-browser";

export default defineComponent({
  name: "SignTxConfirmView",
  components: {
    DappPlate,
    TxSignView
  },
  async created() {
    const message = find(
      rpcHandler.messages,
      (m) => m.function === "signTx" || m.function === "signTxInputs" || m.function === 'commitment' || m.function === 'multi'
    );
    if (!message || !message.params) {
      return;
    }

    this.sessionId = message.sessionId;
    this.requestId = message.requestId;
    this.origin = message.params[0];
    this.favicon = message.params[1];
    this.rawTx = Object.freeze(message.params[2]);
    if (message.function === "signTxInputs") {
      this.operation = "signTxInputs";
      this.inputsToSign = message.params[3];
    } else if(message.function === "signTx") {
      this.operation = "signTx";
    } else if(message.function === "commitment"){
      this.operation = "commitment";
    } else if(message.function === "multi"){
      const hints = TransactionHintsBag.from_json(message.params[3]);
      this.operation = "multi";
      this.publicHintBag = Object.freeze(hints);
    }

    const connection = await connectedDAppsDbService.getByOrigin(this.origin);
    if (!connection) {
      window.close();
      return;
    }

    this.currentWalletId = connection.walletId;
    window.addEventListener("beforeunload", this.onWindowClosing);
  },
  data() {
    return {
      rawTx: Object.freeze({} as UnsignedTx),
      operation: "signTx" as "signTx" | "signTxInputs" | "commitment" | "multi",
      currentWalletId: 0,
      requestId: 0,
      sessionId: 0,
      origin: "",
      favicon: "",
      inputsToSign: [] as number[],
      publicHintBag: Object.freeze({} as TransactionHintsBag)
    };
  },
  watch: {
    ["loading.wallets"]: {
      immediate: true,
      async handler(loading: boolean) {
        this.setWallet(loading, this.currentWalletId);
      }
    },
    currentWalletId: {
      immediate: true,
      async handler(walletId: number) {
        this.setWallet(this.loading.wallets, walletId);
      }
    },
    rawTx() {
      this.loadAssetInfo(
        this.rawTx.inputs
          .filter((x) => x.assets)
          .map((x) => x.assets)
          .flat()
          .map((x) => x.tokenId)
      );
    }
  },
  computed: {
    ...mapState({ wallets: "wallets", loading: "loading" })
  },
  methods: {
    async setWallet(loading: boolean, walletId: number) {
      if (loading || walletId === 0) {
        return;
      }
      this.$store.dispatch(ACTIONS.SET_CURRENT_WALLET, walletId);
    },
    async loadAssetInfo(tokenIds: string[]) {
      if (isEmpty(tokenIds)) {
        return;
      }

      this.$store.dispatch(ACTIONS.LOAD_ASSETS_INFO, tokenIds);
    },
    onSuccess(signedTx: ErgoTx) {
      rpcHandler.sendMessage({
        type: "rpc/nautilus-response",
        function: this.operation,
        sessionId: this.sessionId,
        requestId: this.requestId,
        return: {
          isSuccess: true,
          data: signedTx
        }
      });

      window.removeEventListener("beforeunload", this.onWindowClosing);
      window.close();
    },
    onRefused(info: string) {
      this.sendError({ code: SignErrorCode.UserDeclined, info });
    },
    onFail(info: string) {
      this.sendError({ code: SignErrorCode.ProofGeneration, info });
    },
    sendError(error: SignError) {
      window.removeEventListener("beforeunload", this.onWindowClosing);
      rpcHandler.sendMessage({
        type: "rpc/nautilus-response",
        function: this.operation,
        sessionId: this.sessionId,
        requestId: this.requestId,
        return: {
          isSuccess: false,
          data: error
        }
      });
      window.close();
    },
    onWindowClosing() {
      this.onRefused("unauthorized");
    }
  }
});
</script>
