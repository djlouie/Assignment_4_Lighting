class Cylinder{
    constructor(){
        this.type = 'cylinder';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.segments = 10;
        this.textureNum = -2;
    }

    // generateVertices() {
    //     // Calculate and draw the triangles that make up the circle
    //     let angleStep = 360 / this.segments;
    //     var d = 1;
    
    //     for (var angle = 0; angle < 360; angle = angle + angleStep) {
    //         let centerPt = [0, 0];
    //         let angle1 = angle;
    //         let angle2 = angle + angleStep;
    //         let vec1 = [Math.cos(angle1 * Math.PI / 180) * d, Math.sin(angle1 * Math.PI / 180) * d];
    //         let vec2 = [Math.cos(angle2 * Math.PI / 180) * d, Math.sin(angle2 * Math.PI / 180) * d];
    //         let pt1 = [centerPt[0] + vec1[0], centerPt[1] + vec1[1]];
    //         let pt2 = [centerPt[0] + vec2[0], centerPt[1] + vec2[1]];
    
    //         // Draw side triangles
    //         drawTriangle3DUVNormal([pt1[0], 0, pt1[1], pt2[0], 0, pt2[1], pt1[0], 1, pt1[1]],
    //             uv,
    //             normal,
    //         );
    //         drawTriangle3D([pt2[0], 1, pt2[1], pt1[0], 1, pt1[1], pt2[0], 0, pt2[1]]);
    
    //         // Top face triangle
    //         drawTriangle3D([0, 1, 0, pt1[0], 1, pt1[1], pt2[0], 1, pt2[1]]);
    
    //         // Bottom face triangle
    //         drawTriangle3D([0, 0, 0, pt1[0], 0, pt1[1], pt2[0], 0, pt2[1]]);
    //     }
    // }

    // generateVertices(){
    //     function calculateNormal(pt1, pt2, pt3) {
    //         // Calculate edges of the triangle
    //         let vec1 = [pt2[0] - pt1[0], pt2[1] - pt1[1], pt2[2] - pt1[2]];
    //         let vec2 = [pt3[0] - pt1[0], pt3[1] - pt1[1], pt3[2] - pt1[2]];
        
    //         // Calculate the cross product of vec1 and vec2 to get the normal
    //         let normal = [
    //             vec1[1] * vec2[2] - vec1[2] * vec2[1], // x-component
    //             vec1[2] * vec2[0] - vec1[0] * vec2[2], // y-component
    //             vec1[0] * vec2[1] - vec1[1] * vec2[0]  // z-component
    //         ];
        
    //         // Normalize the normal
    //         let length = Math.sqrt(normal[0] * normal[0] + normal[1] * normal[1] + normal[2] * normal[2]);
    //         normal = [normal[0] / length, normal[1] / length, normal[2] / length];
            
    //         return normal;
    //     }

    //     let angleStep = 360 / this.segments;
    //     var d = 1;
        
    //     for (var angle = 0; angle < 360; angle = angle + angleStep) {
    //         let centerPt = [0, 0, 0]; // The center of the circle in 3D
    //         let angle1 = angle;
    //         let angle2 = angle + angleStep;
        
    //         // Calculate vertices
    //         let vec1 = [Math.cos(angle1 * Math.PI / 180) * d, Math.sin(angle1 * Math.PI / 180) * d, 0];
    //         let vec2 = [Math.cos(angle2 * Math.PI / 180) * d, Math.sin(angle2 * Math.PI / 180) * d, 0];
    //         let pt1 = [centerPt[0] + vec1[0], centerPt[1] + vec1[1], 0];
    //         let pt2 = [centerPt[0] + vec2[0], centerPt[1] + vec2[1], 0];
        
    //         // Define UV coordinates (basic example)
    //         let uv = [
    //             0.5, 0.5,  // Center point UV
    //             Math.cos(angle1 * Math.PI / 180) * 0.5 + 0.5, Math.sin(angle1 * Math.PI / 180) * 0.5 + 0.5, // UV for pt1
    //             Math.cos(angle2 * Math.PI / 180) * 0.5 + 0.5, Math.sin(angle2 * Math.PI / 180) * 0.5 + 0.5, // UV for pt2
    //         ];
        
    //         // Calculate normals for each triangle
    //         let normal1 = calculateNormal([0, 1, 0], pt1, pt2);
    //         let normal2 = calculateNormal([0, 1, 0], pt2, pt1); // The other side of the triangle
        
    //         // Draw side triangles with calculated normals and UVs
    //         drawTriangle3DUVNormal(
    //             [pt1[0], 0, pt1[1], pt2[0], 0, pt2[1], pt1[0], 1, pt1[1]], // Vertices
    //             uv,  // UVs
    //             normal1 // Normals
    //         );
    //         drawTriangle3DUVNormal(
    //             [pt2[0], 1, pt2[1], pt1[0], 1, pt1[1], pt2[0], 0, pt2[1]], // Vertices
    //             uv,  // UVs
    //             normal2 // Normals
    //         );
        
    //         // Top face triangle
    //         let normalTop = calculateNormal([0, 1, 0], pt1, pt2); // Assuming top face normal is upward
    //         drawTriangle3DUVNormal(
    //             [0, 1, 0, pt1[0], 1, pt1[1], pt2[0], 1, pt2[1]], // Vertices
    //             uv,  // UVs
    //             normalTop // Normal
    //         );
        
    //         // Bottom face triangle
    //         let normalBottom = calculateNormal([0, 0, 0], pt1, pt2); // Assuming bottom face normal is downward
    //         drawTriangle3DUVNormal(
    //             [0, 0, 0, pt1[0], 0, pt1[1], pt2[0], 0, pt2[1]], // Vertices
    //             uv,  // UVs
    //             normalBottom // Normal
    //         );
    //     }
    // }
    
    generateVertices(){
        function calculateNormals(pt1, pt2, pt3) {
            // Calculate edges of the triangle
            let vec1 = new Vector3([pt2[0] - pt1[0], pt2[1] - pt1[1], pt2[2] - pt1[2]]);
            let vec2 = new Vector3([pt3[0] - pt1[0], pt3[1] - pt1[1], pt3[2] - pt1[2]]);
        
            let vec3 = Vector3.cross(vec1, vec2);
        
            vec3.normalize();

            // return same normal for all 3 vertices
            let verticesNormals = []
            verticesNormals.push(...vec3.elements)
            verticesNormals.push(...vec3.elements)
            verticesNormals.push(...vec3.elements)
            
            // console.log("THE VERTEX NORMALS:" + verticesNormals);
            return verticesNormals;
        }

        let angleStep = 360 / this.segments;
        var d = 1;
        
        for (var angle = 0; angle < 360; angle = angle + angleStep) {
            let centerPt = [0, 0, 0]; // The center of the circle in 3D
            let angle1 = angle;
            let angle2 = angle + angleStep;
        
            // Calculate vertices
            let vec1 = [Math.cos(angle1 * Math.PI / 180) * d, Math.sin(angle1 * Math.PI / 180) * d, 0];
            let vec2 = [Math.cos(angle2 * Math.PI / 180) * d, Math.sin(angle2 * Math.PI / 180) * d, 0];
            let pt1 = [centerPt[0] + vec1[0], centerPt[1] + vec1[1], 0];
            let pt2 = [centerPt[0] + vec2[0], centerPt[1] + vec2[1], 0];
        
            // Define UV coordinates (basic example)
            let uv = [
                0.5, 0.5,  // Center point UV
                Math.cos(angle1 * Math.PI / 180) * 0.5 + 0.5, Math.sin(angle1 * Math.PI / 180) * 0.5 + 0.5, // UV for pt1
                Math.cos(angle2 * Math.PI / 180) * 0.5 + 0.5, Math.sin(angle2 * Math.PI / 180) * 0.5 + 0.5, // UV for pt2
            ];

            // Draw side triangles with calculated normals and UVs
            drawTriangle3DUVNormal(
                [pt1[0], 0, pt1[1], pt2[0], 0, pt2[1], pt1[0], 1, pt1[1]], // Vertices
                uv,
                calculateNormals([pt1[0], 0, pt1[1]], [pt2[0], 0, pt2[1]], [pt1[0], 1, pt1[1]])
            );
            drawTriangle3DUV(
                [pt2[0], 1, pt2[1], pt1[0], 1, pt1[1], pt2[0], 0, pt2[1]], // Vertices
                uv,
                calculateNormals([pt2[0], 1, pt2[1]], [pt1[0], 1, pt1[1]], [pt2[0], 0, pt2[1]])
            );
        
            // Top face triangle
            drawTriangle3DUVNormal(
                [0, 1, 0, pt1[0], 1, pt1[1], pt2[0], 1, pt2[1]], // Vertices
                uv,
                [0,1,0,  0,1,0,  0,1,0] // up
            );
        
            // Bottom face triangle
            // let normalBottom = calculateNormal([0, 0, 0], pt1, pt2); // Assuming bottom face normal is downward
            drawTriangle3DUVNormal(
                [0, 0, 0, pt1[0], 0, pt1[1], pt2[0], 0, pt2[1]], // Vertices
                uv,
                [0,-1,0,  0,-1,0,  0,-1,0] // down
            );
        }
    }

    render(){
        // var xy = this.position;
        var rgba = this.color;
        // var size = this.size;

        // console.log("rendering cube with this.textureNum:", this.textureNum)
        // Pass the texture number
        gl.uniform1i(u_WhichTexture, this.textureNum);

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        
        // Pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        this.generateVertices()

        // // Calculate and draw the triangles that make up the circle
        // let angleStep = 360/this.segments;
        // var d = 1;
        // let v = []
        // for (var angle = 0; angle < 360; angle = angle + angleStep) {
        //     let centerPt = [0, 0];
        //     let angle1 = angle;
        //     let angle2 = angle + angleStep;
        //     let vec1 = [Math.cos(angle1*Math.PI/180)*d, Math.sin(angle1*Math.PI/180)*d];
        //     let vec2 = [Math.cos(angle2*Math.PI/180)*d, Math.sin(angle2*Math.PI/180)*d];
        //     let pt1 = [centerPt[0]+vec1[0], centerPt[1]+vec1[1]];
        //     let pt2 = [centerPt[0]+vec2[0], centerPt[1]+vec2[1]];

        //     drawTriangle( [0, 0, pt1[0], pt1[1], pt2[0], pt2[1]]);

        // }


        // // Create a buffer object (only if it isn't made already)
        // if (this.buffer === null) {
        //     this.buffer = gl.createBuffer();
        //     if (!this.buffer) {
        //     console.log("Failed to create the buffer object");
        //     return -1;
        //     }
        // }
    
        // // Bind the buffer object to target
        // gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    
        // // Write date into the buffer object
        // gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.DYNAMIC_DRAW);

        // // Assign the buffer object to a_Position variable
        // gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);

        // // Enable the assignment to a_Position variable
        // gl.enableVertexAttribArray(a_Position);
    
        // gl.drawArrays(gl.TRIANGLES, 0, this.vertices.length / 3);
    }

    // render(){
    //     var xy = [0,0];
    //     var rgba = this.color;
    //     var size = 200;

    //     // Pass the color of a point to u_FragColor variable
    //     gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        
        
    //     // Draw
    //     var d = size/200.0;  // delta
        
    //     // Calculate and draw the triangles that make up the circle
    //     let angleStep = 360/this.segments;
    //     for (var angle = 0; angle < 360; angle = angle + angleStep) {
    //         let centerPt = [xy[0], xy[1]];
    //         let angle1 = angle;
    //         let angle2 = angle + angleStep;
    //         let vec1 = [Math.cos(angle1*Math.PI/180)*d, Math.sin(angle1*Math.PI/180)*d];
    //         let vec2 = [Math.cos(angle2*Math.PI/180)*d, Math.sin(angle2*Math.PI/180)*d];
    //         let pt1 = [centerPt[0]+vec1[0], centerPt[1]+vec1[1]];
    //         let pt2 = [centerPt[0]+vec2[0], centerPt[1]+vec2[1]];

    //         drawTriangle( [xy[0], xy[1], pt1[0], pt1[1], pt2[0], pt2[1]]);
    //     }
    // }
}