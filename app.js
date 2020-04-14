//Global Selections and variables
const colorDivs = document.querySelectorAll('.color');
const sliders = document.querySelectorAll('input[type="range"]');
const currentHexes = document.querySelectorAll('.color h2');
const popup = document.querySelector('.copy-container');
const sliderContainers = document.querySelectorAll('.sliders');
const saveContainer = document.querySelector('.save-container');
const libraryContainer = document.querySelector('.library-container');

//Buttons
const generateBtn = document.querySelector('.generate');
const adjustBtns = document.querySelectorAll('.adjust');
const closeAdjustmentsBtns = document.querySelectorAll('.close-adjustment');
const lockButtons = document.querySelectorAll('.lock');
//save
const saveBtn = document.querySelector('.save');
const submitSaveBtn = document.querySelector('.submit-save');
const closeSaveBtn = document.querySelector('.close-save');
const saveInput = document.querySelector('.save-name');
//library
const libBtn = document.querySelector('.library');
const closeLibBtn = document.querySelector('.close-library');

//Saved Palettes
let savedPalettes = [];

//Colors
let initialColors = [];

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

        //Clearing timeout for accidential animations
        //So we don't have popup disappear right after it has appeared
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

adjustBtns.forEach((btn, index) => {
    btn.addEventListener('click', () => {
        toggleAdjustmentPanel(index);
    });
});

closeAdjustmentsBtns.forEach((btn, index) => {
    btn.addEventListener('click', () => {
        toggleAdjustmentPanel(index);
    });
});

generateBtn.addEventListener('click', () => {
    randomColors();
});

lockButtons.forEach((btn, index) => {
    btn.addEventListener('click', function (e) {
        toggleLockColor(index, e);
    });
});

saveBtn.addEventListener('click', (e) => {
    toggleSavePopup(e);
});

closeSaveBtn.addEventListener('click', (e) => {
    toggleSavePopup(e);
});

submitSaveBtn.addEventListener('click', (e) => {
    saveCurrentPalette(e);
});

libBtn.addEventListener('click', (e) => {
    toggleLibraryPopup(e);
});
closeLibBtn.addEventListener('click', (e) => {
    toggleLibraryPopup(e);
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

function toggleAdjustmentPanel(index) {
    sliderContainers[index].classList.toggle('active');
}

function toggleLockColor(index, event) {
    //Toggle locked class on container
    //Check if locked or unlocked to change the icon
    if (colorDivs[index].classList.toggle('locked')) {
        event.target.innerHTML = `<i class="fas fa-lock"></i>`;
    } else {
        event.target.innerHTML = `<i class="fas fa-lock-open"></i>`;
    }
}

function toggleSavePopup(e) {
    const savePopup = saveContainer.children[0];

    saveContainer.classList.toggle('active');
    savePopup.classList.toggle('active');

    //Toggle Modal Class
    document.querySelector('body').classList.toggle('modal-active');
}

function toggleLibraryPopup(e) {
    const libPopup = libraryContainer.children[0];

    //Toggle active
    libraryContainer.classList.toggle('active');
    libPopup.classList.toggle('active');

    //Toggle Modal Class
    document.querySelector('body').classList.toggle('modal-active');
}

function saveCurrentPalette(e) {
    //Check input is not empty
    if (!saveInput.value) {
        alert('Where is input value? HUH');
        return false;
    }

    //Gather data
    const paletteName = saveInput.value;
    const colorHexes = [];
    currentHexes.forEach((hex) => {
        colorHexes.push(hex.innerText);
    });

    //Create Pallete object;
    const paletteObj = {
        name: paletteName,
        colors: colorHexes,
        index: savedPalettes.length,
    };

    //Save array, clear inputs, save to local storage
    savedPalettes.push(paletteObj);
    saveInput.value = '';
    saveToLocalStorage(paletteObj);

    //Auto create palette thumbnail in library
    const paletteDiv = document.createElement('div');
    paletteDiv.classList.add('custom-palette');
    const title = document.createElement('h4');
    title.innerText = paletteObj.name;
    const preview = document.createElement('div');
    preview.classList.add('small-preview');
    paletteObj.colors.forEach((color) => {
        const smallDiv = document.createElement('div');
        smallDiv.style.backgroundColor = color;
        preview.appendChild(smallDiv);
    });

    const paletteBtn = document.createElement('button');
    paletteBtn.classList.add('pick-palette-btn');
    paletteBtn.setAttribute('data-index', paletteObj.index);
    paletteBtn.innerText = 'Select';

    //Wrap everithing and append to library
    paletteDiv.appendChild(title);
    paletteDiv.appendChild(preview);
    paletteDiv.appendChild(paletteBtn);
    libraryContainer.children[0].appendChild(paletteDiv);

    //Attach event to library button
    paletteBtn.addEventListener('click', (e) => {
        //Change Colors
        const palleteIndex = e.target.getAttribute('data-index');
        initialColors = [];
        savedPalettes[palleteIndex].colors.forEach((color, index) => {
            initialColors.push(color);
            colorDivs[index].style.backgroundColor = color;
            const text = colorDivs[index].children[0];
            text.innerText = color;
            checkTextContrast(color, text);

            //Icons too
            const icons = colorDivs[index].querySelectorAll('.controls button');
            icons.forEach((icon) => checkTextContrast(color, icon));
        });

        resetInputs();

        //Remove popup
        toggleLibraryPopup(e);
    });

    //Toggle active class
    toggleSavePopup(e);
}

//Functions
function saveToLocalStorage(obj) {
    let localPalettes = localStorage.getItem('palettes')
        ? JSON.parse(localStorage.getItem('palettes'))
        : [];

    localPalettes.push(obj);
    localStorage.setItem('palettes', JSON.stringify(localPalettes));
}

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
    initialColors = [];

    colorDivs.forEach((div, index) => {
        const hexText = div.children[0];
        const randomColor = generateHex();

        if (div.classList.contains('locked')) {
            initialColors.push(hexText.innerText);
            return;
        } else {
            //Push Color to initial colors array
            initialColors.push(randomColor.hex());
        }

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

function getLocalLibrary() {
    savedPalettes = localStorage.getItem('palettes')
        ? JSON.parse(localStorage.getItem('palettes'))
        : [];

    if (savedPalettes.length > 0) {
        savedPalettes.forEach((paletteObj) => {
            //Auto create palette thumbnail in library
            const paletteDiv = document.createElement('div');
            paletteDiv.classList.add('custom-palette');
            const title = document.createElement('h4');
            title.innerText = paletteObj.name;
            const preview = document.createElement('div');
            preview.classList.add('small-preview');
            paletteObj.colors.forEach((color) => {
                const smallDiv = document.createElement('div');
                smallDiv.style.backgroundColor = color;
                preview.appendChild(smallDiv);
            });

            const paletteBtn = document.createElement('button');
            paletteBtn.classList.add('pick-palette-btn');
            paletteBtn.setAttribute('data-index', paletteObj.index);
            paletteBtn.innerText = 'Select';
            //Wrap everithing and append to library
            paletteDiv.appendChild(title);
            paletteDiv.appendChild(preview);
            paletteDiv.appendChild(paletteBtn);
            libraryContainer.children[0].appendChild(paletteDiv);

            //Attach event to library button
            paletteBtn.addEventListener('click', (e) => {
                //Change Colors
                const palleteIndex = e.target.getAttribute('data-index');
                initialColors = [];
                savedPalettes[palleteIndex].colors.forEach((color, index) => {
                    initialColors.push(color);
                    colorDivs[index].style.backgroundColor = color;
                    const text = colorDivs[index].children[0];
                    text.innerText = color;
                    checkTextContrast(color, text);

                    //Icons too
                    const icons = colorDivs[index].querySelectorAll(
                        '.controls button'
                    );
                    icons.forEach((icon) => checkTextContrast(color, icon));
                    const sliders = colorDivs[index].querySelectorAll(
                        '.sliders input'
                    );
                    colorizeSliders(sliders, chroma(color));
                });

                resetInputs();

                //Remove popup
                toggleLibraryPopup(e);
            });
        });
    }
}

randomColors();
getLocalLibrary();
//FOR DEBUGGIN

window.clearPalettes = function () {
    localStorage.removeItem('palettes');
};
