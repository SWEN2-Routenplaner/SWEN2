package at.fhtw.tourplanner.business.service;

import at.fhtw.tourplanner.business.model.TransportType;
import at.fhtw.tourplanner.dataaccess.entity.TourEntity;
import at.fhtw.tourplanner.dataaccess.repository.TourLogRepository;
import at.fhtw.tourplanner.dataaccess.repository.TourRepository;
import at.fhtw.tourplanner.exception.ResourceNotFoundException;
import at.fhtw.tourplanner.presentation.dto.request.TourCreateRequest;
import at.fhtw.tourplanner.presentation.dto.response.TourResponse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.nio.file.AccessDeniedException;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TourServiceTest {

    @Mock TourRepository tourRepository;
    @Mock RouteService routeService;
    @Mock TourLogRepository tourLogRepository;
    @Mock ImageStorageService imageStorageService;
    @Mock TourImportExportService tourImportExportService;

    @InjectMocks TourService tourService;

    /*
    / Helpers
     */

    private TourEntity makeTour(Long id, String owner) {
        TourEntity t = new TourEntity();
        t.setId(id);
        t.setOwner(owner);
        t.setName("Test Tour");
        t.setDescription("A description");
        t.setFromLocation("Vienna");
        t.setToLocation("Graz");
        t.setTransportType(TransportType.CAR);
        t.setDistance(100.0);
        t.setEstimatedTime(3600L);
        t.setRouteInformation("some route info");
        return t;
    }

    /*
     listTours
     */

    // Test 1
    @Test
    void listTours_nullQuery_callsFindAllByOwner() {
        when(tourRepository.findAllByOwner("user1")).thenReturn(List.of(makeTour(1L, "user1")));

        List<TourResponse> result = tourService.listTours("user1", null);

        assertThat(result).hasSize(1);
        verify(tourRepository).findAllByOwner("user1");
        verify(tourRepository, never()).searchByOwner(any(), any());
    }

    // Test 2
    @Test
    void listTours_blankQuery_callsFindAllByOwner() {
        when(tourRepository.findAllByOwner("user1")).thenReturn(List.of());

        List<TourResponse> result = tourService.listTours("user1", "   ");

        assertThat(result).isEmpty();
        verify(tourRepository).findAllByOwner("user1");
        verify(tourRepository, never()).searchByOwner(any(), any());
    }

    // Test 3
    @Test
    void listTours_withQuery_callsSearchByOwner() {
        when(tourRepository.searchByOwner("user1", "vienna"))
                .thenReturn(List.of(makeTour(1L, "user1"), makeTour(2L, "user1")));

        List<TourResponse> result = tourService.listTours("user1", "vienna");

        assertThat(result).hasSize(2);
        verify(tourRepository).searchByOwner("user1", "vienna");
        verify(tourRepository, never()).findAllByOwner(any());
    }

    /*
    / createTour
     */

    // Test 4
    @Test
    void createTour_routeSucceeds_savesEntityAndReturnsMappedResponse() throws Exception {
        TourCreateRequest req = new TourCreateRequest("My Tour", "nice", "Vienna", "Graz", TransportType.BIKE);
        TourEntity saved = makeTour(42L, "user1");
        when(tourRepository.save(any())).thenReturn(saved);

        TourResponse result = tourService.createTour("user1", req);

        assertThat(result.id()).isEqualTo(42L);
        assertThat(result.name()).isEqualTo("Test Tour");
        verify(routeService).createRoute(any());
        verify(tourRepository).save(any());
    }

    // Test 5
    @Test
    void createTour_routeServiceThrows_savesWithPlaceholders() throws Exception {
        TourCreateRequest req = new TourCreateRequest("Tour", "desc", "A", "B", TransportType.WALK);
        doThrow(new RuntimeException("ORS unreachable")).when(routeService).createRoute(any());

        TourEntity saved = makeTour(1L, "user1");
        saved.setDistance(0.0);
        saved.setEstimatedTime(0L);
        when(tourRepository.save(any())).thenReturn(saved);

        TourResponse result = tourService.createTour("user1", req);

        assertThat(result.distance()).isEqualTo(0.0);
        verify(tourRepository).save(any());
    }


    /*
    / getTour
     */

    // Test 6
    @Test
    void getTour_existingTourCorrectOwner_returnsMappedResponse() throws AccessDeniedException {
        when(tourRepository.findById(1L)).thenReturn(Optional.of(makeTour(1L, "user1")));

        TourResponse result = tourService.getTour("user1", 1L);

        assertThat(result.id()).isEqualTo(1L);
        assertThat(result.name()).isEqualTo("Test Tour");
    }

    // Test 7
    @Test
    void getTour_tourNotFound_throwsResourceNotFoundException() {
        when(tourRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> tourService.getTour("user1", 99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("99");
    }

    // Test 8
    @Test
    void getTour_wrongOwner_throwsAccessDeniedException() {
        when(tourRepository.findById(1L)).thenReturn(Optional.of(makeTour(1L, "owner-a")));

        assertThatThrownBy(() -> tourService.getTour("owner-b", 1L))
                .isInstanceOf(AccessDeniedException.class);
    }

    /*
    / updateTour
     */

    // Test 9
    @Test
    void updateTour_correctOwner_appliesChangesAndSaves() throws Exception {
        TourEntity existing = makeTour(1L, "user1");
        when(tourRepository.findById(1L)).thenReturn(Optional.of(existing));

        TourEntity updated = makeTour(1L, "user1");
        updated.setName("Updated Name");
        updated.setFromLocation("Linz");
        when(tourRepository.save(existing)).thenReturn(updated);

        TourCreateRequest req = new TourCreateRequest("Updated Name", "new desc", "Linz", "Salzburg", TransportType.CAR);
        TourResponse result = tourService.updateTour("user1", 1L, req);

        assertThat(result.name()).isEqualTo("Updated Name");
        verify(tourRepository).save(existing);
    }

    /*
    / deleteTour
     */

    // Test 10
    @Test
    void deleteTour_correctOwner_deletesById() throws AccessDeniedException {
        TourEntity t = makeTour(1L, "user1");
        when(tourRepository.findById(1L)).thenReturn(Optional.of(t));

        tourService.deleteTour("user1", 1L);

        verify(tourRepository).deleteById(1L);
    }

    // Test 11
    @Test
    void deleteTour_tourNotFound_throwsResourceNotFoundException() {
        when(tourRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> tourService.deleteTour("user1", 99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("99");
    }

    /*
    / getImage
     */

    // Test 12
    @Test
    void getImage_noImagePath_throwsResponseStatusException() {
        TourEntity t = makeTour(1L, "user1");
        t.setImagePath(null);
        when(tourRepository.findById(1L)).thenReturn(Optional.of(t));

        assertThatThrownBy(() -> tourService.getImage("user1", 1L))
                .isInstanceOf(ResponseStatusException.class);
    }
}
