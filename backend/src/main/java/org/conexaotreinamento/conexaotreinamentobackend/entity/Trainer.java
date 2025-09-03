package org.conexaotreinamento.conexaotreinamentobackend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import org.conexaotreinamento.conexaotreinamentobackend.enums.CompensationType;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "trainers")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
public class Trainer {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    @Setter
    private UUID userId;

    @Column(name = "name", nullable = false, length = 120)
    @Setter
    private String name;

    @Column(name = "phone")
    @Setter
    private String phone;

    @Column(name = "specialties", columnDefinition = "text[]")
    @Setter
    private List<String> specialties;

    @Column(name = "compensation_type")
    @Enumerated(EnumType.STRING)
    @Setter
    private CompensationType compensationType;
}
