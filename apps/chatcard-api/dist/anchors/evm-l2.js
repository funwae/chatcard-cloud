export const provider = {
    name: 'evm-l2',
    async queue(mh) {
        // TODO: Implement with ethers.js
        // const provider = new ethers.JsonRpcProvider(process.env.ETH_RPC_URL!);
        // const wallet = new ethers.Wallet(process.env.ETH_PRIVATE_KEY!, provider);
        // const tx = await wallet.sendTransaction({
        //   to: wallet.address,
        //   data: new TextEncoder().encode(mh),
        // });
        // return tx.hash;
        return `evm:${mh}`; // placeholder
    },
    async status(jobId) {
        // TODO: Check transaction status on chain
        // const provider = new ethers.JsonRpcProvider(process.env.ETH_RPC_URL!);
        // const receipt = await provider.getTransactionReceipt(jobId);
        // return { state: receipt ? 'confirmed' : 'posted', txid: jobId };
        return { state: 'posted', txid: jobId };
    },
};
//# sourceMappingURL=evm-l2.js.map