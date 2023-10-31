// 라이브러리
import { useEffect, useState } from "react"
import { useRecoilValue } from "recoil"

// 스타일
import styles from "./Header.module.css"

// 이미지
import hamburger from "/assets/icons/hamburgerbar.svg"
import bell from "/assets/icons/bell.png"

// 컴포넌트
import NeighborAcceptModal from "../Modal/Neighbor/NeighborAcceptModal"
import RoomBtn from "../Button/Room/RoomBtn"
import NeighborListModal from "../Modal/Neighbor/NeighborListModal"

// Atom
import { userAtom } from "../../atom/UserAtom"
import { roomInfoAtom } from "../../atom/RoomInfoAtom"

// API
import {
  fetchNeighborRequest,
  responseNeighborRequest,
  fetchNeighborList,
  deleteNeighbor,
} from "../../api/Neighbor"

const Header = ({ checkMyRoom }) => {
  // 햄버거메뉴바 상태관리
  const [isHamburger, setIsHamburger] = useState(false)
  // 알림 상태관리
  const [isAlarm, setIsAlarm] = useState(false)
  // 알림 리스트 상태관리
  const [alarms, setAlarms] = useState([])
  // 알림 리스트 길이 상태관리
  const [alarmsLength, setAlarmsLength] = useState(0)
  // 이웃리스트 모달 상태관리
  const [isNeighborList, setIsNeighborList] = useState(false)
  // 이웃리스트 상태관리
  const [neighborList, setNeighborList] = useState([])
  // 이웃리스트 리스트 길이 상태관리
  const [neighborListLength, setNeighborListLength] = useState(0)
  // 이웃리스트 이웃제거 모달 상태관리
  const [removeNeighborList, setRemoveNeighborList] = useState(false)
  // 제거하려는 이웃 아이디 상태관리
  const [removeNeighborId, setRemoveNeighborId] = useState(0)

  // 유저정보
  const userInfo = useRecoilValue(userAtom)
  const roomInfo = useRecoilValue(roomInfoAtom)

  // 유저요청 가져오기
  useEffect(() => {
    // 이웃 리스트
    fetchNeighborList(
      (success) => {
        setNeighborList(success.data.data)
        setNeighborListLength(success.data.data.length)
      },
      (error) => {
        console.log("Error at neighbor list...", error)
      }
    )
    // 이웃요청 리스트
    fetchNeighborRequest(
      (success) => {
        setAlarmsLength(success.data.data.length)
        setAlarms(success.data.data)
      },
      (error) => {
        console.log("Error at neighbor request...", error)
      }
    )
  }, [])

  // 알림 함수
  const alarmHandler = () => {
    if (alarmsLength === 0) {
      setIsAlarm(true)
    } else {
      setIsAlarm(true)
    }
  }

  // 이웃요청 수락함수
  const acceptNeighborHandler = (id) => {
    responseNeighborRequest(
      { flag: "Y", neighborId: id },
      (response) => {
        setAlarmsLength(alarmsLength - 1)
        setAlarms((prev) => prev.filter((alarm) => alarm.neighborId !== id))
      },
      (error) => {
        console.log("Error in ResponseNeighborRequest ...", error)
      }
    )
  }

  // 이웃요청 거절함수
  const refuseNeighborHandler = (id) => {
    responseNeighborRequest(
      { flag: "N", neighborId: id },
      (response) => {
        setAlarmsLength(alarmsLength - 1)
        setAlarms((prev) => prev.filter((alarm) => alarm.neighborId !== id))
      },
      (error) => {
        console.log("Error in ResponseNeighborRequest ...", error)
      }
    )
  }

  // 이웃 리스트 - 집 방문 함수
  const goNeighborHomeHandler = (roomId) => {
    window.location.replace(`/room/${roomId}`)
  }

  // 이웃 리스트 - 이웃 삭제 모달 함수
  const removeNeighorCheckHandler = (memberId) => {
    setRemoveNeighborList(true)
    setRemoveNeighborId(memberId)
  }

  // 이웃 리스트 - 이웃 삭제 함수
  const removeNeighborHandler = (memberId) => {
    deleteNeighbor(
      { memberId: memberId },
      (response) => {
        setNeighborList((prev) =>
          prev.filter((item) => item.memberId !== memberId)
        )
      },
      (error) => {
        console.log("Error with Delete Neighbor...", error)
      }
    )
  }

  // 문의하기 함수
  const inquiryHandler = () => {
    console.log("문의하기")
  }

  // 로그아웃 함수
  const logoutHandler = () => {
    console.log("로그아웃")
  }

  // 회원탈퇴 함수
  const withdrawalHandler = () => {
    console.log("회원탈퇴")
  }

  return (
    <>
      <div className={styles.wrap}>
        <div
          className={
            checkMyRoom === "invite" ? styles.inviteHeader : styles.header
          }
        >
          {checkMyRoom === "invite" ? (
            <div className={styles.userName}>{roomInfo}</div>
          ) : (
            <>
              <img
                src={hamburger}
                onClick={() => setIsHamburger(true)}
                className={styles.HamburgerButton}
              />
              <div className={styles.userName}>
                {checkMyRoom === "my" ? userInfo.nickname : roomInfo}
              </div>
              <img src={bell} onClick={alarmHandler} />
            </>
          )}
        </div>
      </div>

      {/* 이웃 리스트 */}
      {checkMyRoom === "my" && (
        <div className={styles.NeighborList}>
          <RoomBtn
            img={"neighborList"}
            onClick={() => setIsNeighborList(true)}
          />
        </div>
      )}

      {/* 이웃 리스트 모달 */}
      {isNeighborList && (
        <>
          <div
            className={styles.Overlay}
            onClick={() => setIsNeighborList(false)}
          />
          <div className={styles.NeighborListContainer}>
            <div className={styles.xButtonContainer}>
              <img
                src={"/assets/icons/x.png"}
                className={styles.AlarmX}
                onClick={() => setIsNeighborList(false)}
              />
            </div>
            {neighborListLength !== 0 ? (
              <div className={styles.NeighborItemContainer}>
                {neighborList.map((item) => (
                  <div key={item.memberId}>
                    <NeighborListModal
                      imgName={item.avatarId}
                      nickname={item.nickname}
                      gohome={() => goNeighborHomeHandler(item.roomId)}
                      remove={removeNeighorCheckHandler}
                      status={item.isActive}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.NoAlarm}>이웃이 없습니다!</div>
            )}
          </div>
        </>
      )}

      {/* 햄버거 바 */}
      {isHamburger && (
        <>
          <div
            className={styles.Overlay}
            onClick={() => setIsHamburger(false)}
          />
          <div className={styles.HamburgerModal}>
            <div className={styles.ContentContainer}>
              <div className={styles.MenuButton} onClick={inquiryHandler}>
                문의하기
              </div>
              <div className={styles.MenuButton} onClick={logoutHandler}>
                로그아웃
              </div>
              <div className={styles.MenuButton} onClick={withdrawalHandler}>
                회원탈퇴
              </div>
            </div>
          </div>
        </>
      )}

      {/* 알림 */}
      {isAlarm && (
        <>
          <div className={styles.Overlay} onClick={() => setIsAlarm(false)} />
          <div className={styles.AlarmContainer}>
            <div className={styles.xButtonContainer}>
              <img
                src={"/assets/icons/x.png"}
                className={styles.AlarmX}
                onClick={() => setIsAlarm(false)}
              />
            </div>
            {alarmsLength !== 0 ? (
              <div className={styles.alarmListContainer}>
                {alarms.map((alarm) => (
                  <div key={alarm.neighborId} className={styles.AlarmModal}>
                    <NeighborAcceptModal
                      content={alarm.nickname}
                      okClick={() => acceptNeighborHandler(alarm.neighborId)}
                      cancelClick={() =>
                        refuseNeighborHandler(alarm.neighborId)
                      }
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.NoAlarm}>알림이 없습니다!</div>
            )}
          </div>
        </>
      )}

      {/* 이웃리스트의 아이템 제거를 물어보는 모달 */}
      {removeNeighborList && (
        <>
          <div
            className={styles.RemoveOverlay}
            onClick={() => setRemoveNeighborList(false)}
          />
          <div>제거 모달</div>
        </>
      )}
    </>
  )
}

export default Header
