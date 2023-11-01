import { useEffect, useState } from "react";
import styles from "./Share.module.css";
import html2canvas from "html2canvas";
import {useRecoilState} from "recoil";
import { textareaAtom } from '../../../atom/TextareaAtom';
// import { handleImageUpload } from "../../../utils/s3Util";

const SharePage = ({shareModal, canvasRef}) => {
  const today = new Date();
  const formattedDate = `${today.getFullYear()}.${today.getMonth() + 1}.${today.getDate()}`;

  const [imageSrc, setImageSrc] = useState();
  const [text, setText] = useRecoilState(textareaAtom);

  const onCapture = async () => {
    html2canvas(document.getElementById("newcanvas")).then(async (canvas) => {
      const croppedCanvas = document.createElement("canvas");
      const ctx = croppedCanvas.getContext("2d");

      // 집 모양의 중심 좌표
      const centerX = canvas.width / 2 + 10; // 집 모양의 중심 x 좌표를 여기에 입력
      const centerY = canvas.height / 2 - 100; // 집 모양의 중심 y 좌표를 여기에 입력

      // 잘라낼 영역의 크기 설정
      const width = centerX * 1.8;
      const height = centerY * 1.35;

      // 중심 좌표를 기준으로 잘라낼 영역의 시작 좌표 계산
      const startX = centerX - width / 2;
      const startY = centerY - height / 2;

      croppedCanvas.width = width;
      croppedCanvas.height = height;

      // 원본 캔버스에서 잘라낼 영역만 croppedCanvas에 그리기
      ctx.drawImage(canvas, startX, startY, width, height, 0, 0, width, height);

      const uploadedImageUrl = await handleImageUpload(croppedCanvas);
      setImageSrc(uploadedImageUrl);
      setImageSrc(croppedCanvas.toDataURL("image/png"));
      // await handleImageUpload(croppedCanvas); 
    });
  };

  useEffect(()=>{
    onCapture();
  },[shareModal])

  return (
    <div className={styles.modalOverlay} id="shareModal">
      <div className={styles.modalContent}>
        <img src={imageSrc} alt="Shared Content" />
        <h2>{formattedDate}</h2>
        <div>
          <textarea className={styles.textarea} placeholder="본인의 이야기를 작성해보세요!" spellCheck="false" maxLength={33} onChange={(e)=>{setText(e.target.value)}}/>
        </div>
      </div>
    </div>
  );
};

export default SharePage;
