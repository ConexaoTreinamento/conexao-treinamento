package org.conexaotreinamento.conexaotreinamentobackend.service;

import java.util.List;
import java.util.UUID;

import org.conexaotreinamento.conexaotreinamentobackend.dto.request.AdministratorCreateRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.PatchAdministratorRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.request.UserCreateRequestDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.AdministratorListItemResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.AdministratorResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.dto.response.UserResponseDTO;
import org.conexaotreinamento.conexaotreinamentobackend.entity.Administrator;
import org.conexaotreinamento.conexaotreinamentobackend.entity.User;
import org.conexaotreinamento.conexaotreinamentobackend.enums.Role;
import org.conexaotreinamento.conexaotreinamentobackend.mapper.AdministratorMapper;
import org.conexaotreinamento.conexaotreinamentobackend.repository.AdministratorRepository;
import org.conexaotreinamento.conexaotreinamentobackend.repository.UserRepository;
import org.conexaotreinamento.conexaotreinamentobackend.shared.dto.PageResponse;
import org.conexaotreinamento.conexaotreinamentobackend.shared.exception.ResourceNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Service for managing Administrator entities and their associated Users.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AdministratorService {

    private final AdministratorRepository administratorRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final AdministratorMapper administratorMapper;
    private final AdministratorValidationService validationService;

    /**
     * Creates a new administrator with associated user account.
     * 
     * @param request Administrator creation request
     * @return Created administrator details
     */
    public AdministratorListItemResponseDTO create(AdministratorCreateRequestDTO request) {
        log.info("Creating administrator: {} - {}", request.firstName(), request.email());
        
        // Validate email uniqueness
        validationService.validateEmailUniqueness(request.email());
        
        // Create associated user
        UserResponseDTO savedUser = userService.createUser(
                new UserCreateRequestDTO(request.email(), request.password(), Role.ROLE_ADMIN)
        );
        log.debug("User created for administrator [ID: {}] - Email: {}", savedUser.id(), request.email());
        
        // Create administrator
        Administrator administrator = administratorMapper.toEntity(request, savedUser.id());
        Administrator savedAdministrator = administratorRepository.save(administrator);
        
        log.info("Administrator created successfully [ID: {}] - Name: {} {}", 
                savedAdministrator.getId(), savedAdministrator.getFirstName(), savedAdministrator.getLastName());
        
        return administratorRepository.findActiveAdministratorProfileById(savedAdministrator.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Administrator", savedAdministrator.getId()));
    }

    /**
     * Finds an administrator by ID.
     * 
     * @param id Administrator ID
     * @return Administrator details
     * @throws ResourceNotFoundException if administrator not found
     */
    public AdministratorListItemResponseDTO findById(UUID id) {
        log.debug("Finding administrator by ID: {}", id);
        return administratorRepository.findActiveAdministratorProfileById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Administrator", id));
    }

    /**
     * Finds an administrator by their associated user ID.
     * 
     * @param userId User ID
     * @return Administrator details
     * @throws ResourceNotFoundException if administrator not found
     */
    public AdministratorListItemResponseDTO findByUserId(UUID userId) {
        log.debug("Finding administrator by user ID: {}", userId);
        return administratorRepository.findActiveAdministratorByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Administrator", "userId", userId));
    }

    /**
     * Finds all active administrators.
     * 
     * @return List of all administrators
     */
    public List<AdministratorListItemResponseDTO> findAll() {
        log.debug("Finding all administrators");
        List<AdministratorListItemResponseDTO> admins = administratorRepository.findAllAdministratorProfiles(true);
        log.debug("Found {} administrators", admins.size());
        return admins;
    }

    /**
     * Finds all administrators with pagination and optional search.
     * 
     * @param search Search term (optional)
     * @param pageable Pagination parameters
     * @param includeInactive Whether to include soft-deleted administrators
     * @return Paginated list of administrators
     */
    public PageResponse<AdministratorListItemResponseDTO> findAll(String search, Pageable pageable, boolean includeInactive) {
        log.debug("Listing administrators - search: {}, includeInactive: {}, page: {}", search, includeInactive, pageable);
        
        // Apply default sorting if none provided
        if (pageable.getSort().isUnsorted()) {
            pageable = PageRequest.of(
                    pageable.getPageNumber(), 
                    pageable.getPageSize(), 
                    Sort.by("joinDate").descending()
            );
        }
        
        Page<AdministratorListItemResponseDTO> result;
        
        if (search == null || search.isBlank()) {
            result = includeInactive 
                    ? administratorRepository.findAllAdministratorsPage(pageable) 
                    : administratorRepository.findActiveAdministratorsPage(pageable);
        } else {
            String searchTerm = "%" + search.toLowerCase() + "%";
            List<AdministratorListItemResponseDTO> searchResults = includeInactive 
                    ? administratorRepository.findBySearchTermIncludingInactive(searchTerm)
                    : administratorRepository.findBySearchTermAndActive(searchTerm);
            
            // Convert List to Page
            int start = (int) pageable.getOffset();
            int end = Math.min((start + pageable.getPageSize()), searchResults.size());
            
            if (start > searchResults.size()) {
                result = Page.empty(pageable);
            } else {
                List<AdministratorListItemResponseDTO> pageContent = searchResults.subList(start, end);
                result = new org.springframework.data.domain.PageImpl<>(pageContent, pageable, searchResults.size());
            }
        }
        
        log.debug("Found {} administrators", result.getTotalElements());
        return PageResponse.of(result);
    }

    /**
     * Updates an administrator (full replacement).
     * 
     * @param id Administrator ID
     * @param request Administrator update request
     * @return Updated administrator details
     * @throws ResourceNotFoundException if administrator not found
     */
    public AdministratorResponseDTO update(UUID id, AdministratorCreateRequestDTO request) {
        log.info("Updating administrator [ID: {}]", id);
        
        Administrator administrator = findEntityById(id);
        
        // Validate email uniqueness if changed
        User user = userRepository.findById(administrator.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", administrator.getUserId()));
        
        if (!user.getEmail().equalsIgnoreCase(request.email())) {
            validationService.validateEmailUniqueness(request.email(), administrator.getUserId());
        }
        
        // Update user email
        UserResponseDTO updatedUser = userService.updateUserEmail(administrator.getUserId(), request.email());
        
        // Update password if provided
        if (request.hasPassword()) {
            userService.resetUserPassword(administrator.getUserId(), request.password());
        }
        
        // Update administrator fields
        administratorMapper.updateEntity(request, administrator);
        Administrator savedAdministrator = administratorRepository.save(administrator);
        
        // Refresh user data
        user = userRepository.findById(administrator.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", administrator.getUserId()));
        
        log.info("Administrator updated successfully [ID: {}]", id);
        return administratorMapper.toResponse(savedAdministrator, user.getEmail(), user.isActive(), 
                user.getCreatedAt(), user.getUpdatedAt());
    }

    /**
     * Partially updates an administrator.
     * 
     * @param id Administrator ID
     * @param request Partial administrator update request
     * @return Updated administrator details
     * @throws ResourceNotFoundException if administrator not found
     */
    public AdministratorResponseDTO patch(UUID id, PatchAdministratorRequestDTO request) {
        log.info("Patching administrator [ID: {}]", id);
        
        Administrator administrator = findEntityById(id);
        User user = userRepository.findById(administrator.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", administrator.getUserId()));
        
        // Update email if provided and validate uniqueness
        if (request.email() != null && !user.getEmail().equalsIgnoreCase(request.email())) {
            validationService.validateEmailUniqueness(request.email(), administrator.getUserId());
            userService.updateUserEmail(administrator.getUserId(), request.email());
        }
        
        // Update administrator fields
        administratorMapper.patchEntity(request, administrator);
        Administrator savedAdministrator = administratorRepository.save(administrator);
        
        // Refresh user data
        user = userRepository.findById(administrator.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", administrator.getUserId()));
        
        log.info("Administrator patched successfully [ID: {}]", id);
        return administratorMapper.toResponse(savedAdministrator, user.getEmail(), user.isActive(), 
                user.getCreatedAt(), user.getUpdatedAt());
    }

    /**
     * Soft deletes an administrator and their associated user.
     * 
     * @param administratorId Administrator ID
     * @throws ResourceNotFoundException if administrator not found
     */
    public void delete(UUID administratorId) {
        log.info("Deleting administrator [ID: {}]", administratorId);
        
        Administrator administrator = findEntityById(administratorId);
        userService.delete(administrator.getUserId());
        
        log.info("Administrator deleted successfully [ID: {}]", administratorId);
    }

    /**
     * Restores a soft-deleted administrator.
     * 
     * @param administratorId Administrator ID
     * @return Restored administrator details
     * @throws ResourceNotFoundException if administrator not found
     */
    public AdministratorResponseDTO restore(UUID administratorId) {
        log.info("Restoring administrator [ID: {}]", administratorId);
        
        Administrator administrator = administratorRepository.findById(administratorId)
                .orElseThrow(() -> new ResourceNotFoundException("Administrator", administratorId));
        
        // Restore associated user
        userService.restore(administrator.getUserId());
        
        // Fetch updated user data
        User user = userRepository.findById(administrator.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", administrator.getUserId()));
        
        log.info("Administrator restored successfully [ID: {}]", administratorId);
        return administratorMapper.toResponse(administrator, user.getEmail(), user.isActive(), 
                user.getCreatedAt(), user.getUpdatedAt());
    }

    /**
     * Finds an administrator entity by ID (active only).
     * 
     * @param id Administrator ID
     * @return Administrator entity
     * @throws ResourceNotFoundException if administrator not found
     */
    private Administrator findEntityById(UUID id) {
        return administratorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Administrator", id));
    }
}