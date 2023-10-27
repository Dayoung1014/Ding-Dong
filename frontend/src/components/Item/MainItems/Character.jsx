import React, { useState, useRef, useEffect, useCallback } from "react"
import { useFrame, useThree, useLoader } from "@react-three/fiber"
import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { useRecoilValue, useSetRecoilState } from "recoil"
import { CharacterPositionAtom } from "../../../atom/DefaultSettingAtom"
import { ArriveAtom } from "../../../atom/SinglePlayAtom"
import { isPickedAtom } from "../../../atom/TutorialAtom"

const Character = () => {
  // Three.js 기본 설정
  const {
    camera,
    scene,
    gl: { domElement },
  } = useThree()

  // 캐릭터
  const characterRef = useRef()
  const character = useLoader(GLTFLoader, "assets/models/characters/f_7.glb")

  // 애니메이션
  const mixerRef = useRef()
  const actions = useRef([])
  useEffect(() => {
    if (character.animations && character.animations.length > 0) {
      mixerRef.current = new THREE.AnimationMixer(character.scene)
      actions.current = character.animations.map((clip) =>
        mixerRef.current.clipAction(clip)
      )
    }
  }, [character])

  // 그림자 생성
  character.scene.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true
    }
  })

  // 공통
  const setCharacterPosition = useSetRecoilState(CharacterPositionAtom)
  const [position, setPosition] = useState(new THREE.Vector3(0, 0, 0))
  const [destination, setDestination] = useState(new THREE.Vector3(0, 0, 0))

  // 튜토리얼 우표 수집
  const isPicked = useRecoilValue(isPickedAtom)

  // 움직임 제어 및 카메라 선형 보간
  const isArrived = useRecoilValue(ArriveAtom)
  useFrame((_, delta) => {
    if (mixerRef.current) {
      mixerRef.current.update(delta)
    }

    if (characterRef.current) {
      const distance = position.distanceTo(destination)

      // 싱글 플레이
      if (isArrived) {
        setDestination(position)
      }

      // 튜토리얼
      if (isPicked) {
        actions.current[1].stop()
        actions.current[0].stop()
        actions.current[5].play()
        setDestination(position)
      } else {
        actions.current[5].stop()
      }

      // 캐릭터 이동
      if (!isPicked && distance > 0.05) {
        // 목적지까지의 거리가 0.05보다 크면 이동
        actions.current[1].play()
        actions.current[0].stop()

        // 이동 방향을 계산하여 캐릭터의 위치를 업데이트
        const angle = Math.atan2(
          destination.z - position.z,
          destination.x - position.x
        )
        const speed = 0.07 // 캐릭터의 이동 속도
        position.x += Math.cos(angle) * speed
        position.z += Math.sin(angle) * speed
        setPosition(position.clone())

        // 카메라 트렉킹을 위해 현재 캐릭터 위치 정보 저장
        setCharacterPosition([
          position.clone().x,
          position.clone().y,
          position.clone().z,
        ])
      }
      // 캐릭터 정지
      else {
        actions.current[1].stop()
        actions.current[0].play()
      }
    }
  })

  // 마우스 및 터치 이벤트 처리
  const mouse = useRef(new THREE.Vector2())
  const raycaster = useRef(new THREE.Raycaster())

  // 마우스 및 터치 이벤트에 따른 목적지 업데이트
  const handlePositionChange = useCallback(
    (e) => {
      const event = e.type.startsWith("touch") ? e.touches[0] : e
      const rect = domElement.getBoundingClientRect()
      mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      // 카메라와 마우스 및 터치 위치를 기반으로 레이캐스터를 설정
      raycaster.current.setFromCamera(mouse.current, camera)

      // 바닥(Map)과 교차점을 계산
      const floorMeshes = scene.children.filter(
        (child) => child.name === "floor"
      )
      const intersects = raycaster.current.intersectObjects(floorMeshes, true)

      // 교차점이 있다면, 그 위치를 목적지로 설정
      if (intersects.length > 0) {
        setDestination(intersects[0].point) // 가장 가까운 교차점을 선택
        if (characterRef.current) {
          // 캐릭터이 마우스 및 터치 위치를 정면으로 바라보도록 설정
          characterRef.current.lookAt(intersects[0].point)
        }
      }
    },
    [camera, domElement, scene]
  )

  // 마우스 및 터치 여부
  const [isPressed, setIsPressed] = useState(false)

  // 마우스 및 터치 이벤트 리스너를 추가
  useEffect(() => {
    const handleMouseDownOrTouchStart = (e) => {
      setIsPressed(true)
      handlePositionChange(e)
    }
    const handleMouseMoveOrTouchMove = (e) => {
      if (isPressed) {
        handlePositionChange(e)
      }
    }

    domElement.addEventListener("mousedown", handleMouseDownOrTouchStart)
    domElement.addEventListener("touchstart", handleMouseDownOrTouchStart)
    domElement.addEventListener("mousemove", handleMouseMoveOrTouchMove)
    domElement.addEventListener("touchmove", handleMouseMoveOrTouchMove)
    domElement.addEventListener("mouseup", () => setIsPressed(false))
    domElement.addEventListener("touchend", () => setIsPressed(false))

    return () => {
      domElement.removeEventListener("mousedown", handleMouseDownOrTouchStart)
      domElement.removeEventListener("touchstart", handleMouseDownOrTouchStart)
      domElement.removeEventListener("mousemove", handleMouseMoveOrTouchMove)
      domElement.removeEventListener("touchmove", handleMouseMoveOrTouchMove)
      domElement.removeEventListener("mouseup", () => setIsPressed(false))
      domElement.removeEventListener("touchend", () => setIsPressed(false))
    }
  }, [domElement, handlePositionChange, isPressed])

  return (
    <primitive
      ref={characterRef}
      object={character.scene}
      position={position.toArray()}
    />
  )
}

export default Character
