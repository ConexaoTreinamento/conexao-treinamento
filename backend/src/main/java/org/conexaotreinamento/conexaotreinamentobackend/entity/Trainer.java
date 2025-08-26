package org.conexaotreinamento.conexaotreinamentobackend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import org.conexaotreinamento.conexaotreinamentobackend.entity.enums.CompensationType;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "trainers")
@EntityListeners(AuditingEntityListener.class)
@Getter
@NoArgsConstructor
public class Trainer {

    @Id
    private UUID id;

    @Column(nullable = false, length = 120)
    @Setter
    private String name;

    @Column(length = 255)
    @Setter
    private String email;

    @Column(length = 255)
    @Setter
    private String phone;

    @Column(name = "specialties")
    @Setter
    private List<String> specialties;

    @Column(name = "compensation_type")
    @Setter
    private CompensationType compensationType;
}
