const epsilon = 1e-8;
export function layoutDtfTransfers(items, rollWidth = 22, padding = 0.25, optimize = false) {
    if (!Number.isFinite(rollWidth) || rollWidth <= 0 || !Number.isFinite(padding) || padding < 0)
        throw new Error('Invalid DTF roll width or spacing.');
    const valid = items.filter(item => Number.isFinite(item.width) && Number.isFinite(item.height) && item.width > 0 && item.height > 0);
    const keys = [...new Set(valid.map(item => `${item.width}:${item.height}`))];
    const result = (placements, length) => ({
        placements, rollWidth, padding, rollLengthUsed: length, linearInches: length,
        totalTransfers: placements.length, placedTransfers: placements.length,
        rotationUsed: placements.some(item => item.rotated),
    });
    // Keep the unoptimized shelf arrangement as a baseline and the explicit off mode.
    function shelves(oriented) {
        const rows = [];
        const placements = [];
        let length = 0;
        for (const item of [...oriented].filter(item => item.width <= rollWidth).sort((a, b) => b.height - a.height || b.width - a.width)) {
            const footprintW = item.width + padding, footprintH = item.height + padding;
            let row = rows.find(row => row.usedWidth + footprintW <= rollWidth + epsilon);
            if (!row) {
                row = { y: length, height: footprintH, usedWidth: 0 };
                rows.push(row);
                length += footprintH;
            }
            placements.push({ ...item, x: row.usedWidth, y: row.y, footprintW, footprintH });
            row.usedWidth += footprintW;
        }
        return result(placements.sort((a, b) => a.y - b.y || a.x - b.x), length);
    }
    let best = shelves(valid.map(item => ({ ...item, rotated: false })));
    if (!optimize || !valid.length)
        return best;
    function consider(oriented, verticalSplit, byArea, grouped = false) {
        const sorted = oriented.filter(item => item.width <= rollWidth + epsilon).sort((a, b) => byArea ? b.width * b.height - a.width * a.height || b.height - a.height : b.height - a.height || b.width - a.width);
        const shapes = [...new Map(sorted.map(item => [`${item.width}:${item.height}`, { width: item.width + padding, height: item.height + padding }])).values()];
        const spaces = [];
        const placements = [];
        let length = 0;
        const retain = (space) => { if (shapes.some(shape => shape.width <= space.width + epsilon && shape.height <= space.height + epsilon))
            spaces.push(space); };
        let previousShape = "";
        for (const item of sorted) {
            const shape = `${item.width}:${item.height}`;
            if (grouped && shape !== previousShape)
                spaces.length = 0;
            previousShape = shape;
            const footprintW = item.width + padding, footprintH = item.height + padding;
            // Lowest available position first; smaller artwork can stack beside a large print.
            let index = -1;
            for (let i = 0; i < spaces.length; i++)
                if (footprintW <= spaces[i].width + epsilon && footprintH <= spaces[i].height + epsilon && (index < 0 || spaces[i].y < spaces[index].y || (spaces[i].y === spaces[index].y && spaces[i].x < spaces[index].x)))
                    index = i;
            let space;
            if (index < 0) {
                space = { x: 0, y: length, width: rollWidth + padding, height: footprintH };
                length += footprintH;
            }
            else
                space = spaces.splice(index, 1)[0];
            placements.push({ ...item, x: space.x, y: space.y, footprintW, footprintH });
            if (verticalSplit) {
                retain({ x: space.x + footprintW, y: space.y, width: space.width - footprintW, height: space.height });
                retain({ x: space.x, y: space.y + footprintH, width: footprintW, height: space.height - footprintH });
            }
            else {
                retain({ x: space.x + footprintW, y: space.y, width: space.width - footprintW, height: footprintH });
                retain({ x: space.x, y: space.y + footprintH, width: space.width, height: space.height - footprintH });
            }
        }
        if (placements.length > best.totalTransfers || (placements.length === best.totalTransfers && length < best.linearInches - epsilon))
            best = result(placements, length);
    }
    // Compare orientation combinations for the usual front/back/sleeve sizes.
    // Bound the search for unusually varied requests; remaining shapes use row efficiency.
    const varied = keys.filter(key => { const [w, h] = key.split(':').map(Number); return w !== h && w <= rollWidth && h <= rollWidth; }).slice(0, 4);
    for (let mask = 0; mask < 2 ** varied.length; mask++) {
        const oriented = valid.map(item => {
            const index = varied.indexOf(`${item.width}:${item.height}`);
            const across = (w) => Math.floor((rollWidth + padding) / (w + padding));
            const rotate = index >= 0 ? Boolean(mask & (1 << index)) : item.width > rollWidth || (item.height <= rollWidth && (item.width + padding) / Math.max(1, across(item.height)) < (item.height + padding) / Math.max(1, across(item.width)));
            return { ...item, width: rotate ? item.height : item.width, height: rotate ? item.width : item.height, rotated: rotate };
        });
        for (const vertical of [false, true])
            for (const area of [false, true])
                consider(oriented, vertical, area);
        consider(oriented, false, false, true);
    }
    return best;
}
