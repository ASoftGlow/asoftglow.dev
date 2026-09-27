// @ts-check
/**
 * @typedef {[number, number]} ColorPair
 * @typedef {[number, number, number]} Color
 * @typedef {number} PackedColor
 * @typedef {{
 *   long_face: boolean,
 *   long_tail: boolean,
 *   eyes_type: number,
 *   eyes_offset: number,
 *   ear_heights: [number, number],
 *   pattern?: number,
 *   pattern_transformation?: [number, number],
 *   colorpoint_color?: Color,
 *   eye_colors: [Color, Color],
 *   ear_color: Color,
 *   nose_color: Color,
 *   main_fur_color: Color,
 *   sub_fur_color: Color
 * }} CatParams
 */

/** @type {ImageDataSettings} */
const IMAGE_DATA_SETTINGS = {
  colorSpace: "srgb",
  pixelFormat: "rgba-unorm8"
};

const MAIN_FUR_COLOR = packColor(255,0,0);
const COLORPOINT_COLOR = packColor(0,255,200);
/** @type {ColorPair[]} */
const EAR_COLORS = [[255,255],[100,200],[150,240]];
/** @type {ColorPair[]} */
const COLORPOINT_COLORS = [[10,25],[0,255],[245,255]];
/** @type {[ColorPair, ColorPair, ColorPair][]} */
const FUR_COLORS = [
  [[16, 30], [85,100],[38,66]], // ginger
  [[220,245],[3,15],  [4,14]],  // black
  [[200,230],[0,12],  [20,70]], // gray
  [[200,230],[0,12],  [70,85]], // white
  [[18,24],  [40,100],[7,18]],  // brown
  [[28,30],  [30,50] ,[35,55]]  // sandstone
];
/** @type {ColorPair[]} */
const FUR_COLOR_PAIRS = [
  [0,3],[1,3],[2,3],[4,3],[5,3],[4,5], [0,0],[1,1],[2,2],[3,3],[4,4],[5,5]
];
/** @type {number[]} */
const FUR_COLOR_PAIR_WEIGHTS = [25,40,45,40,35,30, 20,45,50,65,50,30];
/** @type {[number, boolean][]} */
const FUR_COLOR_PAIR_ORDER_CHANCES = [
  [1,false],[2,true],[1,false],[2,true],[2,false],[2,true],
  [0,false],[0,false],[0,false],[0,false],[0,false],[0,false]
];

const IMAGES_BASE = "/images/cat-generator/inputs/";
const BASE_SIZES = [16, 24, 24];
const BASE_IMAGE_NAMES = ["b1.png", "b2.png", "b3.png"];
const PATTERN_IMAGE_NAMES = ["p1.png", "p3.png", "p4.png"];
const EYE_IMAGE_NAMES = ["e1.png", "e2.png", "e3.png", "e4.png"];
const TAIL_IMAGE_NAMES = ["t1.png"];
const EAR_IMAGE_NAMES = ["er1.png", "er1_1.png", "er1_2.png"];

/** @type {HTMLImageElement[][]} */
let [base_images, pattern_images, eye_images, tail_images, ear_images] = [];
/** @type {HTMLImageElement} */
let b1_2_image;

/**
 * @param {string} name
 * @returns {Promise<HTMLImageElement>}
 */
async function loadImage(name) {
  const img = new Image();
  img.src = IMAGES_BASE + name;
  return new Promise((resolve) => {
    img.onload = () => resolve(img);
  });
}

export async function loadImages() {
  base_images = await Promise.all(BASE_IMAGE_NAMES.map(loadImage));
  pattern_images = await Promise.all(PATTERN_IMAGE_NAMES.map(loadImage));
  eye_images = await Promise.all(EYE_IMAGE_NAMES.map(loadImage));
  tail_images = await Promise.all(TAIL_IMAGE_NAMES.map(loadImage));
  ear_images = await Promise.all(EAR_IMAGE_NAMES.map(loadImage));
  b1_2_image = await loadImage("b1_2.png");
}

/**
 * @param {number} max
 * @returns {number}
 */
function randi(max) {
  return Math.floor(Math.random() * (max + 1));
}

/**
 * @template T
 * @param {T[]} arr
 * @returns {T}
 */
function rande(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Random integer in (min, max)
 *
 * @param {number} min exclusive
 * @param {number} max exclusive
 * @returns {number} integer
 */
function randir(min, max) {
  return Math.floor(Math.random() * (max + 1 - min)) + min;
}

/**
 * Random weight
 *
 * @param {number[]} weights
 * @returns {number} index
 */
function randw(weights) {
  const weight_totel = weights.reduce((sum, w) => sum += w, 0);
  const r = randi(weight_totel);
  let sum = 0;
  let i = -1;
  do {
    sum += weights[++i];
  } while (sum < r);
  return i;
}

/**
 * Random color with components in ranges
 *
 * @param {ColorPair} r
 * @param {ColorPair} g
 * @param {ColorPair} b
 * @returns {Color}
 */
function randcr(r, g, b) {
  return [randir(...r), randir(...g), randir(...b)];
}

/**
 * Random monochrome color in range
 *
 * @param {ColorPair} b brightness
 * @returns {Color}
 */
function randcrm(b) {
  const v = randir(...b);
  return [v, v, v];
}

/**
 * @see https://en.wikipedia.org/wiki/HSL_and_HSV#HSL_to_RGB_alternative
 * @param {Color} hsl
 * @returns {Color}
 */
function HSLtoRGB(hsl) {
  /**
   * @param {number} n
   * @returns {number}
   */
  function f(n) {
    const L = hsl[2] / 100;
    const k = (n + hsl[0] / 30) % 12;
    const a = hsl[1] / 100 * Math.min(L, 1 - L);
    return Math.floor((L - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))) * 255);
  }

  return [f(0), f(8), f(4)];
}

/**
 * What is this logic? I don't know either.
 *
 * @param {Color} c1 subject
 * @param {Color} c2 reference 1
 * @param {Color} c3 reference 2
 * @returns {[number, number, number, number]}
 */
function contrastColors(c1, c2, c3) {
  return [
    Math.abs(c1[0]-c2[0])+Math.abs(c1[1]-c2[1])+Math.abs(c1[2]-c2[2]),
    Math.abs(c1[0]-c3[0])+Math.abs(c1[1]-c3[1])+Math.abs(c1[2]-c3[2]),
    Math.abs((c1[0]+c1[1]+c1[2])-(c2[0]+c2[1]+c2[2])),
    Math.abs((c1[0]+c1[1]+c1[2])-(c3[0]+c3[1]+c3[2]))
  ];
}

/**
 * @param {Color} main_fur_color
 * @param {Color} sub_fur_color
 * @returns {Color}
 */
function randEyeColor(main_fur_color, sub_fur_color) {
  for (let i = 0; i < 8; i++) {
    const hc = randcr([20,255], [50,100], [14,50]);
    const c = HSLtoRGB(hc);
    const [c1, c2, c3, c4] = contrastColors(c, main_fur_color, sub_fur_color);
    if (c1 > 220 || c2 > 190 || c3 > 50 || c4 > 30) return c;
  }
  return [0,0,0];
}

/**
 * @returns {[Color, Color]} [main, sub]
 */
function randFurColors() {
  const i = randw(FUR_COLOR_PAIR_WEIGHTS);
  const mw = FUR_COLOR_PAIR_ORDER_CHANCES[i];
  let p = FUR_COLOR_PAIRS[i];

  if (randi(mw[0])===0 && mw[1]) {
    p = [p[1], p[0]];
  }
  return [
    HSLtoRGB(randcr(...FUR_COLORS[p[0]])),
    HSLtoRGB(randcr(...FUR_COLORS[p[1]]))
  ];
}

/**
 * @returns {CatParams}
 */
export function makeCat() {
  /** @type {CatParams} */
  const p = {
    long_face: randi(5)===0,
    long_tail: randi(3)===0,
    eyes_type: randi(19)===0 ? 3 : randi(1) + 1,
    eyes_offset: 0,
    ear_heights: [0, 0],

    nose_color: randcr([255,255], [100,200], [150,240]),
    ear_color: randcrm(rande(EAR_COLORS)),
  };

  if (p.long_face && randi(5)===0) p.eyes_offset = -1;
  if (randi(3)===0) p.ear_heights = [randi(1), randi(1)];
  if (randi(3) > 0) {
    p.pattern = randi(2);
    p.pattern_transformation = [randi(1) ? 1 : -1, randi(1) ? 1 : -1];
  }

  [p.main_fur_color, p.sub_fur_color] = randFurColors();
  if (randi(4)===0) {
    p.colorpoint_color = randcrm(rande(COLORPOINT_COLORS));
    if (randi(1)) p.ear_color = p.colorpoint_color;
  }
  if (randi(5)===0) {
    p.eye_colors = [
      randEyeColor(p.main_fur_color, p.sub_fur_color),
      HSLtoRGB(randcr([210,230], [60,100], [20,60]))
    ]
    if (randi(1)) p.eye_colors.reverse();
  } else {
    let e = randEyeColor(p.main_fur_color, p.sub_fur_color);
    p.eye_colors = [e, e];
  }

  return p;
}

/**
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @returns {PackedColor}
 */
function packColor(r, g, b) {
  return r + (g << 8) + (b << 16);
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {CatParams} p
 * @param {number} base
 * @returns {void}
 */
export function drawCat(ctx, p, base) {
  let size = BASE_SIZES[base];
  ctx.reset();
  ctx.canvas.width = size;
  ctx.canvas.height = size;

  // base
  ctx.drawImage(base_images[base], 0, 0);
  if (p.long_face) {
    ctx.drawImage(b1_2_image, 0, -1);
  }

  // eyes
  ctx.drawImage(eye_images[p.eyes_type], 0, p.eyes_offset);

  // ears
  if (p.ear_heights[0] + p.ear_heights[1] !== 0) {
    let ears_img = ear_images[0];
    if (p.ear_heights[0] + p.ear_heights[1] !== 2) {
      ears_img = ear_images[p.ear_heights[0] + 1];
    }

    ctx.drawImage(ears_img, 0, p.long_face ? -2 : -1);
  }

  // tail
  if (p.long_tail && base===1) {
    ctx.drawImage(tail_images[0], 0, 0);
  }

  // pattern
  if (p.pattern !== undefined && p.pattern_transformation) {
    let d = ctx.getImageData(0, 0, size, size, IMAGE_DATA_SETTINGS).data;

    let oc_ctx = new OffscreenCanvas(size, size).getContext("2d");
    if (!oc_ctx) throw new Error("Offscreen canvas failed");

    oc_ctx.scale(...p.pattern_transformation);
    oc_ctx.drawImage(pattern_images[p.pattern],
      p.pattern_transformation[0] < 0 ? -size : 0,
      p.pattern_transformation[1] < 0 ? -size : 0);

    let p_d = oc_ctx.getImageData(0, 0, size, size, IMAGE_DATA_SETTINGS).data;

    for (let i = 0; i < d.length; i += 4) {
      let c = packColor(d[i + 0], d[i + 1], d[i + 2]);
      if ((c===MAIN_FUR_COLOR || (p.colorpoint_color===undefined && c===COLORPOINT_COLOR))
        && p_d[i + 3]===255) {

        d[i + 0] = p_d[i + 0];
        d[i + 1] = p_d[i + 1];
        d[i + 2] = p_d[i + 2];
      }
    }

    ctx.putImageData(new ImageData(d, size, size), 0, 0);
  }

  // colors
  /** @type {Record<PackedColor, Color>} */
  let lookup = {}
  lookup[packColor(100,0,255)] = p.eye_colors[0];
  lookup[packColor(10,0,255)]  = p.eye_colors[1];
  lookup[packColor(255,255,0)] = p.ear_color;
  lookup[MAIN_FUR_COLOR]       = p.main_fur_color;
  lookup[packColor(127,0,0)]   = p.sub_fur_color;
  lookup[COLORPOINT_COLOR]     = p.colorpoint_color ?? p.main_fur_color;
  lookup[packColor(0,0,255)]   = p.nose_color;

  let d = ctx.getImageData(0, 0, size, size, IMAGE_DATA_SETTINGS).data;

  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] !== 255) continue; // ignore nonopaque
    let c = packColor(d[i + 0], d[i + 1], d[i + 2]);
    if (c in lookup) {
      d[i + 0] = lookup[c][0];
      d[i + 1] = lookup[c][1];
      d[i + 2] = lookup[c][2];
    }
  }

  ctx.putImageData(new ImageData(d, size, size), 0, 0);
}
