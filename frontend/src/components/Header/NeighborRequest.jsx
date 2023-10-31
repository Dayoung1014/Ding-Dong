// 라이브러리
import { useEffect, useState } from "react"

// 스타일
import styles from "./Header.module.css"

// 컴포넌트
import RoomBtn from "../Button/Room/RoomBtn"

// API
import {
  fetchNeighrborAdd,
  neighborCheck,
  deleteNeighbor,
} from "@/api/Neighbor"

// 토스트
import { successMsg } from "@/utils/customToast"

const NeighborRequest = () => {
  const [roomId, setRoomId] = useState(window.location.pathname.match(/\d+/g))
  const [neighborFlag, setNeighborFlag] = useState(false)
  const [isAddNeighbor, setIsAddNeighbor] = useState(false)

  useEffect(() => {
    neighborCheck(
      roomId,
      (response) => {
        if (response.data.data == "Y") {
          setNeighborFlag(true)
        }
      },
      (error) => {
        console.log("Error in Neighbor Health Check... ", error)
      }
    )
  })

  // 이웃 추가하는 함수
  const isNeighbor = () => {
    fetchNeighrborAdd(
      roomId,
      (response) => {
        setIsAddNeighbor(false)
        successMsg("✅ 요청에 성공했습니다!")
      },
      (error) => {
        setIsAddNeighbor(false)
        // 1. "이미 요청을 보냈습니다."
        // 2. "이미 이웃입니다."
        console.log(error.response.data.message)
        successMsg(`❌ ${error.response.data.message}`)
      }
    )
  }

  const deleteNeighborByRoomId = () => {
    const input = { roomId: roomId[0] }
    deleteNeighbor(
      input,
      (response) => {
        successMsg("✅ 요청에 성공했습니다!")
      },
      (error) => {
        console.log("Error in delete Neighbor Method ...", error)
      }
    )
  }

  return (
    <>
      <div className={styles.ShareOther}>
        {!neighborFlag ? (
          <RoomBtn img={"addUser"} onClick={() => setIsAddNeighbor(true)} />
        ) : (
          <RoomBtn img={"Neighbor"} onClick={() => setIsAddNeighbor(true)} />
        )}
      </div>

      {isAddNeighbor && (
        <>
          <div
            className={styles.Overlay}
            onClick={() => setIsAddNeighbor(false)}
          />
          <div className={styles.AddNeighbor}>
            <div className={styles.MainContainer}>
              <div className={styles.TitleContainer}>
                <div style={{ color: "#2C2C2C" }}>
                  {neighborFlag
                    ? "이웃을 끊으시겠습니까?"
                    : "이웃 요청을 하시겠습니까?"}
                </div>
              </div>
              <div className={styles.HorizontalLine} />
              <div className={styles.VerticalLine} />
              <div className={styles.ButtonContainer}>
                {neighborFlag ? (
                  <div
                    className={styles.Button}
                    style={{ color: "#049463" }}
                    onClick={() => deleteNeighborByRoomId()}
                  >
                    확인
                  </div>
                ) : (
                  <div
                    className={styles.Button}
                    style={{ color: "#049463" }}
                    onClick={() => isNeighbor()}
                  >
                    확인
                  </div>
                )}

                <div
                  className={styles.Button}
                  style={{ color: "#2C2C2C" }}
                  onClick={() => setIsAddNeighbor(false)}
                >
                  취소
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}

export default NeighborRequest
