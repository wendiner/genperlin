// Generalized Perlin Noise function
// by wendiner, 2026
// GNU General Public License v3.0

function genPerlinNoise(width, height, gWidth, gHeight, presetCorners) { // width = pixel width, height = pixel height, gWidth = grid width, gHeight = grid height
  let corners;
  if (presetCorners) {
    corners = presetCorners;
  } else { 
    // dimension + 1 because we need to include both the zero and far edge
    corners = (new Array((gWidth + 1) * (gHeight + 1))).fill([]).map(() => {
      let theta = Math.random() * 2 * Math.PI;
      return [Math.cos(theta), Math.sin(theta)];
    }); // initialize corner gradient vectors
  }
  
  let pixels = [];
  for (let i = 0; i < width * height; i++) { // find the actual value for each pixel
    let pX = i % width; // x coordinate of pixel
    let pY = Math.floor(i / width); // y coordinate of pixel
    
    let cell = Math.floor(pY / (height / gHeight)) * gWidth + Math.floor(pX / (width / gWidth)); // grid cell the pixel is located in
    let cellX = cell % gWidth; // x coordinate of the grid cell
    let cellY = Math.floor(cell / gWidth); // y coordinate of the grid cell
    
    let negUp = cellY * (gWidth + 1) + cellX; // index of cell's upper-left corner
    let posUp = cellY * (gWidth + 1) + cellX + 1; // index of cell's upper-right corner
    let negDown = (cellY + 1) * (gWidth + 1) + cellX; // index of cell's lower-left corner
    let posDown = (cellY + 1) * (gWidth + 1) + cellX + 1; // index of cell's lower-right corner
    
    function dotProd(corner) { // calculate the dot product between the displacement and gradient vectors of a given corner
      let cornerX = corner % (gWidth + 1) * (width / gWidth); // x coordinate of given corner
      let cornerY = Math.floor(corner / (gWidth + 1)) * (height / gHeight); // y coordinate of given corner
      let dispVector = [pX - cornerX, pY - cornerY]; // offset vector from corner to pixel
      // let dispVector = [Math.abs(pX - cornerX), Math.abs(pY - cornerY)]; // offset vector from corner to pixel
      return corners[corner][0] * dispVector[0] + corners[corner][1] * dispVector[1]; // dot product of vectors "a" and "b" is equal to "a.x * b.x + a.y * b.y"
    }
    
    function smoothstep(x) { // sigmoid-like interpolation function
      if (x <= 0)
        return 0;
      if (x >= 1)
        return 1;
      
      return 3 * x ** 2 - 2 * Math.pow(x, 3);
    }
    
    let dotProdCorners = [dotProd(negUp), dotProd(posUp), dotProd(negDown), dotProd(posDown)]; // find dot product of each of the 4 corners
    let scaleX = (pX - cellX * (width / gWidth)) / (width / gWidth); // 0 = left edge of cell, 1 = right edge of cell
    let scaleY = (pY - cellY * (height / gHeight)) / (height / gHeight); // 0 = top edge of cell, 1 = bottom edge of cell
    let topGrad = dotProdCorners[0] + smoothstep(scaleX) * (dotProdCorners[1] - dotProdCorners[0]); // this and the next two lines are just bilinear interpolation
    let bottomGrad = dotProdCorners[2] + smoothstep(scaleX) * (dotProdCorners[3] - dotProdCorners[2]);
    let vertGrad = topGrad + smoothstep(scaleY) * (bottomGrad - topGrad);
    
    pixels[i] = {dotProdCorners, topGrad, bottomGrad, vertGrad}; // other information included for debugging purposes
  }
  
  return {pixels, corners};
}