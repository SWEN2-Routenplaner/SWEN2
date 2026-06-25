package at.fhtw.tourplanner.business.service;

import at.fhtw.tourplanner.business.mapper.TourLogMapper;
import at.fhtw.tourplanner.business.model.TourLog;
import at.fhtw.tourplanner.dataaccess.repository.TourLogRepository;
import at.fhtw.tourplanner.dataaccess.repository.TourRepository;
import at.fhtw.tourplanner.exception.ResourceNotFoundException;
import at.fhtw.tourplanner.presentation.dto.request.TourLogCreateRequest;
import at.fhtw.tourplanner.presentation.dto.response.TourLogResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TourLogService {

    private final TourLogRepository tourLogRepository;
    private final TourRepository tourRepository;
    private final TourLogMapper tourLogMapper;

    public List<TourLogResponse> listLogs(String owner, Long tourId) {
        verifyTourExists(tourId);
        return tourLogRepository.findAllByTourId(tourId)
                .stream().map(tourLogMapper::toResponse).toList();
    }

    public TourLogResponse createLog(String owner, Long tourId, @Valid TourLogCreateRequest request) {
        verifyTourExists(tourId);
        TourLog log = tourLogMapper.toDomain(request);
        log.setTourId(tourId);
        TourLog saved = tourLogRepository.save(log);
        return tourLogMapper.toResponse(saved);
    }

    public TourLogResponse getLog(String owner, Long tourId, Long logId) {
        verifyTourExists(tourId);
        return tourLogMapper.toResponse(findLog(tourId, logId));
    }

    public TourLogResponse updateLog(String owner, Long tourId, Long logId, @Valid TourLogCreateRequest request) {
        verifyTourExists(tourId);
        TourLog existing = findLog(tourId, logId);
        tourLogMapper.updateDomain(existing, request);
        TourLog saved = tourLogRepository.save(existing);
        return tourLogMapper.toResponse(saved);
    }

    public void deleteLog(String owner, Long tourId, Long logId) {
        verifyTourExists(tourId);
        TourLog log = findLog(tourId, logId);
        tourLogRepository.deleteById(log.getId());
    }

    // TODO: ADD image update

    /*
    * HELPER
    * */

    // it could be possible that a tour no longer exists
    // (although it shouldn't, since the db should cascade a deleted)
    private void verifyTourExists(Long tourId) {
        if(!tourRepository.existsById(tourId)){
            throw new ResourceNotFoundException("Tour not found with id: " + tourId);
        }
    }

    // TODO: consider removing the tourId since logId is unique
    private TourLog findLog(Long tourId, Long logId) {
        TourLog tour = tourLogRepository.findbyIdAndTourId(logId, tourId);
        if(tour != null){
            return tour;
        }else{
            throw new ResourceNotFoundException("TourLog not found with id: " + logId);
        }
    }

}
