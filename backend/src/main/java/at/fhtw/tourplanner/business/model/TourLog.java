package at.fhtw.tourplanner.business.model;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;

import java.time.LocalDateTime;

// Min/Max values are caught at the presentation layer through the dto's
@Data
public class TourLog {
    private Long id;
    private Long tourId;
    private LocalDateTime dateTime;
    private String comment;
    private Integer difficulty;
    private Double totalDistance;
    private Long totalTime;
    private Integer rating;
}
