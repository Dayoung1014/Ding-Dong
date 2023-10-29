package com.ssafy.dingdong.domain.room.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ssafy.dingdong.domain.member.repository.MemberRepository;
import com.ssafy.dingdong.domain.room.dto.request.RoomUpdateRequestDto;
import com.ssafy.dingdong.domain.room.dto.response.FurnitureDetailDto;
import com.ssafy.dingdong.domain.room.dto.response.FurnitureSummaryDto;
import com.ssafy.dingdong.domain.room.dto.response.RoomResponseDto;
import com.ssafy.dingdong.domain.room.dto.response.RoomScoreDto;
import com.ssafy.dingdong.domain.room.entity.Furniture;
import com.ssafy.dingdong.domain.room.entity.Room;
import com.ssafy.dingdong.domain.room.entity.RoomFurniture;
import com.ssafy.dingdong.domain.room.entity.RoomHeart;
import com.ssafy.dingdong.domain.room.repository.FurnitureRepository;
import com.ssafy.dingdong.domain.room.repository.RoomFurnitureRepository;
import com.ssafy.dingdong.domain.room.repository.RoomHeartRepository;
import com.ssafy.dingdong.domain.room.repository.RoomRepository;
import com.ssafy.dingdong.global.exception.CustomException;
import com.ssafy.dingdong.global.exception.ExceptionStatus;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Log4j2
@Service
@RequiredArgsConstructor
public class RoomServiceImpl implements RoomService {

	private final MemberRepository memberRepository;
	private final RoomRepository roomRepository;
	private final RoomFurnitureRepository roomFurnitureRepository;
	private final FurnitureRepository furnitureRepository;
	private final RoomHeartRepository roomHeartRepository;

	@Override
	@Transactional
	public RoomResponseDto getRoomByMemberId(String memberId) {
		Room findRoom = roomRepository.findByMemberId(memberId).orElseThrow(
			() -> new CustomException(ExceptionStatus.ROOM_NOT_FOUND)
		);
		Long heartCount = roomHeartRepository.getCountByRoomId(findRoom.getRoomId());
		return findRoom.toRoomResponseDto(heartCount);
	}

	@Override
	@Transactional
	public RoomResponseDto getRoomByRoomId(Long roomId) {
		Room findRoom = roomRepository.findByRoomId(roomId).orElseThrow(
			() -> new CustomException(ExceptionStatus.ROOM_NOT_FOUND)
		);
		Long heartCount = roomHeartRepository.getCountByRoomId(findRoom.getRoomId());
		return findRoom.toRoomResponseDto(heartCount);
	}

	@Override
	public Long createRoom(String memberId) {
		Room room = Room.builder()
			.memberId(memberId)
			.build();
		roomRepository.save(room);
		return room.getRoomId();
	}

	@Override
	public Page<FurnitureSummaryDto> getFurnitureList(Pageable pageable) {
		return furnitureRepository.findAllFurnitureSummaryDto(pageable);

	}

	@Override
	public Page<FurnitureSummaryDto> getFurnitureListByCategory(Integer category, Pageable pageable) {
		if (category == 0) {
			return furnitureRepository.findAllFurnitureSummaryDto(pageable);
		}else {
			return furnitureRepository.findAllByCategoryId(category.longValue(), pageable);
		}
	}

	@Override
	public FurnitureDetailDto getFurnitureByFurnitureId(String furnitureId) {
		Furniture furniture = furnitureRepository.findById(furnitureId).orElseThrow(
			() -> new CustomException(ExceptionStatus.FURNITURE_NOT_FOUND)
		);
		return new FurnitureDetailDto(furniture);
	}

	@Override
	@Transactional
	public void updateRoom(RoomUpdateRequestDto roomUpdateRequestDto, String memberId) {
		List<RoomFurniture> roomFurnitureList = getRoomByMemberId(memberId).roomFurnitureList();
		Map<Long, RoomFurniture> roomFurnitureMap = new HashMap<Long, RoomFurniture>();

		roomFurnitureList.stream().forEach(
			roomFurniture -> roomFurnitureMap.put(roomFurniture.getRoomFurnitureId(), roomFurniture)
		);

		Long roomId = roomUpdateRequestDto.getRoomId();
		roomUpdateRequestDto.getUpdateFurnitureList().stream().forEach(
			updateFurniture -> {
				log.info(updateFurniture);
				if (updateFurniture.roomFurnitureId() == -1) {
					RoomFurniture newRoomFurniture = RoomFurniture.builder()
						.roomId(roomId)
						.furnitureId(updateFurniture.furnitureId())
						.xPos(updateFurniture.xPos())
						.yPos(updateFurniture.yPos())
						.zPos(updateFurniture.zPos())
						.rotation(updateFurniture.rotation())
						.build();
					roomFurnitureRepository.save(newRoomFurniture);
				} else {
					RoomFurniture findRoomFurniture = roomFurnitureMap.get(updateFurniture.roomFurnitureId());
					roomFurnitureMap.remove(updateFurniture.roomFurnitureId());

					findRoomFurniture.updateStatus(updateFurniture);
				}
			}
		);
		roomFurnitureRepository.deleteAllById(roomFurnitureMap.keySet());
	}

	@Override
	@Transactional
	public String createHeartRoom(String memberId, Long roomId) {
		roomHeartRepository.findByMemberIdAndRoomId(memberId, roomId)
			.ifPresentOrElse(
				RoomHeart::updateStatus,
				() -> {
					RoomHeart newRecord = RoomHeart.builder()
						.memberId(memberId)
						.roomId(roomId)
						.build();
					roomHeartRepository.save(newRecord);
				}
			);

		return isHeartRoom(memberId, roomId);
	}

	@Override
	@Transactional
	public String isHeartRoom(String memberId, Long roomId) {
		RoomHeart roomHeartInfo = roomHeartRepository.findByMemberIdAndRoomId(memberId, roomId).orElseThrow(
			() -> new CustomException(ExceptionStatus.ROOM_NOT_FOUND)
		);

		if (roomHeartInfo.getCreateTime() != null) {
			return "Y";
		} else {
			return "N";
		}
	}

	@Override
	@Transactional
	public List<RoomScoreDto> getRoomScore() {
		Page<RoomScoreDto> roomScoreList = roomHeartRepository.getHeartRoomScore(PageRequest.of(0, 10));

		roomScoreList.stream().forEach(
			roomScore -> {
				Room room = roomRepository.findByRoomId(roomScore.getRoomId()).orElseThrow(
					() -> new CustomException(ExceptionStatus.ROOM_NOT_FOUND)
				);

				String nickname = memberRepository.getNicknameByMemberId(UUID.fromString(room.getMemberId())).orElseThrow(
					() -> new CustomException(ExceptionStatus.MEMBER_NOT_FOUND)
				);
				roomScore.setMemberId(room.getMemberId());
				roomScore.setNickname(nickname);
			}
		);
		return roomScoreList.stream().toList();
	}

	@Override
	public Long getRoomIdByMemberId(String memberId) {
		Room findRoom = roomRepository.findByMemberId(memberId).orElseThrow(
				() -> new CustomException(ExceptionStatus.ROOM_NOT_FOUND)
		);

		return findRoom.getRoomId();
	}

}
