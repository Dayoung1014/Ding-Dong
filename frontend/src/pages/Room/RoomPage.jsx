import { Canvas } from "@react-three/fiber";
import { Html, PerspectiveCamera } from "@react-three/drei";
import Experience from "../../components/Room/Experience";
import { fetchRoomData } from "../../api/User";
import { Suspense, useState, useEffect, useRef } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  ItemRotateState,
  ItemsState,
  buildModeState,
  draggedItemState,
} from "../../components/Room/Atom"
import { popUpStatusAtom } from "../../atom/RoomCustomTabAtom"

import Header from "../../components/Header/Header"
import MyFooter from "../../components/Footer/MyFooter"
import Share from "../../components/Header/Share"
import OtherFooter from "../../components/Footer/OtherFooter"
import NeighborRequest from "../../components/Header/NeighborRequest"
import styles from "./RoomPage.module.css"
import PopUp from "../../components/Room/RoomCustomPopUp/PopUp"

function RoomPage() {
  const [editMode, setEditMode] = useRecoilState(buildModeState);
  const [isMyRoom, setIsMyRoom] = useState(false);
  const [drag,setDrag] = useRecoilState(draggedItemState);
  const popUpStatus = useRecoilValue(popUpStatusAtom);

  useEffect(() => {
    fetchRoomData().then((response) => {
      if (response.data.isMyRoom) {
        setIsMyRoom(true);
      }
    });
  }, []);

  return (
    <div className={styles.container}>
      <Header />
      {isMyRoom ? <NeighborRequest /> : <Share canvasRef={canvasRef}/>}

      <div
        className={styles.button}
        onClick={() => {
          setEditMode(!editMode);
          if (drag) {
            setDrag(null);
          }
        }}
      >
        {editMode && <span>편집모드</span>}
        {!editMode && <span>관광모드</span>}
      </div>

      <Canvas
        shadows
        gl={{ preserveDrawingBuffer: true, antialias: true }}
        camera={{ fov: 45 }}
        ref={canvasRef}
      >
        <color attach="background" args={["skyblue"]} />
        <Suspense
          fallback={
            <Html>
              <div>껄껄껄 로딩중이란다 하하하ㅏ</div>
            </Html>
          }
        >
          <Experience />
        </Suspense>
      </Canvas>
      {isMyRoom ? <MyFooter /> : <OtherFooter />}
      {/* {popUpStatus ? <PopUp/> : '' } */}
      <PopUp/>
    </div>
  );
}

export default RoomPage;
