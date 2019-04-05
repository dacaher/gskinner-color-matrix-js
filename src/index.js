/**
 * Original Script ColorMatrix by Grant Skinner. August 8, 2005.
 * Updated to AS3 November 19, 2007.
 * Updated to Javascript using the PIXI.js framework October 17, 2018 by Diego M Mason for Red Rake Gaming
 *
 * You may distribute the original class freely, provided it is not modified in any way (including
 * removing this header or changing the package path).
 *
 * Please contact info_at_gskinner.com prior to distributing modified versions of the original class.
 * */
class ColorMatrix extends Array {

    // constant for contrast calculations:
    static get DELTA_INDEX() {
        return [
            0, 0.01, 0.02, 0.04, 0.05, 0.06, 0.07, 0.08, 0.1, 0.11,
            0.12, 0.14, 0.15, 0.16, 0.17, 0.18, 0.20, 0.21, 0.22, 0.24,
            0.25, 0.27, 0.28, 0.30, 0.32, 0.34, 0.36, 0.38, 0.40, 0.42,
            0.44, 0.46, 0.48, 0.5, 0.53, 0.56, 0.59, 0.62, 0.65, 0.68,
            0.71, 0.74, 0.77, 0.80, 0.83, 0.86, 0.89, 0.92, 0.95, 0.98,
            1.0, 1.06, 1.12, 1.18, 1.24, 1.30, 1.36, 1.42, 1.48, 1.54,
            1.60, 1.66, 1.72, 1.78, 1.84, 1.90, 1.96, 2.0, 2.12, 2.25,
            2.37, 2.50, 2.62, 2.75, 2.87, 3.0, 3.2, 3.4, 3.6, 3.8,
            4.0, 4.3, 4.7, 4.9, 5.0, 5.5, 6.0, 6.5, 6.8, 7.0,
            7.3, 7.5, 7.8, 8.0, 8.4, 8.7, 9.0, 9.4, 9.6, 9.8,
            10.0
        ];
    }

    static get IDENTITY_MATRIX() {
        return [
            1, 0, 0, 0, 0,
            0, 1, 0, 0, 0,
            0, 0, 1, 0, 0,
            0, 0, 0, 1, 0,
            0, 0, 0, 0, 1
        ];
    }

    static get LENGTH() {
        return ColorMatrix.IDENTITY_MATRIX.length;
    }

    constructor(p_matrix) {
        super();
        p_matrix = this.fixMatrix(p_matrix);
        this.copyMatrix(((p_matrix.length === ColorMatrix.LENGTH) ? p_matrix : ColorMatrix.IDENTITY_MATRIX));
    }

    /**
     * Resets the matrix to the identity matrix
     * */
    reset() {
        for (let i = 0; i < ColorMatrix.LENGTH; i++) {
            this[i] = ColorMatrix.IDENTITY_MATRIX[i];
        }
    }

    /**
     * Adjusts the brightness, the contrast, the saturation and the hue of the colour matrix
     * @param {any} p_brightness
     * @param {any} p_contrast
     * @param {any} p_saturation
     * @param {any} p_hue
     */
    adjustColor(p_brightness, p_contrast, p_saturation, p_hue) {
        this._adjustHue(p_hue);
        this._adjustContrast(p_contrast);
        this._adjustBrightness(p_brightness);
        this._adjustSaturation(p_saturation);

        this[4] /= 255;
        this[9] /= 255;
        this[14] /= 255;
        this[19] /= 255;
    }

    /**
     * Adjusts the brightness of the colour matrix
     * @param {any} p_val
     */
    _adjustBrightness(p_val) {
        p_val = this.cleanValue(p_val, 100);
        if (p_val === 0 || isNaN(p_val)) {
            return;
        }
        this.multiplyMatrix([
            1, 0, 0, 0, p_val,
            0, 1, 0, 0, p_val,
            0, 0, 1, 0, p_val,
            0, 0, 0, 1, 0,
            0, 0, 0, 0, 1
        ]);
    }

    /**
     * Adjusts the contrast of the colour matrix
     * @param {any} p_val
     */
    _adjustContrast(p_val) {
        p_val = this.cleanValue(p_val, 100);
        if (p_val === 0 || isNaN(p_val))
        {
            return;
        }
        var x = 0;
        if (p_val < 0) {
            x = 127 + p_val / 100 * 127;
        } else {
            x = p_val % 1;
            if (x === 0) {
                x = ColorMatrix.DELTA_INDEX[p_val];
            } else {
                x = ColorMatrix.DELTA_INDEX[(p_val << 0)] * (1 - x) + ColorMatrix.DELTA_INDEX[(p_val << 0) + 1] * x; // use linear interpolation for more granularity
            }
            x = x * 127 + 127;
        }
        this.multiplyMatrix([
            x / 127, 0, 0, 0, 0.5 * (127 - x),
            0, x / 127, 0, 0, 0.5 * (127 - x),
            0, 0, x / 127, 0, 0.5 * (127 - x),
            0, 0, 0, 1, 0,
            0, 0, 0, 0, 1
        ]);
    }

    /**
     * Adjusts the saturation of the colour matrix
     * @param {any} p_val
     */
    _adjustSaturation(p_val) {
        p_val = this.cleanValue(p_val, 100);
        if (p_val === 0 || isNaN(p_val))
        {
            return;
        }
        var x = 1 + ((p_val > 0) ? 3 * p_val / 100 : p_val / 100);
        var lumR = 0.3086;
        var lumG = 0.6094;
        var lumB = 0.0820;
        this.multiplyMatrix([
            lumR * (1 - x) + x, lumG * (1 - x), lumB * (1 - x), 0, 0,
            lumR * (1 - x), lumG * (1 - x) + x, lumB * (1 - x), 0, 0,
            lumR * (1 - x), lumG * (1 - x), lumB * (1 - x) + x, 0, 0,
            0, 0, 0, 1, 0,
            0, 0, 0, 0, 1
        ]);
    }

    /**
     * Adjusts the hue of the colour matrix
     * @param {any} p_val
     */
    _adjustHue(p_val) {
        p_val = this.cleanValue(p_val, 180) / 180 * Math.PI;
        if (p_val === 0 || isNaN(p_val))
        {
            return;
        }
        var cosVal = Math.cos(p_val);
        var sinVal = Math.sin(p_val);
        var lumR = 0.213;
        var lumG = 0.715;
        var lumB = 0.072;
        this.multiplyMatrix([
            lumR + cosVal * (1 - lumR) + sinVal * (-lumR), lumG + cosVal * (-lumG) + sinVal * (-lumG), lumB + cosVal * (-lumB) + sinVal * (1 - lumB), 0, 0,
            lumR + cosVal * (-lumR) + sinVal * (0.143), lumG + cosVal * (1 - lumG) + sinVal * (0.140), lumB + cosVal * (-lumB) + sinVal * (-0.283), 0, 0,
            lumR + cosVal * (-lumR) + sinVal * (-(1 - lumR)), lumG + cosVal * (-lumG) + sinVal * (lumG), lumB + cosVal * (1 - lumB) + sinVal * (lumB), 0, 0,
            0, 0, 0, 1, 0,
            0, 0, 0, 0, 1
        ]);
    }

    /**
     * Returs a formatted string containing all the elements of the Colour Matrix
     * */
    toString() {
        return "ColorMatrix [ " + this.join(" , ") + " ]";
    }

    /**
     * Returns a length 20 array (5x4).
     * */
    toArray() {
        return this.slice(0, 20);
    }

    /**
     * Copy the specified matrix's values to this matrix.
     * @param {Array} p_matrix
     */
    copyMatrix(p_matrix) {
        var l = ColorMatrix.LENGTH;
        for (var i = 0; i < l; i++) {
            this[i] = p_matrix[i];
        }
    }

    /**
     * Multiplies one matrix by another.
     * @param {Array} p_matrix
     */
    multiplyMatrix(p_matrix) {
        var col = [];

        for (var i = 0; i < 5; i++) {

            for (var j  = 0; j < 5; j++) {
                col[j] = this[j + i * 5];
            }

            for (j = 0; j < 5; j++) {
                var val = 0;
                for (var k = 0; k < 5; k++) {
                    val += p_matrix[j + k * 5] * col[k];
                }
                this[j + i * 5] = val;
            }
        }
    }

    /**
     * Make sure values are within the specified range, hue has a limit of 180, others are 100.
     * @param {number} p_val
     * @param {number} p_limit
     */
    cleanValue(p_val, p_limit) {
        return Math.min(p_limit, Math.max(-p_limit, p_val));
    }

    /**
     * Make sure matrixes are 5x5 (25 long).
     * @param {Array} p_matrix
     */
    fixMatrix(p_matrix) {
        if (p_matrix === null || p_matrix === undefined) {
            return ColorMatrix.IDENTITY_MATRIX;
        }
        if (p_matrix instanceof ColorMatrix) {
            p_matrix = p_matrix.slice(0);
        }
        if (p_matrix.length < ColorMatrix.LENGTH) {
            p_matrix = p_matrix.slice(0, p_matrix.length).concat(ColorMatrix.IDENTITY_MATRIX.slice(p_matrix.length, ColorMatrix.LENGTH));
        } else if (p_matrix.length > ColorMatrix.LENGTH) {
            p_matrix = p_matrix.slice(0, ColorMatrix.LENGTH);
        }
        return p_matrix;
    }
}





/**
 * This is the default playground.
 * You should see a bunny spinning in the right preview pane.
 * Feel free to use this as a starting point for you own playground!
 */

// Create our application instance
var app = new PIXI.Application({
    width: 960,
    height: 384,
    backgroundColor: 0x2c3e50
});
document.body.appendChild(app.view);

const sprite = PIXI.Sprite.from("https://dl.dropbox.com/s/bu53o5q2xidezwl/beach-exotic-holiday-248797.jpg?dl=0");

sprite.width = 960;
sprite.height = 384;


// Apply filter
const matrix = new ColorMatrix();
//matrix._adjustSaturation(100);
//matrix._adjustHue(180);
//matrix._adjustBrightness(100);
//matrix._adjustContrast(100);
matrix.adjustColor(-76, -71, -33, -25);

const filter = new PIXI.filters.ColorMatrixFilter();
filter.matrix = matrix;

sprite.filters = [filter];

app.stage.addChild(sprite);

console.log(matrix.toString());


