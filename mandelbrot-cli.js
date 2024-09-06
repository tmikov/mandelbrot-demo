const screenWidth = 80;   // Width of the output screen
const screenHeight = 40;  // Height of the output screen
const largeWidth = 500;   // Width of the larger array
const largeHeight = 300;  // Height of the larger array
const maxIterations = 100; // Maximum number of iterations

let xmin = -2.0;
let xmax = 1.0;
let ymin = -1.5;
let ymax = 1.5;

let zoomFactor = 0.9;  // How much to zoom each step
let maxFrames = 10;   // How many frames to generate in each direction
let zoomingIn = true;  // Track whether we are zooming in or out

// Create the large array and fill it with Mandelbrot data
function generateLargeMandelbrotArray() {
    let largeArray = [];

    for (let y = 0; y < largeHeight; y++) {
        largeArray[y] = [];
        for (let x = 0; x < largeWidth; x++) {
            let cr = xmin + (x / largeWidth) * (xmax - xmin);
            let ci = ymin + (y / largeHeight) * (ymax - ymin);

            let zr = 0.0, zi = 0.0;
            let n = 0;

            // Mandelbrot iteration
            while (n < maxIterations && zr * zr + zi * zi < 4.0) {
                let temp = zr * zr - zi * zi + cr;
                zi = 2.0 * zr * zi + ci;
                zr = temp;
                n++;
            }

            // Store iteration count in the large array
            largeArray[y][x] = n;
        }
    }

    return largeArray;
}

// Downsample the large array to fit the smaller screen
function downsampleArray(largeArray) {
    const gradient = ' .:-=+*#%@';  // Gradient of characters
    let screenArray = [];

    let yScale = largeHeight / screenHeight;
    let xScale = largeWidth / screenWidth;

    for (let y = 0; y < screenHeight; y++) {
        let line = '';
        for (let x = 0; x < screenWidth; x++) {
            let totalIterations = 0;
            let count = 0;

            // Average over multiple elements from the large array
            for (let j = 0; j < yScale; j++) {
                for (let i = 0; i < xScale; i++) {
                    totalIterations += largeArray[Math.floor(y * yScale) + j][Math.floor(x * xScale) + i];
                    count++;
                }
            }

            // Average iterations for this block
            let averageIterations = totalIterations / count;

            // Map the average iterations to a character from the gradient
            if (averageIterations >= maxIterations) {
                line += '@'; // Part of the Mandelbrot set (black)
            } else {
                let index = Math.floor((averageIterations / maxIterations) * (gradient.length - 1));
                line += gradient[index];
            }
        }
        screenArray.push(line);
    }

    return screenArray;
}

function printArray(screenArray) {
    for (let line of screenArray) {
        print(line);
    }
}

function clearScreen() {
    print('\x1b[2J\x1b[H'); // ASCII codes to clear the screen
}

function evolveMandelbrot() {
    let frame = 0;

    function nextFrame() {
        if (frame >= maxFrames) {
            // Reverse the zoom direction when the max frames are reached
            zoomingIn = !zoomingIn;
            frame = 0; // Reset the frame counter for the next direction
        }


        // Generate large Mandelbrot array and downsample it to fit the screen
        let largeArray = generateLargeMandelbrotArray();
        let screenArray = downsampleArray(largeArray);

        // Print the downsampled array
        clearScreen();  // Clear the console for the next frame
        printArray(screenArray);

        // Calculate the zooming factor depending on the direction
        let zoomAdjustment = zoomingIn ? zoomFactor : 1 / zoomFactor;

        // Zoom in or out by adjusting the bounds
        let xCenter = (xmin + xmax) / 2;
        let yCenter = (ymin + ymax) / 2;

        let xRange = (xmax - xmin) * zoomAdjustment;
        let yRange = (ymax - ymin) * zoomAdjustment;

        xmin = xCenter - xRange / 2;
        xmax = xCenter + xRange / 2;
        ymin = yCenter - yRange / 2;
        ymax = yCenter + yRange / 2;

        frame++;
    }

    for(;;)
        nextFrame();
}

evolveMandelbrot();

