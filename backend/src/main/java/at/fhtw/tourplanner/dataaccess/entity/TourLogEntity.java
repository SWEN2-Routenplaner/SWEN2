package at.fhtw.tourplanner.dataaccess.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "tour_logs")
public class TourLogEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tour_id", nullable = false)
    private TourEntity tour;

    @Column(nullable = false)
    private LocalDateTime dateTime;

    @Column()
    private String comment;

    @Column(nullable = false)
    private int difficulty;

    @Column(nullable = false)
    private double totalDistance;

    @Column(nullable = false)
    private long totalTime;

    @Column(nullable = false)
    private int rating;
}