const mem = {};
export const provider = {
    name: 'none',
    async queue(mh) {
        mem[mh] = { state: 'confirmed' };
        return mh;
    },
    async status(jobId) {
        return mem[jobId] ?? { state: 'confirmed' };
    },
};
//# sourceMappingURL=none.js.map