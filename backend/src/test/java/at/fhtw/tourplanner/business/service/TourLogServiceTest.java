package at.fhtw.tourplanner.business.service;

import at.fhtw.tourplanner.dataaccess.entity.TourEntity;
import at.fhtw.tourplanner.dataaccess.entity.TourLogEntity;
import at.fhtw.tourplanner.dataaccess.repository.TourLogRepository;
import at.fhtw.tourplanner.dataaccess.repository.TourRepository;
import at.fhtw.tourplanner.exception.ResourceNotFoundException;
import at.fhtw.tourplanner.presentation.dto.request.TourLogCreateRequest;
import at.fhtw.tourplanner.presentation.dto.response.TourLogResponse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TourLogServiceTest {

    @Mock TourLogRepository tourLogRepository;
    @Mock TourRepository tourRepository;

    @InjectMocks TourLogService tourLogService;

    /*
    / Helpers
     */

    private TourEntity makeTour(Long id) {
        TourEntity t = new TourEntity();
        t.setId(id);
        t.setOwner("user1");
        t.setName("Tour");
        return t;
    }

    private TourLogEntity makeLog(Long logId, TourEntity tour) {
        TourLogEntity e = new TourLogEntity();
        e.setId(logId);
        e.setTour(tour);
        e.setDateTime(LocalDateTime.of(2025, 6, 1, 10, 0));
        e.setComment("great hike");
        e.setDifficulty(3);
        e.setTotalDistance(12.5);
        e.setTotalTime(7200L);
        e.setRating(4);
        return e;
    }

    /*
    / listLogs
     */

    // Test 1
    @Test
    void listLogs_tourExists_returnsMappedResponses() {
        when(tourRepository.existsById(1L)).thenReturn(true);
        TourEntity t = makeTour(1L);
        when(tourLogRepository.findAllByTourId(1L))
                .thenReturn(List.of(makeLog(10L, t), makeLog(11L, t)));

        List<TourLogResponse> result = tourLogService.listLogs("user1", 1L);

        assertThat(result).hasSize(2);
        assertThat(result.get(0).id()).isEqualTo(10L);
        assertThat(result.get(1).id()).isEqualTo(11L);
    }

    // Test 2
    @Test
    void listLogs_tourNotFound_throwsResourceNotFoundException() {
        when(tourRepository.existsById(99L)).thenReturn(false);

        assertThatThrownBy(() -> tourLogService.listLogs("user1", 99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("99");
    }

    /*
    / createLog
     */

    // Test 3
    @Test
    void createLog_tourExists_savesAndReturnsMappedResponse() {
        TourEntity t = makeTour(1L);
        when(tourRepository.findById(1L)).thenReturn(Optional.of(t));

        TourLogCreateRequest req = new TourLogCreateRequest(
                LocalDateTime.of(2025, 7, 1, 8, 0), "fun trip", 2, 5.0, 3600L, 5);
        TourLogEntity saved = makeLog(20L, t);
        when(tourLogRepository.save(any())).thenReturn(saved);

        TourLogResponse result = tourLogService.createLog("user1", 1L, req);

        assertThat(result.id()).isEqualTo(20L);
        assertThat(result.tourId()).isEqualTo(1L);
        verify(tourLogRepository).save(any());
    }

    // Test 4
    @Test
    void createLog_tourNotFound_throwsResourceNotFoundException() {
        when(tourRepository.findById(99L)).thenReturn(Optional.empty());

        TourLogCreateRequest req = new TourLogCreateRequest(
                LocalDateTime.now(), "comment", 3, 5.0, 1800L, 3);

        assertThatThrownBy(() -> tourLogService.createLog("user1", 99L, req))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("99");
    }

    /*
    / getLog
     */

    // Test 5
    @Test
    void getLog_logFound_returnsMappedResponse() {
        TourEntity t = makeTour(1L);
        when(tourLogRepository.findById(10L)).thenReturn(Optional.of(makeLog(10L, t)));

        TourLogResponse result = tourLogService.getLog("user1", 10L);

        assertThat(result.id()).isEqualTo(10L);
        assertThat(result.comment()).isEqualTo("great hike");
        assertThat(result.difficulty()).isEqualTo(3);
        assertThat(result.rating()).isEqualTo(4);
        assertThat(result.totalDistance()).isEqualTo(12.5);
    }

    // Test 6
    @Test
    void getLog_logNotFound_throwsResourceNotFoundException() {
        when(tourLogRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> tourLogService.getLog("user1", 999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("999");
    }

    /*
    / updateLog
     */

    // Test 7
    @Test
    void updateLog_logFound_appliesChangesAndSaves() {
        TourEntity t = makeTour(1L);
        TourLogEntity existing = makeLog(10L, t);
        when(tourLogRepository.findById(10L)).thenReturn(Optional.of(existing));

        TourLogEntity updatedEntity = makeLog(10L, t);
        updatedEntity.setComment("updated comment");
        updatedEntity.setDifficulty(5);
        updatedEntity.setRating(5);
        when(tourLogRepository.save(existing)).thenReturn(updatedEntity);

        TourLogCreateRequest req = new TourLogCreateRequest(
                LocalDateTime.of(2025, 8, 1, 9, 0), "updated comment", 5, 20.0, 7200L, 5);

        TourLogResponse result = tourLogService.updateLog("user1", 10L, req);

        assertThat(result.comment()).isEqualTo("updated comment");
        assertThat(result.difficulty()).isEqualTo(5);
        assertThat(result.rating()).isEqualTo(5);
        verify(tourLogRepository).save(existing);
    }

    /*
    / deleteLog
     */

    // Test 8
    @Test
    void deleteLog_logFound_deletesById() {
        TourEntity t = makeTour(1L);
        when(tourLogRepository.findById(10L)).thenReturn(Optional.of(makeLog(10L, t)));

        tourLogService.deleteLog("user1", 10L);

        verify(tourLogRepository).deleteById(10L);
    }
}
