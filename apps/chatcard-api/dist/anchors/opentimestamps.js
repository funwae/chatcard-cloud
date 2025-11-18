export const provider = {
    name: 'opentimestamps',
    async queue(mh) {
        // TODO: POST to OpenTimestamps bridge; returns job id
        // const r = await fetch(process.env.OTS_URL!, {
        //   method: 'POST',
        //   body: JSON.stringify({ mh }),
        // });
        // const { jobId } = await r.json();
        // return jobId;
        return `ots:${mh}`; // placeholder
    },
    async status(jobId) {
        // TODO: Poll OpenTimestamps bridge for status
        // const r = await fetch(`${process.env.OTS_URL}/${jobId}`);
        // const { state, txid } = await r.json();
        // return { state, txid };
        return { state: 'posted' };
    },
};
//# sourceMappingURL=opentimestamps.js.map