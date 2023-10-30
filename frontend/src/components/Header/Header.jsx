// 라이브러리
import { useState } from "react"
import { useRecoilValue } from "recoil"

// 스타일
import styles from "./Header.module.css"

// 이미지
import hamburger from "/assets/icons/hamburgerbar.svg"
import bell from "/assets/icons/bell.svg"

// Atom
import { userAtom } from "../../atom/UserAtom"
import { roomInfoAtom } from "../../atom/RoomInfoAtom"

const Header = ({ checkMyRoom }) => {
  // 햄버거메뉴바 상태관리
  const [isHamburger, setIsHamburger] = useState(false)

  // 유저정보
  const userInfo = useRecoilValue(userAtom)
  const roomInfo = useRecoilValue(roomInfoAtom)

  // 알림함수
  const alarmHandler = () => {
    console.log("알림창")
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
        <div className={styles.header}>
          <img
            src={hamburger}
            alt=""
            onClick={() => setIsHamburger(true)}
            className={styles.HamburgerButton}
          />
          {checkMyRoom === "my" ? (
            <div className={styles.userName}>{userInfo.nickname}</div>
          ) : (
            <div className={styles.userName}>{roomInfo}</div>
          )}
          <img src={bell} alt="" onClick={alarmHandler} />
        </div>
      </div>
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
    </>
  )
}

export default Header
