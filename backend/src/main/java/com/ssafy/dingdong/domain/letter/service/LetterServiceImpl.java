package com.ssafy.dingdong.domain.letter.service;

import com.ssafy.dingdong.domain.letter.dto.request.LetterRequestDto;
import com.ssafy.dingdong.domain.letter.dto.response.LetterListResponseDto;
import com.ssafy.dingdong.domain.letter.dto.response.LetterResponseDto;
import com.ssafy.dingdong.domain.letter.entity.Letter;
import com.ssafy.dingdong.domain.letter.entity.Stamp;
import com.ssafy.dingdong.domain.letter.repository.LetterRepository;
import com.ssafy.dingdong.domain.letter.repository.StampRepository;
import com.ssafy.dingdong.global.exception.CustomException;
import com.ssafy.dingdong.global.exception.ExceptionStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.util.List;

@Log4j2
@Service
@RequiredArgsConstructor
public class LetterServiceImpl implements LetterService {

    private final LetterRepository letterRepository;
    private final StampRepository stampRepository;

    @Override
    public Page<LetterListResponseDto> getLetterList(String memberId, Pageable pageable) {
        Page<LetterListResponseDto> result = letterRepository.findAllByLetterTo(memberId, pageable);

        return result;
    }

    @Override
    public LetterResponseDto getLetterDetail(String memberId, Long letterId) {
        LetterResponseDto result = letterRepository.findByLetterId(memberId, letterId)
                .orElseThrow(() -> new CustomException(ExceptionStatus.LETTER_NOT_FOUND));

        updateReadLetter(letterId);

        return result;
    }

    @Override
    public void sendLetter(String memberId, LetterRequestDto requestDto) {
        Stamp stamp = stampRepository.findById(requestDto.stampId())
                .orElseThrow(() -> new CustomException(ExceptionStatus.NOT_FOUND_STAMP));

        Letter letter = Letter.build(requestDto, memberId,false, stamp, "");
        letterRepository.save(letter);
    }

    @Override
    public void sendGuestLetter(LetterRequestDto requestDto, String ipAddress, String memberId) {
        Stamp stamp = stampRepository.findById(requestDto.stampId())
                .orElseThrow(() -> new CustomException(ExceptionStatus.NOT_FOUND_STAMP));

        Letter letter = Letter.build(requestDto, memberId, true, stamp, ipAddress);
        letterRepository.save(letter);
    }

    public void updateReadLetter(Long letterId) {
        letterRepository.updateIsReadById(letterId);
    }
}
