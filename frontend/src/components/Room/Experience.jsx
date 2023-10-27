import { Environment, Grid, Html, OrbitControls } from "@react-three/drei";
import { useEffect, useState, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Item } from "./Item";
import { Room } from "./Room";
import { useGrid } from "./UseGrid";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  ItemRotateState,
  ItemsState,
  buildModeState,
  dragPositionState,
  draggedItemState,
} from "./Atom";
import { gsap } from "gsap";
import styles from "./Room.module.css";

const Experience = () => {
  const buildMode = useRecoilValue(buildModeState);
  const [draggedItem, setDraggedItem] = useRecoilState(draggedItemState);
  const [dragPosition, setDraggPosition] = useRecoilState(dragPositionState);
  const { vector3ToGrid, wallLeftVector3ToGrid, wallRightVector3ToGrid } =
    useGrid();
  const [canDrop, setCanDrop] = useState(false);
  const [items, setItems] = useRecoilState(ItemsState);
  const [draggedItemRotation, setDraggedItemRotation] =
    useRecoilState(ItemRotateState);

  // onPlaneClicked 이벤트에 예외처리
  useEffect(() => {
    if (draggedItem === null) {
      return;
    }
    const item = items[draggedItem];
    let droppable = true;
    const thick = item.size[1];

    // 바닥 평면 넘어갔을 때 예외처리
    const width =
      draggedItemRotation === 1 || draggedItemRotation === 3
        ? item.size[2]
        : item.size[0];
    const height =
      draggedItemRotation === 1 || draggedItemRotation === 3
        ? item.size[0]
        : item.size[2];
    if (!item.wall) {
      if (
        dragPosition[0] - width / 2 < 0 ||
        dragPosition[0] + width / 2 > 4.8 / 0.24
      ) {
        droppable = false;
      }
      if (
        dragPosition[2] - height / 2 < 0 ||
        dragPosition[2] + height / 2 > 4.8 / 0.24
      ) {
        droppable = false;
      }
    }
    // 벽면이 외부로 넘어갔을 때 예외처리
    if (item.wall) {
      if (draggedItemRotation) {
        if (
          dragPosition[1] - thick / 2 < -1 ||
          dragPosition[1] + thick / 2 > 16
        ) {
          droppable = false;
        }
        if (
          dragPosition[2] - height / 2 < -1 ||
          dragPosition[2] + height / 2 > 4.8 / 0.24
        ) {
          droppable = false;
        }
      }
      if (
        dragPosition[1] - thick / 2 < -1 ||
        dragPosition[1] + thick / 2 > 16
      ) {
        droppable = false;
      }
      if (
        dragPosition[0] - width / 2 < -1 ||
        dragPosition[0] + width / 2 > 4.8 / 0.24
      ) {
        droppable = false;
      }
    }

    // 다른 물체 예외 처리
    items.forEach((otherItem, idx) => {
      // 드래그 중인 물체면 예외 처리
      if (idx === draggedItem) {
        return;
      }
      // 카펫처럼 쌓을 수 있고 다른 아이템이 벽면에 있는 것이 아닐 경우
      if (otherItem.walkable && !otherItem.wall) {
        return;
      }
      // 다른 물체 크기
      const otherThick = otherItem.size[1];
      const otherWidth =
        otherItem.rotation === 1 || otherItem.rotation === 3
          ? otherItem.size[2]
          : otherItem.size[0];
      const otherHeight =
        otherItem.rotation === 1 || otherItem.rotation === 3
          ? otherItem.size[0]
          : otherItem.size[2];

      // 다른 물체가 왼쪽 벽에 있고, 바닥에 있는 걸 움직일 때
      if (otherItem.wall && !item.wall && otherItem.rotation) {
        if (dragPosition[0] - width / 2 <= 0) {
          if (
            dragPosition[1] + thick > otherItem.gridPosition[1] - thick / 2 &&
            dragPosition[2] + height / 2 >
              otherItem.gridPosition[2] - otherHeight / 2 &&
            dragPosition[2] - height / 2 <
              otherItem.gridPosition[2] + otherHeight / 2
          )
            droppable = false;
        }
      }
      // 다른 물체가 오른쪽 벽에 있고, 바닥에 있는 걸 움직일 때
      if (otherItem.wall && !item.wall && !otherItem.rotation) {
        if (dragPosition[2] - height / 2 <= 0) {
          if (
            dragPosition[1] + thick > otherItem.gridPosition[1] - thick / 2 &&
            dragPosition[0] + width / 2 >
              otherItem.gridPosition[0] - otherWidth / 2 &&
            dragPosition[0] - width / 2 <
              otherItem.gridPosition[0] + otherWidth / 2
          )
            droppable = false;
        }
      }
      // 바닥 평면에 있는 다른 물체가 있을 때,
      if (!item.walkable && !item.wall && !otherItem.wall) {
        if (
          dragPosition[0] + width / 2 >
            otherItem.gridPosition[0] - otherWidth / 2 &&
          dragPosition[0] - width / 2 <
            otherItem.gridPosition[0] + otherWidth / 2 &&
          dragPosition[2] - height / 2 <
            otherItem.gridPosition[2] + otherHeight / 2 &&
          dragPosition[2] + height / 2 >
            otherItem.gridPosition[2] - otherHeight / 2
        ) {
          droppable = false;
        }
      }

      // 왼쪽 벽면에 있는 게 움직일 때, 평면 물체와 비교
      if (item.wall && item.rotation) {
        if (otherItem.gridPosition[0] - otherWidth / 2 <= 0) {
          if (
            dragPosition[1] - thick / 2 < otherThick &&
            dragPosition[2] + height / 2 >
              otherItem.gridPosition[2] - otherHeight / 2 &&
            dragPosition[2] - height / 2 <
              otherItem.gridPosition[2] + otherHeight / 2
          ) {
            droppable = false;
          }
        }
      }
      // 오른쪽 벽면에 있는 게 움직일 때, 평면 물체와 비교
      if (item.wall && !item.rotation) {
        if (otherItem.gridPosition[2] - otherHeight / 2 <= 0) {
          if (
            dragPosition[1] - thick / 2 < otherThick &&
            dragPosition[0] + width / 2 >
              otherItem.gridPosition[0] - otherWidth / 2 &&
            dragPosition[0] - width / 2 <
              otherItem.gridPosition[0] + otherWidth / 2
          ) {
            droppable = false;
          }
        }
      }
      // 벽면에 있는 물체끼리 비교
      if (item.wall && item.rotation && otherItem.wall) {
        if (
          dragPosition[2] + height / 2 >
            otherItem.gridPosition[2] - otherHeight / 2 &&
          dragPosition[2] - height / 2 <
            otherItem.gridPosition[2] + otherHeight / 2 &&
          dragPosition[1] + thick / 2 >
            otherItem.gridPosition[1] - otherThick / 2 &&
          dragPosition[1] - thick / 2 <
            otherItem.gridPosition[1] + otherThick / 2
        ) {
          droppable = false;
        }
      }
      if (item.wall && !item.rotation && otherItem.wall) {
        if (
          dragPosition[0] + width / 2 >
            otherItem.gridPosition[0] - otherWidth / 2 &&
          dragPosition[0] - width / 2 <
            otherItem.gridPosition[0] + otherWidth / 2 &&
          dragPosition[1] + thick / 2 >
            otherItem.gridPosition[1] - otherThick / 2 &&
          dragPosition[1] - thick / 2 <
            otherItem.gridPosition[1] + otherThick / 2
        ) {
          droppable = false;
        }
      }
    });
    setCanDrop(droppable);
  }, [dragPosition, draggedItem, items]);

  // 아이템 클릭 로직
  const renderItem = (item, idx) => {
    const commonProps = {
      key: `${item.name}-${idx}`,
      item: item,
      wall: item.wall,
    };

    if (buildMode) {
      return (
        <Item
          {...commonProps}
          onClick={() => {
            setDraggedItem((prev) => (prev === null ? idx : prev));
            if (draggedItemRotation===null) {
              setDraggedItemRotation(item.rotation);
            }
          }}
          isDragging={draggedItem === idx}
          dragPosition={dragPosition}
          dragRotation={draggedItemRotation}
          canDrop={canDrop}
        />
      );
    }

    return <Item {...commonProps} />;
  };

  // 카메라 관련 로직
  const controls = useRef();
  const state = useThree((state) => state);

  // 편집 모드일 때 카메라 고정
  useEffect(() => {
    if (buildMode) {
      state.camera.position.set(8, 5, 8);
      state.camera.fov = 90;
      state.camera.lookAt(0, 0, 0);
      if (controls.current) {
        controls.current.target.set(0, 0, 0);
        controls.current.update();
      }
    } else {
      state.camera.position.set(8, 5, 8);
      state.camera.fov = 90;
      state.camera.lookAt(0, 0, 0);
      if (controls.current) {
        controls.current.target.set(0, 0, 0);
        controls.current.update();
      }
    }
  }, [buildMode]);

  // 일반 모드일 때 카메라 회전 후 원상복귀
  const animateCameraPosition = () => {
    if (buildMode) return;

    gsap.to(state.camera.position, {
      duration: 0.5,
      x: 8,
      y: 5,
      z: 8,
      onUpdate: () => state.camera.updateProjectionMatrix(),
    });
    setTimeout(() => {
      state.camera.position.set(8, 5, 8);
    }, 50);
  };

  return (
    <>
      <Environment preset="sunset" />
      <ambientLight intensity={0.3} />
      <OrbitControls
        ref={controls}
        minDistance={5}
        maxDistance={20}
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2}
        screenSpacePanning={false}
        enabled={!buildMode}
        // enableRotate={false}
        onEnd={animateCameraPosition}
      />
      {/* <Room name={"office"}/> */}
      {items.map(renderItem)}

      {/* 바닥 평면 */}
      <mesh
        rotation-x={-Math.PI / 2}
        // visible={false}
        position-y={-0.001}
        onPointerMove={(e) => {
          if (!buildMode) {
            return;
          }
          const newPosition = vector3ToGrid(e.point);
          if (
            !dragPosition ||
            newPosition[0] !== dragPosition[0] ||
            newPosition[2] !== dragPosition[2]
          ) {
            setDraggPosition(newPosition);
          }
        }}
      >
        <planeGeometry args={[4.8, 4.8]} />
        <meshStandardMaterial color="#f0f0f0" />
      </mesh>

      {/* 왼쪽 평면 */}
      <mesh
        rotation-y={Math.PI / 2}
        position-x={-2.394}
        // visible={false}
        position-y={1.92}
        onPointerMove={(e) => {
          if (!buildMode) {
            return;
          }
          const newPosition = wallLeftVector3ToGrid(e.point);
          if (
            !dragPosition ||
            newPosition[1] !== dragPosition[1] ||
            newPosition[2] !== dragPosition[2]
          ) {
            setDraggPosition(newPosition);
          }
        }}
      >
        <planeGeometry args={[4.8, 3.84]} />
        <meshStandardMaterial color="#f0f0f0" />
      </mesh>

      {/* 오른쪽 평면 */}
      <mesh
        position-z={-2.394}
        // visible={false}
        position-y={1.92}
        onPointerMove={(e) => {
          if (!buildMode) {
            return;
          }
          const newPosition = wallRightVector3ToGrid(e.point);
          if (
            !dragPosition ||
            newPosition[0] !== dragPosition[0] ||
            newPosition[1] !== dragPosition[1]
          ) {
            setDraggPosition(newPosition);
          }
        }}
      >
        <planeGeometry args={[4.8, 3.84]} />
        <meshStandardMaterial color="#f0f0f0" />
      </mesh>
      {buildMode && (
        <>
          <Grid
            args={[4.8, 4.8]}
            fadeStrength={6}
            sectionSize={2.4}
            cellSize={0.24}
          />
          <Grid
            args={[4.8, 3.84]}
            fadeStrength={6}
            sectionSize={2.4}
            cellSize={0.24}
            position-z={-2.393}
            position-y={1.92}
            rotation-x={Math.PI / 2}
          />
          <Grid
            args={[3.84, 4.8]}
            fadeStrength={6}
            sectionSize={2.4}
            cellSize={0.24}
            position-y={1.92}
            position-x={-2.393}
            rotation-z={-Math.PI / 2}
          />
        </>
      )}
      {draggedItem !== null && buildMode && (
        <Html className={styles.dragbutton}>
          <img
            src="assets/icons/refresh.svg"
            alt=""
            onClick={() => {
              if (items[draggedItem].wall) {
                setDraggedItemRotation(
                  draggedItemRotation === 0 ? 1 : draggedItemRotation - 1
                );
              } else {
                setDraggedItemRotation(
                  draggedItemRotation === 3 ? 0 : draggedItemRotation + 1
                );
              }
            }}
          />
          <img
            src="assets/icons/cross.svg"
            alt=""
            onClick={() => {
              setDraggedItem(null);
              setDraggedItemRotation(null);

            }}
          />
          {canDrop ? (
            <img
              src="assets/icons/check.svg"
              alt=""
              onClick={() => {
                if (draggedItem !== null && dragPosition) {
                  if (canDrop) {
                    setItems((prev) => {
                      const newItems = prev.map((item, index) => {
                        if (index === draggedItem) {
                          return {
                            ...item,
                            gridPosition: dragPosition,
                            rotation: draggedItemRotation,
                          };
                        }
                        return item;
                      });
                      return newItems;
                    });
                  }
                  setDraggedItemRotation(null);
                  setDraggedItem(null);
                }
              }}
            />
          ) : (
            <img src="assets/icons/check.svg" />
          )}
        </Html>
      )}
    </>
  );
};

export default Experience;
