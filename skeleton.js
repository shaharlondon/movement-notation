// The user's skeleton -- defined once, used by every figure.
//
// The idea: the body must look identical in all five figures -- same
// structure, same line weight, same colour. What changes between figures is
// only what gets built around the body (feathers, circles, spirals, cones,
// plates), never the body itself.
//
// The structure always includes: head, shoulder line, pelvis line, a spine
// connecting them, two arms and two legs, and a dot on every joint.
//
// This file computes no points and knows nothing about MediaPipe. Each figure
// maps the landmarks its own way (some go through mirroredPoint, some work
// with numeric indices) and hands over a ready object of screen points.

window.MovementNotation = (function () {

  // The shared style. Changing it here changes all five figures at once.
  const STYLE = {
    boneWidth: 1.5,
    color: '#000',
    jointRadius: 3
  };

  // The point names the skeleton expects. Anything missing is simply not
  // drawn, so a figure can pass a partial set without breaking.
  const JOINTS = [
    'leftEye', 'rightEye',
    'Lsh', 'Rsh', 'Lel', 'Rel', 'Lwr', 'Rwr',
    'Lhip', 'Rhip', 'Lkn', 'Rkn', 'Lank', 'Rank'
  ];

  function mid(a, b) {
    return (a && b) ? { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } : null;
  }

  function line(ctx, a, b) {
    if (!a || !b) return;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }

  function dot(ctx, p, r) {
    if (!p) return;
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Draws the full skeleton. P is an object of screen points keyed by the
  // names in JOINTS. The shoulder midpoint and pelvis midpoint are computed
  // here when not supplied, so no figure has to work them out itself.
  function drawSkeleton(ctx, P, opts) {
    const o = opts || {};
    const width = o.boneWidth || STYLE.boneWidth;
    const color = o.color || STYLE.color;
    const jr = o.jointRadius || STYLE.jointRadius;

    const shouldersMid = P.shouldersMid || mid(P.Lsh, P.Rsh);
    const hipsMid = P.hipsMid || mid(P.Lhip, P.Rhip);

    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.setLineDash([]);

    // Head: a line between the eyes, and a line from the eye to the neck base
    line(ctx, P.leftEye, P.rightEye);
    line(ctx, P.leftEye, shouldersMid);

    // Torso: shoulder line, spine, pelvis line
    line(ctx, P.Lsh, P.Rsh);
    line(ctx, shouldersMid, hipsMid);
    line(ctx, P.Lhip, P.Rhip);

    // Limbs
    line(ctx, P.Lsh, P.Lel);   line(ctx, P.Lel, P.Lwr);
    line(ctx, P.Rsh, P.Rel);   line(ctx, P.Rel, P.Rwr);
    line(ctx, P.Lhip, P.Lkn);  line(ctx, P.Lkn, P.Lank);
    line(ctx, P.Rhip, P.Rkn);  line(ctx, P.Rkn, P.Rank);

    // A black dot on every joint, including the neck base and pelvis centre
    for (const key of JOINTS) dot(ctx, P[key], jr);
    dot(ctx, shouldersMid, jr);
    dot(ctx, hipsMid, jr);

    ctx.restore();
  }

  return { STYLE, JOINTS, drawSkeleton, mid };
})();
