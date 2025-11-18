export function getAnchorProvider(kind) {
    switch (kind) {
        case 'opentimestamps':
            return require('./opentimestamps.js').provider;
        case 'evm-l2':
            return require('./evm-l2.js').provider;
        default:
            return require('./none.js').provider;
    }
}
//# sourceMappingURL=index.js.map