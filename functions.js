/*jshint esversion: 6 */
// @ts-check

import * as T from "./libs/CS559-Three/build/three.module.js";
import { GrObject } from "./libs/CS559-Framework/GrObject.js";
import { OBJLoader } from "./libs/CS559-Three/examples/jsm/loaders/OBJLoader.js";

/**
 * 
 * @param {string | T.Color} color 
 * @returns {T.MeshStandardMaterial}
 */
export function STDMAT(color="white") {
    return new T.MeshStandardMaterial({color:color,side:2});
}

/**
 * 
 * @param {string} mapfile 
 * @returns {T.MeshStandardMaterial}
 */
export function MAPMAT(mapfile) {
    let tl = new T.TextureLoader().load(mapfile);
    return new T.MeshStandardMaterial({
        color: "white",
        roughness: 0.75,
        side:2,
        map: tl,
    });
}

/**
 * 
 * @param {number} w 
 * @param {number} h 
 * @param {number} d 
 * @param {string | T.Color} color 
 * @returns 
 */
export function Box(w=1,h=1,d=1,color="white",x=0,y=0.5,z=0) {
    return new T.Mesh(new T.BoxGeometry(w,h,d),STDMAT(color)).translateX(x).translateY(y).translateZ(z);
}

/**
 * 
 * @param {number} rt 
 * @param {number} rb 
 * @param {number} h 
 * @param {string | T.Color} color 
 * @returns 
 */
export function Cylid(rt=0.5,rb=0.5,h=1,color="white",bseg=20,hseg=20) {
    return new T.Mesh(new T.CylinderGeometry(rt,rb,h,bseg,hseg),STDMAT(color));
}

/**
 * 
 * @param {*} r 
 * @param {*} h 
 * @param {*} color 
 * @returns 
 */
export function Cone(r,h,color="white",bseg=20,hseg=20) {
    return new T.Mesh(new T.ConeGeometry(r,h,bseg,hseg),STDMAT(color));
}

/**
 * 
 * @param {Array<T.Vector3>} vs 
 * @returns {Array<number>} vs 
 */
export function createRectVertices(vs) {
    return [vs[0].x, vs[0].y, vs[0].z,
            vs[1].x, vs[1].y, vs[1].z,
            vs[2].x, vs[2].y, vs[2].z,
        
            vs[2].x, vs[2].y, vs[2].z,
            vs[3].x, vs[3].y, vs[3].z,
            vs[0].x, vs[0].y, vs[0].z];
}

/**
 * 
 * @param {Array<Array<number>>} matrix 
 * @returns 
 */
export function createSurfaceGeometry(matrix,scale=1,step=1,multi=1) {
    let geometry = new T.BufferGeometry();
    /** @type {Array<number>} */ let vlist = [];
    for (let r = 0; r < matrix.length-step; r+=step) {
        for (let c = 0; c < matrix[r].length-step; c+=step) {
            const x = c * scale, y = r * scale
            const gap = scale*step;
            vlist=vlist.concat(createRectVertices([
                new T.Vector3(x,matrix[r][c]*multi,y),
                new T.Vector3(x,matrix[r+step][c]*multi,y+gap),
                new T.Vector3(x+gap,matrix[r+step][c+step]*multi,y+gap),
                new T.Vector3(x+gap,matrix[r][c+step]*multi,y)
            ]));
        }
    }
    
    const vertices = new Float32Array(vlist);

    geometry.setAttribute('position',new T.BufferAttribute(vertices,3));
    geometry.computeVertexNormals();

    return geometry;
}
/**
 * 
 * @param {number} rowCount 
 * @param {number} colCount
 * @returns {Array<Array<number>>} 
 */
export function randomMatrix(rowCount,colCount,maxHeight=1.0) {
    /** @type {Array<Array<number>>}*/
    let matrix = [];
    for (let r = 0; r < rowCount; r++) {
        /** @type {Array<number>}*/
        let row = [];
        for (let c = 0; c < colCount; c++) {
            row.push(Math.random()*maxHeight);
        }
        matrix.push(row);
    }
    return matrix;
}

/**
 * 
 * @param {string} char 
 * @returns 
 */
function isNumber(char) {
    if (typeof char !== 'string') {
      return false;
    }
  
    if (char.trim() === '') {
      return false;
    }
  
    // @ts-ignore
    return !isNaN(char);
}

/**
 * 
 * @param {string} filePath 
 * 
 */
export function readMatrix(filePath,mag=14,multi=10,finish) {
    /** @type {Array<Array<number>>}*/
    let mat = [];
    try {
        fetch(filePath)
        .then(response => response.text())
        .then(text => {
            text.split(/\r?\n/).forEach(lines => {
                lines = lines.trim();
                if (!lines.startsWith("0")) return;
                /** @type {Array<number>}*/
                let row = [];
                lines.split(" ").forEach(num => {
                    let tens = Number(num.substring(num.indexOf("e")+1));
                    let coef = Number(num.substring(0,num.indexOf("e")));
                    tens += mag;
                    row.push(Number(coef+"e"+tens)*multi);
                });
                mat.push(row);
            })
            finish(mat);
        })
    } catch (e) {
        console.log(e);
        finish(undefined);
        return undefined;
    }
}
/**
 * 
 * @param {Array<string>} filePaths 
 * @param {number} mag 
 * @param {number} multi 
 * @param {Function} finish 
 */
export function readMatList(filePaths,mag=14,multi=10,finish) {
    let count = 0;
    /** @type {Array<Array<Array<number>>>} */
    let mats = [];
    filePaths.forEach(path => {
        readMatrix(path,mag,multi,callback);
    });

    function callback(mat) {
        count++;
        if (mat!=undefined && mat.length > 1) mats.push(mat);
        if (count >= filePaths.length) {
            finish(mats);
        }
    }
}