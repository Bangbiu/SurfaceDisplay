/*jshint esversion: 6 */
// @ts-check

import * as T from "./libs/CS559-Three/build/three.module.js";
import { GrWorld } from "./libs/CS559-Framework/GrWorld.js";
import * as F from "./functions.js";
import { GrObject } from "./libs/CS559-Framework/GrObject.js";

const multiSlider = /** @type {HTMLInputElement} */ (document.getElementById("multiSlider"));
const fileSlider = /** @type {HTMLInputElement} */ (document.getElementById("fileSlider"));

let world = new GrWorld({groundplanesize:5, groundplane:false});




class CoordBox extends GrObject {
    constructor() {
        let ground = F.Box(10,0.1,10,"grey",0,0,0);
        let xplane = F.Box(5,0.1,10,"grey",-5,2.5,0);
        let zplane = F.Box(10,0.1,5,"grey",0,2.5,-5);
        ground.add(xplane.rotateZ(Math.PI/2));
        ground.add(zplane.rotateX(Math.PI/2));
        super("coord",ground);
    }
}

class GrSurface extends GrObject {
    /** @type {T.Mesh} */
    mesh;
    /**
     * 
     * @param {Array<Array<number>>} matrix 
     * @param {number} scale
     */
    constructor(matrix,scale=1,step=1) {
        let surf = new T.Mesh(
            new T.SphereGeometry(1), 
            new T.MeshPhongMaterial({
                color: 0x0095DD,
                specular: 0.5,
                side: 2,
            })
        );
        surf.material.flatShading = true;
        super("surface",surf);
        this.mesh = surf;
        this.update(matrix,scale,step);
    }

    update(matrix,scale=1,step=1,multi=1) {
        this.mesh.geometry = F.createSurfaceGeometry(
            matrix,scale,step,multi
        );
        this.mesh.position.set(
            -(matrix[0].length*scale-scale)/2,
            0.01,
            -(matrix.length*scale-scale)/2
        );
    }
}

world.add(new CoordBox());

/** @type {GrSurface} */
let surf = new GrSurface(F.randomMatrix(2,2,2));
/** @type {Array<Array<number>>} */
let matrix = undefined
/** @type {Array<Array<Array<number>>>} */
let matrices = [];
F.readMatrix("parallel_z=-5.txt",13, 1, function(mat) {
    matrix = mat; 
    matrices.push(mat);
    F.readMatrix("parallel_z=-10.txt",13, 1, function(mat) {
        matrices.push(mat);
        updateSurface();
        world.add(surf);
    })

});


multiSlider.oninput = updateSurface;
fileSlider.oninput = function() {
    matrix = matrices[Number(fileSlider.value)];
    updateSurface();
}

function updateSurface() {
    if (matrix != undefined) {
        surf.update(matrix,0.05,8,Number(multiSlider.value));
    }
}


world.go();

