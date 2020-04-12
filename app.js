//Global Selections and variables
const colorDivs = document.querySelectorAll('.color');
const generateBtn = document.querySelector('.generate');
const sliders = document.querySelectorAll('input[type="range"]');
const currentHexes = document.querySelectorAll('.color h2');
const popup = document.querySelector('.copy-container');

const initialColors = [];

//Timeouts section
let copyTimeout = null;

//Event Listeners
sliders.forEach((slider) => {
    slider.addEventListener('input', hslControls);
});

colorDivs.forEach((div, index) => {
    div.addEventListener('input', (e) => {
        updateTextUI(index, e);
    });
});

currentHexes.forEach((hex) => {
    hex.addEventListener('click', () => {
        copyToClipboard(hex);
        window.clearTimeout(copyTimeout);
    });
});

popup.addEventListener('transitionend', (e) => {
    // if (
    //     e.propertyName === 'opacity' &&
    //     Boolean(parseInt(window.getComputedStyle(e.target).opacity))
    // ) {
    //     copyTimeout = null;
    //     const popupBox = popup.children[0];
    //     copyTimeout = window.setTimeout(function () {
    //         popupBox.classList.remove('active');
    //         popup.classList.remove('active');
    //     }, 500);
    // }

    //Second way to do it but we also need to clear it on click
    window.clearTimeout(copyTimeout);
    const popupBox = popup.children[0];
    copyTimeout = window.setTimeout(function () {
        popupBox.classList.remove('active');
        popup.classList.remove('active');
    }, 500);
});

//Event Functions

function hslControls(e) {
    const index =
        e.target.getAttribute('data-hue') ||
        e.target.getAttribute('data-bright') ||
        e.target.getAttribute('data-sat');

    let sliders = e.target.parentElement.querySelectorAll(
        'input[type="range"]'
    );

    [hue, brightness, saturation] = sliders;

    //Get Current Color;
    const bgColor = initialColors[index];

    //Set chroma
    let color = chroma(bgColor)
        .set('hsl.s', saturation.value)
        .set('hsl.l', brightness.value)
        .set('hsl.h', hue.value);

    colorDivs[index].style.backgroundColor = color;

    //Colorize inputs/sliders

    colorizeSliders(sliders, color, e);
}

function updateTextUI(index, e) {
    const activeDiv = colorDivs[index];
    const color = chroma(activeDiv.style.backgroundColor);
    const textHex = activeDiv.querySelector('h2');
    const icons = activeDiv.querySelectorAll('.controls button');

    //Updating part
    textHex.innerText = color.hex();

    //Check Contrast
    checkTextContrast(color, textHex);

    icons.forEach((icon) => checkTextContrast(color, icon));
}

function copyToClipboard(hex) {
    //Copy to clipboard hack
    const el = document.createElement('textarea');
    el.value = hex.innerText;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);

    //Show Popup message
    const popupBox = popup.children[0];
    popup.classList.add('active');
    popupBox.classList.add('active');
}

//Functions
function generateHex() {
    // THIS IS MADNESS
    // const letters = '0123456789ABCDEF';

    // let hash = '#';

    // for (let i = 0; i < 6; i++) {
    //     hash += letters[Math.floor(Math.random() * 16)];
    // }
    // return hash;

    const hexColor = chroma.random();
    return hexColor;
}

function checkTextContrast(color, text) {
    const luminance = chroma(color).luminance();

    if (luminance > 0.5) {
        text.style.color = 'black';
    } else {
        text.style.color = 'white';
    }
}

function randomColors() {
    //Initial Colors

    colorDivs.forEach((div, index) => {
        const hexText = div.children[0];
        const randomColor = generateHex();

        //Push Color to initial colors array
        initialColors.push(randomColor.hex());

        //add the color to the background
        div.style.backgroundColor = randomColor;
        hexText.innerText = randomColor;

        //Check for contrast
        checkTextContrast(randomColor, hexText);
        //Icons too
        const icons = div.querySelectorAll('.controls button');
        icons.forEach((icon) => checkTextContrast(randomColor, icon));

        //Initial Colorize sliders
        const color = chroma(randomColor);
        const sliders = div.querySelectorAll('.sliders input');

        colorizeSliders(sliders, color);
    });

    resetInputs();
}

function colorizeSliders(sliders, color, e = {}) {
    //Deconstruct syntax
    [hue, brightness, saturation] = sliders;

    //Scale saturation
    const noSat = color.set('hsl.s', 0);
    const fullSat = color.set('hsl.s', 1);
    const scaleSat = chroma.scale([noSat, color, fullSat]);

    //Scale Brightness
    const midBright = color.set('hsl.l', 0.5);
    const scaleBright = chroma.scale(['black', midBright, 'white']);

    //Scale hue (it's always same so no need to prepare)

    //App has a bug that if max or min brightness is reached the whole input backgroudn is updated
    //Aswell as if saturation min is reached the whole input background is updated

    //Update Input colors

    saturation.style.backgroundImage = `linear-gradient(to right, ${scaleSat(
        0
    )}, ${scaleSat(1)})`;
    if (e.target != saturation) {
    }

    brightness.style.backgroundImage = `linear-gradient(to right, ${scaleBright(
        0
    )}, ${scaleBright(0.5)}, ${scaleBright(1)})`;
    if (e.target != brightness) {
    }

    hue.style.backgroundImage = `linear-gradient(to right, rgb(204,75,75), rgb(204,204,75), rgb(75,204,75),  rgb(75,204,204), rgb(75,75,204),  rgb(204,75,204),  rgb(204,75,75))`;
    if (!e.target) {
    }
}

function resetInputs() {
    const sliders = document.querySelectorAll('.sliders input');

    sliders.forEach((slider) => {
        //I dont like if stateement way
        // if (slider.name === 'hue') {
        //     const hueColor = initialColors[slider.getAttribute('data-hue')];
        //     const hueValue = chroma(hueColor).hsl()[0];

        //     slider.value = Math.floor(hueValue);
        // }

        //Making switch case
        switch (slider.name) {
            case 'hue':
                const hueColor = initialColors[slider.getAttribute('data-hue')];
                const hueValue = chroma(hueColor).hsl()[0];
                slider.value = Math.floor(hueValue);
                break;
            case 'brightness':
                const brightColor =
                    initialColors[slider.getAttribute('data-bright')];
                const brightValue = chroma(brightColor).hsl()[2];
                slider.value = Math.floor(brightValue * 100) / 100;
                break;
            case 'saturation':
                const saturationColor =
                    initialColors[slider.getAttribute('data-sat')];
                const saturationValue = chroma(saturationColor).hsl()[1];
                slider.value = Math.floor(saturationValue * 100) / 100;
                break;
        }
    });
}

randomColors();
