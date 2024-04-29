export function request(ctx) {
    ctx.stash.lat = ctx.args.lat;
    ctx.stash.long = ctx.args.long;
    return {};
}

export function response(ctx) {
    return ctx.prev.result;
}