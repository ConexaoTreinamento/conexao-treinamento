package org.conexaotreinamento.conexaotreinamentobackend.persistence.entity;

import java.util.UUID;

import org.conexaotreinamento.conexaotreinamentobackend.persistence.enums.RoleName;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "roles")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)

public class Role {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)

    private UUID id;

    @Enumerated(EnumType.STRING)
    private RoleName name;

    public Role(RoleName name) {
        this.name = name;
    }

}
