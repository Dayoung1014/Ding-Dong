import * as THREE from "three";




//  vector3를 그리드 평면으로 변경하는 로직 
export const useGrid = () => {
  const vector3ToGrid = (vector3) => {
    return [
      Math.floor(vector3.x / 0.24) + 10,
      0,
      Math.floor(vector3.z / 0.24) + 10,
    ];
  };
// 그리드 평면을 vector3로 변경하는 로직
  const gridToVector3 = (gridPosition) => {
    // console.log(gridPosition)
    return new THREE.Vector3(
      gridPosition[0] * 0.24 - 2.4,
      0,
      gridPosition[2] *  0.24 - 2.4
    );
  };

  return {
    vector3ToGrid,
    gridToVector3,
  };
};
