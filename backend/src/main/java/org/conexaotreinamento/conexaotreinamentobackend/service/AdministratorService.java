package org.conexaotreinamento.conexaotreinamentobackend.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.conexaotreinamento.conexaotreinamentobackend.dto.request.AdministratorCreateRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.UserCreateRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.PatchAdministratorRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.AdministratorResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.AdministratorListItemResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.UserResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Administrator;
import org.conexaotreinamento.conexaotreinamentobackend.entity.User;
import org.conexaotreinamento.conexaotreinamentobackend.enums.Role;
import org.conexaotreinamento.conexaotreinamentobackend.repository.AdministratorRepository;
import org.conexaotreinamento.conexaotreinamentobackend.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@lombok.extern.slf4j.Slf4j
public class AdministratorService {

    private final AdministratorRepository administratorRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    @Transactional
    public AdministratorListItemResponseDTO create(AdministratorCreateRequestDTO request) {
        log.debug("Attempting to create administrator with email: {}", request.email());
        if (administratorRepository.existsByEmailIgnoreCase(request.email())) {
            log.warn("Administrator creation failed - Email already exists: {}", request.email());
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Administrator with this email already exists");
        }

        UserResponseDTO savedUser = userService.createUser(new UserCreateRequestDTO(request.email(), request.password(), Role.ROLE_ADMIN));
        Administrator administrator = request.toEntity(savedUser.id());
        Administrator savedAdministrator = administratorRepository.save(administrator);
        log.info("Administrator created successfully [ID: {}] - Email: {}", savedAdministrator.getId(), request.email());

        return administratorRepository.findActiveAdministratorProfileById(savedAdministrator.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Created administrator not found"));
    }

    public AdministratorListItemResponseDTO findById(UUID id) {
        log.debug("Finding administrator by ID: {}", id);
        return administratorRepository.findActiveAdministratorProfileById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Administrator not found"));
    }

    public AdministratorListItemResponseDTO findByUserId(UUID id) {
        log.debug("Finding administrator by UserID: {}", id);
        return administratorRepository.findActiveAdministratorByUserId(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Administrator not found"));
    }

    public List<AdministratorListItemResponseDTO> findAll() {
        return administratorRepository.findAllAdministratorProfiles(true);
    }

    public Page<AdministratorListItemResponseDTO> findAll(String search, Pageable pageable, boolean includeInactive) {
        log.debug("Listing administrators - search: {}, includeInactive: {}, page: {}", search, includeInactive, pageable);
        if (pageable.getSort().isUnsorted()) {
            pageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), 
                                    Sort.by("joinDate").descending());
        }
        
        if (search == null || search.isBlank()) {
            return includeInactive ? 
                administratorRepository.findAllAdministratorsPage(pageable) : 
                administratorRepository.findActiveAdministratorsPage(pageable);
        } else {
            String searchTerm = "%" + search.toLowerCase() + "%";
            List<AdministratorListItemResponseDTO> searchResults = includeInactive ? 
                administratorRepository.findBySearchTermIncludingInactive(searchTerm) :
                administratorRepository.findBySearchTermAndActive(searchTerm);
            
            // Convert List to Page for compatibility with existing controller
            int start = (int) pageable.getOffset();
            int end = Math.min((start + pageable.getPageSize()), searchResults.size());
            
            if (start > searchResults.size()) {
                return Page.empty(pageable);
            }
            
            List<AdministratorListItemResponseDTO> pageContent = searchResults.subList(start, end);
            return new org.springframework.data.domain.PageImpl<>(pageContent, pageable, searchResults.size());
        }
    }

    @Transactional
    public AdministratorResponseDTO put(UUID id, AdministratorCreateRequestDTO request) {
        log.debug("Updating administrator (PUT) [ID: {}]", id);
        Administrator administrator = administratorRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Administrator not found"));

        // Always update the associated user's email (mandatory)
        UserResponseDTO updatedUser = userService.updateUserEmail(administrator.getUserId(), request.email());
        
        // Conditionally update password (optional)
        if (request.hasPassword()) {
            userService.resetUserPassword(administrator.getUserId(), request.password());
        }

        // Update administrator fields
        administrator.setFirstName(request.firstName());
        administrator.setLastName(request.lastName());

        Administrator savedAdministrator = administratorRepository.save(administrator);

        // Buscar o User para obter o createdAt e outros dados
        User user = userRepository.findByIdAndDeletedAtIsNull(administrator.getUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        log.info("Administrator updated successfully (PUT) [ID: {}] - Email: {}", id, request.email());
        return AdministratorResponseDTO.fromEntity(savedAdministrator, updatedUser.email(), user.isActive(), user.getCreatedAt(), user.getUpdatedAt());
    }

    @Transactional
    public AdministratorResponseDTO patch(UUID id, PatchAdministratorRequestDTO request) {
        log.debug("Patching administrator [ID: {}]", id);
        Administrator administrator = administratorRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Administrator not found"));

        User user = userRepository.findByIdAndDeletedAtIsNull(administrator.getUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        UserResponseDTO updatedUser = null;

        // Update email if provided
        if (request.email() != null) {
            updatedUser = userService.updateUserEmail(administrator.getUserId(), request.email());
        }

        // Update administrator fields
        if (request.firstName() != null) {
            administrator.setFirstName(request.firstName());
        }
        
        if (request.lastName() != null) {
            administrator.setLastName(request.lastName());
        }

        Administrator savedAdministrator = administratorRepository.save(administrator);

        // Refresh user data if it was updated
        if (updatedUser != null) {
            user = userRepository.findByIdAndDeletedAtIsNull(administrator.getUserId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        }

        log.info("Administrator patched successfully [ID: {}]", id);
        return AdministratorResponseDTO.fromEntity(savedAdministrator, user.getEmail(), user.isActive(), user.getCreatedAt(), user.getUpdatedAt());
    }

    @Transactional
    public void delete(UUID administratorId) {
        log.debug("Deleting administrator [ID: {}]", administratorId);
        Optional<Administrator> administrator = administratorRepository.findById(administratorId);
        administrator.ifPresentOrElse(
            value -> {
                userService.delete(value.getUserId());
                log.info("Administrator deleted successfully [ID: {}]", administratorId);
            },
            () -> log.warn("Administrator deletion attempted for non-existent [ID: {}]", administratorId)
        );
    }

    @Transactional
    public AdministratorResponseDTO restore(UUID administratorId) {
        log.debug("Restoring administrator [ID: {}]", administratorId);
        Administrator administrator = administratorRepository.findById(administratorId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Administrator not found"));
        
        // Reativar o usuário associado
        UserResponseDTO restoredUser = userService.restore(administrator.getUserId());
        
        // Buscar o User atualizado
        User user = userRepository.findById(administrator.getUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        log.info("Administrator restored successfully [ID: {}]", administratorId);
        return AdministratorResponseDTO.fromEntity(
            administrator, 
            user.getEmail(), 
            user.isActive(), 
            user.getCreatedAt(), 
            user.getUpdatedAt()
        );
    }
}