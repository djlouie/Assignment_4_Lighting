class Camera {
    constructor(){
        this.eye = new Vector3({0: 1, 1: 0, 2: 7});
        this.at = new Vector3({0: 1, 1: 0, 2: -50});
        this.up = new Vector3({0: 0, 1: 1, 2: 0});
        this.fov = 40;
        this.collision_map = null;

        // this.eye = new Vector3([0, 0, 3]);
        // this.at = new Vector3([0, 0, -100]);
        // this.up = new Vector3([0, 1, 0]);
    }

    // calculate vector from eye to at (d = direction)
    forward(scalar=1) {

        console.log(this.eye.elements)
        
        // direction vector
        var d = Vector3.sub(this.at, this.eye);
        d.normalize().mul(scalar);

        // eye prediction
        let eye_prediction = new Vector3(this.eye.elements);
        eye_prediction.elements[0] = eye_prediction.elements[0] + 16;
        eye_prediction.elements[2] = eye_prediction.elements[2] + 16;
        // eye_prediction.elements[0] = eye_prediction.elements[0];
        // eye_prediction.elements[2] = 32 - eye_prediction.elements[2];

        console.log(this.collision_map);
        console.log("Current Eye:", this.eye.elements);
        console.log("Eye X prediction:", eye_prediction.elements[0]);
        console.log("Eye Z prediction:", eye_prediction.elements[2]);
        console.log("Wall prediction:", this.collision_map[Math.floor(eye_prediction.elements[0])][Math.floor(eye_prediction.elements[2])]);
        

        // don't go forward if you would for into a wall
        if(this.collision_map[Math.floor(eye_prediction.elements[0])][Math.floor(eye_prediction.elements[2])] == 1){
            return;
        }
        
        // Move forward
        this.at.add(d);
        this.eye.add(d);
    }

    // calculate vector from at to eye
    backward(scalar=1) {
        var d = Vector3.sub(this.eye, this.at);
        d.normalize().mul(scalar);
        this.at.add(d);
        this.eye.add(d);
    }

    moveUp(scalar=1) {
        var d = new Vector3([0, 1, 0]);
        d.normalize().mul(scalar);
        this.at.add(d);
        this.eye.add(d);
    }

    moveDown(scalar=1) {
        var d = new Vector3([0, -1, 0]);
        d.normalize().mul(scalar);
        this.at.add(d);
        this.eye.add(d);
    }

    // calculate vector orthogonal 
    // to plane made from vector from at to eye and up
    // to get the left direction
    left(scalar=1) {
        var f = Vector3.sub(this.at, this.eye);
        f.normalize();
        var s = Vector3.cross(f, this.up);
        s.normalize().mul(-1).mul(scalar);;
        this.at.add(s);
        this.eye.add(s);
    }

    // calculate vector orthogonal
    // to plane made from neg vector from at to eye and up
    // to get the left direction
    right(scalar=1) {
        var f = Vector3.sub(this.at, this.eye);
        f.normalize();
        var s = Vector3.cross(f, this.up);
        s.normalize().mul(scalar);;
        this.at.add(s);
        this.eye.add(s);
    }

    rotateRight(degrees=1){
        let d = Vector3.sub(this.at, this.eye);
        // get rid of y component of the vector (cause we are rotating around it)
        d.elements[1] = 0;
        
        let r = d.magnitude();
        let theta = Math.atan2(d.elements[0], d.elements[2]);
        let radiansRotated = -degrees * (Math.PI/180);  // Added negative sign
        theta = theta + radiansRotated;
        
        d.elements[0] = r * Math.sin(theta);
        d.elements[2] = r * Math.cos(theta);
        
        this.at = Vector3.add(this.eye, d);

        console.log('EYE', this.eye.elements);
        console.log('AT', this.at.elements);
    }

    rotateLeft(degrees=5) {
        let d = Vector3.sub(this.at, this.eye);
        // get rid of y component of the vector (cause we are rotating around it)
        d.elements[1] = 0;
        
        let r = d.magnitude();
        let theta = Math.atan2(d.elements[2], d.elements[0]);
        let radiansRotated = -degrees * (Math.PI/180);  // Added negative sign
        theta = theta + radiansRotated;
        
        d.elements[2] = r * Math.sin(theta);
        d.elements[0] = r * Math.cos(theta);
        
        this.at = Vector3.add(this.eye, d);

        console.log('EYE', this.eye.elements);
        console.log('AT', this.at.elements);
    }
}

