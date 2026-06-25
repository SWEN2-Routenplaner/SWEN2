package at.fhtw.tourplanner.business.model;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Setter;

@Data
@Setter
public class Tour {
    private Long id;
    private String owner;
    private String name;
    private String description;
    private String from;
    private String to;
    private TransportType transportType;
    private Double distance;
    private Long estimatedDuration;
    private String routeInformation;

}
