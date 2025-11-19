
import React, { useState, useRef, useEffect } from 'react';
import { ColorPicker } from '@shopify/polaris';

const CustomColourPicker = (props) => {
    const { changeColor, defaultColor, setSaveBar, onColorChange } = props;

    const [color, setColor] = useState({ hue: 120, brightness: 1, saturation: 1 });
    const [openBox, setOpenBox] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!ref.current.contains(event.target)) {
                setOpenBox(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [ref]);

    // const RGBconverter = (value) => {
    //     setColor(value);
    //     const colorName = extractColorRGB(value);
    //     onColorChange(colorName);
    // }

    // const extractColorRGB = (data) => {
    //     let h = data.hue;
    //     let s = data.saturation;
    //     let b = data.brightness;
    //     const k = (n) => (n + h / 60) % 6;
    //     const f = (n) => b  (1 - s  Math.max(0, Math.min(k(n), 4 - k(n), 1)));
    //     const final = [255  f(5), 255  f(3), 255 * f(1)];
    //     let rr = Math.round(final[0]);
    //     let gg = Math.round(final[1]);
    //     let bb = Math.round(final[2]);
    //     let endResult = `rgb(${rr}, ${gg}, ${bb})`
    //     return endResult
    // }


    function hsbToHex(hsb) {
        const { hue, saturation, brightness } = hsb;

        // Convert HSB to RGB
        let r, g, b;
        const c = brightness * saturation;
        const x = c * (1 - Math.abs((hue / 60) % 2 - 1));
        const m = brightness - c;

        if (hue >= 0 && hue < 60) {
            [r, g, b] = [c, x, 0];
        } else if (hue >= 60 && hue < 120) {
            [r, g, b] = [x, c, 0];
        } else if (hue >= 120 && hue < 180) {
            [r, g, b] = [0, c, x];
        } else if (hue >= 180 && hue < 240) {
            [r, g, b] = [0, x, c];
        } else if (hue >= 240 && hue < 300) {
            [r, g, b] = [x, 0, c];
        } else {
            [r, g, b] = [c, 0, x];
        }

        // Convert RGB to hexadecimal
        const toHex = (c) => {
            const hex = Math.round((c + m) * 255).toString(16);
            return hex.padStart(2, '0');
        };

        const hexCode = '#' + toHex(r) + toHex(g) + toHex(b);
        return hexCode.toUpperCase();
    }


    const RGBconverter = (value) => {
        setColor(value);
        // const colorName = extractColorRGB(value);
        const colorName = hsbToHex(value)
        onColorChange(colorName);
    }

    // const hsbColor = {hue: 120, saturation: 0.86875, brightness: 0.87001953125, alpha: 1};
    // const hexColor = hsbToHex(hsbColor);

    return (
        <div className='wishlist-ui-style' ref={ref} style={{ position: "relative" }}>
            <div
                style={{ backgroundColor: defaultColor }}
                onClick={() => setOpenBox(true)}
                className='color-selector'
            ></div>
            {openBox && (
                <div className='customColorBox'>
                    <span onClick={() => setOpenBox(false)}>X</span>
                    <ColorPicker onChange={RGBconverter} color={color} />
                </div>
            )}
        </div>
    );
};

export default CustomColourPicker;