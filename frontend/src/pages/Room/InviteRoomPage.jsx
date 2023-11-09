import { Canvas } from "@react-three/fiber"
import Experience from "../../components/Room/Experience"
import { fetchRoomData } from "../../api/User"
import { Suspense, useState, useEffect, useRef } from "react"
import { useRecoilState, useRecoilValue } from "recoil"
import { ItemsState, lightColorState, roomColorState, draggedItemState } from "../../components/Room/Atom"
import InviteFooter from "../../components/Footer/InviteFooter"
import styles from "./RoomPage.module.css"
import InviteHeader from "../../components/Header/InviteHeader"
import { userAtom } from "../../atom/UserAtom"
import { roomInfoAtom } from "@/atom/RoomInfoAtom"
import { useNavigate } from "react-router-dom"

function InviteRoomPage() {
  const navigate = useNavigate()
  const [items, setItems] = useRecoilState(ItemsState)
  const canvasRef = useRef()
  const [nickName, setNickName] = useRecoilState(roomInfoAtom)
  const roomId = window.location.pathname.match(/\d+/g)
  const userInfo = useRecoilValue(userAtom)
  const today = new Date();
  const [time, setTime] = useState();
  const [roomColor, setRoomColor] = useRecoilState(roomColorState);
  const [lightColor, setLightColor] = useRecoilState(lightColorState  );
  const urlPath = import.meta.env.VITE_APP_ROUTER_URL
  const [drag, setDrag] = useRecoilState(draggedItemState);
  const [roomDrag, setRoomDrag] = useState(false);

  const onRoomHandler = (e) => {
    navigate(`${urlPath}/room/${roomId}`);
  } 

  useEffect(() => {
    if (userInfo && userInfo.accessToken !== "") {
      onRoomHandler()
      return
    }
    const roomId = window.location.pathname.match(/\d+/g)

    fetchRoomData(
      roomId,
      (response) => {
        setRoomColor(response.data.data.wallColor);
        setLightColor(response.data.data.lightColor);
        setItems(response.data.data.roomFurnitureList)
        setNickName(response.data.data.nickname)
      },
      (error) => {
        console.error("Error at fetching RoomData...", error)
        if (error.response && error.response.status === 400) {
          navigate(`${urlPath}/notfound`);  
        }
      }
    )
  }, [])

  useEffect(() => {
    const checkTime = today.getHours();

    if (checkTime >= 22 || checkTime < 6) {
      setTime("dawn");
    } else if (checkTime >= 6 && checkTime < 10) {
      // 06시부터 10시까지 morning
      setTime("morning");
    } else if (checkTime >= 10 && checkTime < 18) {
      // 10시부터 18시까지 afternoon
      setTime("afternoon");
    } else {
      // 18시부터 22시까지 dinner
      setTime("dinner");
    }
  }, []);

  // return (
  //   <div className={`${styles.container}`}>
  //     <div className={`${styles.newcanvas} ${styles[time]}`}>
  //       <InviteHeader checkMyRoom={"invite"} />
  //       <Canvas
  //         shadows
  //         gl={{ preserveDrawingBuffer: true, antialias: true }}
  //         camera={{ fov: 40, zoom: 1.0 }}
  //         ref={canvasRef}
  //       >
  //         <Experience setRoomDrag={setRoomDrag}/>
  //       </Canvas>
  //       <InviteFooter props={roomId[0]} />
  //     </div>
  //   </div>
  // )
  return (
    <>
      {roomDrag && <div className={styles.roomDrag} />}
      {time && (
        <div className={`${styles.container}`}>
          <div className={`${styles.newcanvas} ${styles[time]}`} id="newcanvas">
            <Canvas
              className={styles.canvasCont}
              shadows
              dpr={[1, 2]}
              gl={{ preserveDrawingBuffer: true, antialias: true, pixelRatio: Math.min(2, window.devicePixelRatio) }}
              camera={{ fov: 45, zoom: 1.1 }}
              ref={canvasRef}
              flat={true}
            >
              <Experience setRoomDrag={setRoomDrag} />
            </Canvas>
          </div>
          <InviteFooter props={roomId[0]} /> 
        </div>
      )}
    </>
  );
}

export default InviteRoomPage
