import React, { useEffect } from "react"
import SharingModalListItem from "./SharingModalListItem"
import {
  kakao,
  twitter,
  urlCopy,
  save,
} from "../../../assets/images/sharing/sharingIcon"
// import { useRecoilValue } from 'recoil';
// import { userNicknameAtom } from '../../atoms/userAtoms';
import styles from "./Share.module.css"
import html2canvas from "html2canvas"

function SharingModalList(props) {
  const baseURL = "https://ding-dong.s3.ap-northeast-2.amazonaws.com/"
  // const userNickname = useRecoilValue(userNicknameAtom);
  const url = encodeURI(window.location.href)
  const JS_KEY = import.meta.env.VITE_KAKAO_JS_KEY

  const isSafari = () => {
    const ua = navigator.userAgent.toLowerCase()
    return ua.indexOf("safari") !== -1 && ua.indexOf("chrome") === -1
  }

  const shareUrl = (e) => {
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(window.location.href)
        .then(() => {
          if (props.shareMode === "room") {
            alert(
              // `${userNickname}님의 \n친구들에게 공유해보세요!`
              `우리집 주소가 복사되었습니다.\n친구들에게 공유해보세요!`
            )
          } else if (props.shareMode === "start") {
            alert(
              `우표 테스트 주소가 복사되었습니다.\n친구들에게 공유해보세요!`
            )
          } else if (props.shareMode === "result") {
            alert(
              `우표 테스트 결과가 복사되었습니다.\n친구들에게 공유해보세요!`
            )
          }
        })
        .catch(() => {
          alert(`지원하지 않는 브라우저입니다.\n다른 브라우저로 접속해주세요.`)
        })
    } else {
      if (!document.queryCommandSupported("copy")) {
        return alert("복사하기가 지원되지 않는 브라우저입니다.")
      }

      const textarea = document.createElement("textarea")
      textarea.value = window.location.href

      document.body.appendChild(textarea)
      textarea.focus()
      textarea.select()
      document.execCommand("copy")
      document.body.removeChild(textarea)
      if (props.shareMode === "room") {
        alert()// `${userNickname}님의 편지 수신함이 복사되었습니다.\n친구들에게 공유해보세요!`
        `우리집 주소가 복사되었습니다.\n친구들에게 공유해보세요!`
      } else if (props.shareMode === "start") {
        alert(`우표 테스트 주소가 복사되었습니다.\n친구들에게 공유해보세요!`)
      } else {
        alert(`우표 테스트 결과가 복사되었습니다.\n친구들에게 공유해보세요!`)
      }
    }
    if (props.shareMode === "room") {
      props.setSharingAtom(false)
    }
  }

  const shareTwitter = (e) => {
    if (props.shareMode === "room") {
      const text = "딩동! 우리집에 편지를 보내주세요."
      window.open(
        "https://twitter.com/intent/tweet?text=" + text + "&url=" + url
      )
      props.setSharingAtom(false)
    } else if (props.shareMode === "start") {
      const text = "나에게 어울리는 우표는?"
      window.open(
        "https://twitter.com/intent/tweet?text=" + text + "&url=" + url
      )
    } else if (props.shareMode === "result") {
      const text = "나에게 어울리는 우표 확인하기"
      window.open(
        "https://twitter.com/intent/tweet?text=" + text + "&url=" + url
      )
    }
  }

  const shareKakao = (e) => {
    if (!window.Kakao.isInitialized()) {
      window.Kakao.init(JS_KEY)
    }

    if (props.shareMode === "room") {
      window.Kakao.Share.sendCustom({
        templateId: 100120,
        templateArgs: {
          THU: "https://ding-dong.s3.ap-northeast-2.amazonaws.com/StampLogo.png",
          TITLE: "딩동! 우리집을 방문해보세요.",
          DESC: "우리집에 방문해서 편지를 남겨주세요!",
          MOBILE_LINK: window.location.href,
          WEB_LINK: window.location.href,
        },
      })
    } else if (props.shareMode === "start") {
      window.Kakao.Share.sendCustom({
        templateId: 100120,
        templateArgs: {
          THU: "https://ding-dong.s3.ap-northeast-2.amazonaws.com/StampLogo.png",
          TITLE: "나에게 어울리는 우표는?",
          DESC: "어울리는 우표를 찾아 친구에게 편지를 보내보세요.",
          MOBILE_LINK: window.location.href,
          WEB_LINK: window.location.href,
        },
      })
    } else if (props.shareMode === "result") {
      window.Kakao.Share.sendCustom({
        templateId: 100120,
        templateArgs: {
          THU: `https://ding-dong.s3.ap-northeast-2.amazonaws.com/${props.resultPngUrl}`,
          TITLE: "나에게 어울리는 우표 확인하기",
          DESC: "우표 테스트 결과를 확인해보세요!",
          MOBILE_LINK: window.location.href,
          WEB_LINK: window.location.href,
        },
      })
    }
  }
  const saveImg = (e) => {
    const element = document.getElementById("shareModal")

    html2canvas(element).then((canvas) => {
      const saveImg = (uri, filename) => {
        let link = document.createElement("a")

        document.body.appendChild(link)

        link.href = uri
        link.download = filename
        link.click()

        document.body.removeChild(link)
      }
      saveImg(canvas.toDataURL("image/png"), "ding_dong.png")
    })
  }

  const saveImgTest = (e) => {
    const downloadImage = (uri, filename) => {
      let link = document.createElement("a")
      document.body.appendChild(link)
      link.href = uri
      link.download = filename
      link.click()
      document.body.removeChild(link)
    }
    downloadImage(props.resultPngUrl, "StampResult.png")
  }

  let sharetype = []
  if (props.shareMode === "start") {
    sharetype = [
      { icon: urlCopy, name: "URL복사", click: shareUrl },
      { icon: kakao, name: "카카오톡", click: shareKakao },
      { icon: twitter, name: "트위터", click: shareTwitter },
    ]
  } else if (props.shareMode === "result") {
    sharetype = [
      { icon: urlCopy, name: "URL복사", click: shareUrl },
      { icon: save, name: "저장하기", click: saveImgTest },
      { icon: kakao, name: "카카오톡", click: shareKakao },
      { icon: twitter, name: "트위터", click: shareTwitter },
    ]
  } else {
    sharetype = [
      { icon: urlCopy, name: "URL복사", click: shareUrl },
      { icon: save, name: "저장하기", click: saveImg },
      { icon: kakao, name: "카카오톡", click: shareKakao },
      { icon: twitter, name: "트위터", click: shareTwitter },
    ]
  }

  if (isSafari()) {
    sharetype = [
      { icon: urlCopy, name: "URL복사", click: shareUrl },
      { icon: kakao, name: "카카오톡", click: shareKakao },
      { icon: twitter, name: "트위터", click: shareTwitter },
    ]
  }

  if (props.shareMode === "start" || props.shareMode === "result") {
    return (
      <div className={styles.share}>
        {sharetype.map((share) => (
          <SharingModalListItem
            key={share.name}
            icon={share.icon}
            name={share.name}
            click={share.click}
            className={styles.shareItem}
          />
        ))}
      </div>
    )
  } else if (isSafari()) {
    return (
      <div className={styles.shareRoomSafari}>
        {sharetype.map((share) => (
          <SharingModalListItem
            key={share.name}
            icon={share.icon}
            name={share.name}
            click={share.click}
            className={styles.shareItem}
          />
        ))}
      </div>
    )
  } else {
    return (
      <div className={styles.shareRoom}>
        {sharetype.map((share) => (
          <SharingModalListItem
            key={share.name}
            icon={share.icon}
            name={share.name}
            click={share.click}
            className={styles.shareItem}
          />
        ))}
      </div>
    )
  }
}

export default SharingModalList
