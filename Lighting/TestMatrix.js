// Pass the view matrix
var viewMat = new Matrix4();
viewMat.setLookAt(0, 0, 2,
    0, 0, 0,
    0, 1, 0);

console.log(viewMat.elements);