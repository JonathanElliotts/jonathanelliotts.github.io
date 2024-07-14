// Setup singleton.
if(!window.HLTools) {
    window.HLTools = {};
}

if(!window.HLTools.BGGenerator) {
    window.HLTools.BGGenerator = {};
}

window.HLTools.BGGenerator.canvas = document.createElement('canvas');
window.HLTools.BGGenerator.ctx = window.HLTools.BGGenerator.canvas.getContext('2d');
window.HLTools.BGGenerator.img = new Image();
window.HLTools.BGGenerator.crops = [
    { name: "A1", x: 0, y: 0, w: 256, h: 256 },
    { name: "A2", x: 256, y: 0, w: 256, h: 256 },
    { name: "A3", x: 512, y: 0, w: 256, h: 256 },
    { name: "A4", x: 768, y: 0, w: 256, h: 256 },
    { name: "A5", x: 1024, y: 0, w: 256, h: 256 },
    { name: "A6", x: 1280, y: 0, w: 256, h: 256 },
    { name: "A7", x: 1536, y: 0, w: 256, h: 256 },
    { name: "A8", x: 1792, y: 0, w: 128, h: 256 },
    { name: "B1", x: 0, y: 256, w: 256, h: 256 },
    { name: "B2", x: 256, y: 256, w: 256, h: 256 },
    { name: "B3", x: 512, y: 256, w: 256, h: 256 },
    { name: "B4", x: 768, y: 256, w: 256, h: 256 },
    { name: "B5", x: 1024, y: 256, w: 256, h: 256 },
    { name: "B6", x: 1280, y: 256, w: 256, h: 256 },
    { name: "B7", x: 1536, y: 256, w: 256, h: 256 },
    { name: "B8", x: 1792, y: 256, w: 128, h: 256 },
    { name: "C1", x: 0, y: 512, w: 256, h: 256 },
    { name: "C2", x: 256, y: 512, w: 256, h: 256 },
    { name: "C3", x: 512, y: 512, w: 256, h: 256 },
    { name: "C4", x: 768, y: 512, w: 256, h: 256 },
    { name: "C5", x: 1024, y: 512, w: 256, h: 256 },
    { name: "C6", x: 1280, y: 512, w: 256, h: 256 },
    { name: "C7", x: 1536, y: 512, w: 256, h: 256 },
    { name: "C8", x: 1792, y: 512, w: 128, h: 256 },
    { name: "D1", x: 0, y: 768, w: 256, h: 256 },
    { name: "D2", x: 256, y: 768, w: 256, h: 256 },
    { name: "D3", x: 512, y: 768, w: 256, h: 256 },
    { name: "D4", x: 768, y: 768, w: 256, h: 256 },
    { name: "D5", x: 1024, y: 768, w: 256, h: 256 },
    { name: "D6", x: 1280, y: 768, w: 256, h: 256 },
    { name: "D7", x: 1536, y: 768, w: 256, h: 256 },
    { name: "D8", x: 1792, y: 768, w: 128, h: 256 },
    { name: "E1", x: 0, y: 1024, w: 256, h: 56 },
    { name: "E2", x: 256, y: 1024, w: 256, h: 56 },
    { name: "E3", x: 512, y: 1024, w: 256, h: 56 },
    { name: "E4", x: 768, y: 1024, w: 256, h: 56 },
    { name: "E5", x: 1024, y: 1024, w: 256, h: 56 },
    { name: "E6", x: 1280, y: 1024, w: 256, h: 56 },
    { name: "E7", x: 1536, y: 1024, w: 256, h: 56 },
    { name: "E8", x: 1792, y: 1024, w: 128, h: 56 }
];

window.HLTools.BGGenerator.createTGA = function(imageData) {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;
    const header = new Uint8Array(18);

    let row, col, srcIndex, destIndex;

    header[2] = 2; // Uncompressed true-color image
    header[12] = width & 0xFF;
    header[13] = (width >> 8) & 0xFF;
    header[14] = height & 0xFF;
    header[15] = (height >> 8) & 0xFF;
    header[16] = 24; // 24 bits per pixel

    const pixelData = new Uint8Array(width * height * 3);
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            row = height - 1 - y; // Invert the row order
            col = x;
            srcIndex = (row * width + col) * 4;
            destIndex = (y * width + x) * 3;
            pixelData[destIndex] = data[srcIndex + 2];     // Blue
            pixelData[destIndex + 1] = data[srcIndex + 1]; // Green
            pixelData[destIndex + 2] = data[srcIndex];     // Red
        }
    }

    const out = new Uint8Array(header.length + pixelData.length);
    out.set(header, 0);
    out.set(pixelData, header.length);

    return out;
}

window.HLTools.BGGenerator.generate = async function(src){
    return new Promise(async (resolve) => {

        let img = new Image();

        let output = {
            src: src,
            blocks:[]
        };

        img.onload = function(evt) {

            let imageHolder = document.querySelector('#imageholder');
            imageHolder.innerHTML = '';

            window.HLTools.BGGenerator.crops.forEach(function(crop){

                const cropName = crop.name;
                const cropX = crop.x;
                const cropY = crop.y;
                const cropWidth = crop.w;
                const cropHeight = crop.h;

                let _canvas = window.HLTools.BGGenerator.canvas;
                let _ctx = window.HLTools.BGGenerator.ctx;

                _canvas.width = cropWidth;
                _canvas.height = cropHeight;
                _ctx.drawImage(img, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

                // convert to TGA
                const imageData = _ctx.getImageData(0, 0, cropWidth, cropHeight);

                const tgaData = window.HLTools.BGGenerator.createTGA(imageData);
                const tgaBlob = new Blob([tgaData], { type: 'image/x-tga' });

                output.blocks.push({
                    name: cropName,
                    x: cropX,
                    y: cropY,
                    w: cropWidth,
                    h: cropHeight,
                    preview: _canvas.toDataURL(),
                    tga: tgaBlob,
                    tgaurl: URL.createObjectURL(tgaBlob)
                });

            });

            resolve(output);
        }

        img.src = src;

    });
}

