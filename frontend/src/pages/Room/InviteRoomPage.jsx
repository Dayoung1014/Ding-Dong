import { Canvas } from "@react-three/fiber";
import Experience from "../../components/Room/Experience";
import { fetchRoomData } from "../../api/User";
import { Suspense, useState, useEffect, useRef } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { ItemsState } from "../../components/Room/Atom";
import InviteFooter from "../../components/Footer/InviteFooter";
import styles from "./RoomPage.module.css";
import Header from "../../components/Header/Header";
import { userAtom } from "../../atom/UserAtom";
import { roomInfoAtom } from "@/atom/RoomInfoAtom";

function InviteRoomPage() {
  const [items, setItems] = useRecoilState(ItemsState);
  const canvasRef = useRef();
  const [nickName, setNickName] = useRecoilState(roomInfoAtom);
  const roomId = window.location.pathname.match(/\d+/g);
  useEffect(() => {
    const roomId = window.location.pathname.match(/\d+/g);

    fetchRoomData(
      roomId,
      (response) => {
        setItems(response.data.data.roomFurnitureList);
        setNickName(response.data.data.nickname);
      },
      (error) => {
        console.error("Error at fetching RoomData...", error);
      }
    );
  }, []);

  return (
    <div className={styles.container}>
      <Header checkMyRoom={"invite"} />
      <Canvas
        shadows
        gl={{ preserveDrawingBuffer: true, antialias: true }}
        camera={{ fov: 40, zoom: 1.2 }}
        ref={canvasRef}
      >
        <color attach="background" args={["skyblue"]} />

        <Experience />
      </Canvas> 
      <InviteFooter props={roomId[0]} />
    </div>
  );
}

export default InviteRoomPage;